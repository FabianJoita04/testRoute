using Google.OrTools.ConstraintSolver;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using RouteOptimizer.API.Dto;
using RouteOptimizer.API.Interfaces;
using RouteOptimizer.Core.Entities;
using RouteOptimizer.Infrastructure.Data;

namespace RouteOptimizer.API.Services
{
    public class RouteOptimizationService(ApplicationDbContext context, ILogger<RouteOptimizationService> logger) : IRouteOptimizationService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<RouteOptimizationService> _logger = logger;
        private const double EARTH_RADIUS_KM = 6371.0;

        public async Task<RouteOptimizationResult> OptimizeRouteAsync(RouteOptimizationRequest request)
        {
            try
            {
                _logger.LogInformation("Starting route optimization with {StopCount} stops", request.RequiredStops.Count);

                // Step 1: Optimize stop order
                var optimizedStops = await OptimizeStopOrderAsync(request.RequiredStops);

                // Step 2: Generate path between optimized stops
                var optimizedPath = await GeneratePathBetweenStops(optimizedStops);

                // Step 3: Calculate metrics
                var totalDistance = CalculatePathDistance(optimizedPath);
                var estimatedTime = EstimateTravelTime(totalDistance);
                var estimatedCost = CalculateOperationalCost(totalDistance, estimatedTime);
                var coverageScore = await CalculateRouteCoverageAsync(optimizedPath);

                return new RouteOptimizationResult
                {
                    Success = true,
                    OptimizedStops = optimizedStops,
                    OptimizedPath = optimizedPath,
                    TotalDistance = totalDistance,
                    EstimatedTravelTime = estimatedTime,
                    EstimatedCost = estimatedCost,
                    CoverageScore = coverageScore
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during route optimization");
                return new RouteOptimizationResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<List<RouteOptimizationResult>> GenerateRouteAlternativesAsync(RouteOptimizationRequest request, int numberOfAlternatives = 3)
        {
            var alternatives = new List<RouteOptimizationResult>();

            for (int i = 0; i < numberOfAlternatives; i++)
            {
                // Create variations of the request for different alternatives
                var modifiedRequest = CreateAlternativeRequest(request, i);
                var result = await OptimizeRouteAsync(modifiedRequest);

                if (result.Success)
                {
                    alternatives.Add(result);
                }
            }

            // Sort by different criteria for variety
            return alternatives.OrderBy(a => a.TotalDistance).ToList();
        }

        public async Task<RouteAnalysisResult> AnalyzeExistingRouteAsync(int routeId)
        {
            var route = await _context.BusRoutes
                .Include(r => r.BusStops)
                .FirstOrDefaultAsync(r => r.Id == routeId);

            if (route == null)
            {
                throw new ArgumentException($"Route {routeId} not found");
            }

            // Calculate efficiency metrics
            var distance = CalculatePathDistance(route.Path);
            var coverage = await CalculateRouteCoverageAsync(route.Path);
            var costPerKm = distance > 0 ? route.OperationalCost / (decimal)distance : 0;

            // Analyze passenger data (simplified - would use real historical data)
            var avgPassengers = await EstimateAveragePassengers(routeId);

            // Generate improvement suggestions
            var suggestions = await GenerateImprovementSuggestions(route);

            return new RouteAnalysisResult
            {
                RouteId = routeId,
                EfficiencyScore = CalculateEfficiencyScore(distance, route.EstimatedTravelTime, coverage),
                CoverageScore = coverage,
                CostPerKm = costPerKm,
                AveragePassengersPerDay = avgPassengers,
                ImprovementSuggestions = suggestions
            };
        }

        public async Task<List<Point>> OptimizeStopOrderAsync(List<Point> stops)
        {
            if (stops.Count <= 2) return stops;

            try
            {
                // Use Google OR-Tools for TSP (Traveling Salesman Problem)
                var manager = new RoutingIndexManager(stops.Count, 1, 0);
                var routing = new RoutingModel(manager);

                // Create distance matrix
                var distanceMatrix = CreateDistanceMatrix(stops);

                var transitCallbackIndex = routing.RegisterTransitCallback((long fromIndex, long toIndex) =>
                {
                    var fromNode = manager.IndexToNode(fromIndex);
                    var toNode = manager.IndexToNode(toIndex);
                    return distanceMatrix[fromNode][toNode];
                });

                routing.SetArcCostEvaluatorOfAllVehicles(transitCallbackIndex);

                // Set search parameters
                var searchParameters = operations_research_constraint_solver.DefaultRoutingSearchParameters();
                searchParameters.FirstSolutionStrategy = FirstSolutionStrategy.Types.Value.PathCheapestArc;
                searchParameters.LocalSearchMetaheuristic = LocalSearchMetaheuristic.Types.Value.GuidedLocalSearch;
                searchParameters.TimeLimit = new Google.Protobuf.WellKnownTypes.Duration { Seconds = 30 };

                // Solve
                var solution = routing.SolveWithParameters(searchParameters);

                if (solution != null)
                {
                    var optimizedStops = new List<Point>();
                    var index = routing.Start(0);

                    while (!routing.IsEnd(index))
                    {
                        optimizedStops.Add(stops[manager.IndexToNode(index)]);
                        index = solution.Value(routing.NextVar(index));
                    }

                    return optimizedStops;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in TSP optimization, falling back to nearest neighbor");
            }

            // Fallback: Simple nearest neighbor algorithm
            return OptimizeWithNearestNeighbor(stops);
        }

        public async Task<double> CalculateRouteCoverageAsync(LineString routePath, double radiusMeters = 500)
        {
            try
            {
                // Get population density data within the route's buffer zone
                var bufferedRoute = routePath.Buffer(radiusMeters / 111000.0); // Rough conversion to degrees

                // Query bus stops within coverage area
                var coveredStops = await _context.BusStops
                    .Where(s => s.Location.Intersects(bufferedRoute))
                    .CountAsync();

                var totalStops = await _context.BusStops.CountAsync();

                return totalStops > 0 ? (double)coveredStops / totalStops : 0.0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating route coverage");
                return 0.0;
            }
        }

        public async Task<List<BusStop>> FindOptimalStopLocationsAsync(Polygon serviceArea, int maxStops)
        {
            // This is a simplified implementation
            // In practice, you'd use more sophisticated algorithms considering:
            // - Population density
            // - Points of interest
            // - Existing infrastructure
            // - Accessibility requirements

            var existingStops = await _context.BusStops
                .Where(s => s.Location.Intersects(serviceArea))
                .ToListAsync();

            // Use k-means clustering approach to find optimal locations
            var optimalLocations = new List<BusStop>();

            // Simplified: place stops at regular intervals along service area perimeter
            var envelope = serviceArea.EnvelopeInternal;
            var stepX = (envelope.MaxX - envelope.MinX) / Math.Sqrt(maxStops);
            var stepY = (envelope.MaxY - envelope.MinY) / Math.Sqrt(maxStops);

            for (double x = envelope.MinX; x <= envelope.MaxX && optimalLocations.Count < maxStops; x += stepX)
            {
                for (double y = envelope.MinY; y <= envelope.MaxY && optimalLocations.Count < maxStops; y += stepY)
                {
                    var point = new Point(x, y) { SRID = 4326 };
                    if (serviceArea.Contains(point))
                    {
                        optimalLocations.Add(new BusStop
                        {
                            Name = $"Proposed Stop {optimalLocations.Count + 1}",
                            Location = point,
                            ZoneType = "proposed"
                        });
                    }
                }
            }

            return optimalLocations;
        }

        #region Private Helper Methods

        private RouteOptimizationRequest CreateAlternativeRequest(RouteOptimizationRequest original, int variant)
        {
            var alternative = new RouteOptimizationRequest
            {
                RequiredStops = new List<Point>(original.RequiredStops),
                StartPoint = original.StartPoint,
                EndPoint = original.EndPoint,
                MaxRouteLength = original.MaxRouteLength,
                MaxTravelTime = original.MaxTravelTime
            };

            // Create variations based on different optimization goals
            switch (variant)
            {
                case 0:
                    alternative.OptimizationGoal = "minimize_time";
                    break;
                case 1:
                    alternative.OptimizationGoal = "minimize_distance";
                    break;
                case 2:
                    alternative.OptimizationGoal = "maximize_coverage";
                    break;
            }

            return alternative;
        }

        private async Task<LineString> GeneratePathBetweenStops(List<Point> stops)
        {
            if (stops.Count < 2)
                throw new ArgumentException("At least 2 stops required to generate a path");

            var coordinates = stops.Select(s => new Coordinate(s.X, s.Y)).ToArray();
            return new LineString(coordinates) { SRID = 4326 };
        }

        private double CalculatePathDistance(LineString path)
        {
            if (path == null || path.Coordinates.Length < 2) return 0;

            double totalDistance = 0;
            for (int i = 0; i < path.Coordinates.Length - 1; i++)
            {
                totalDistance += CalculateHaversineDistance(
                    path.Coordinates[i].Y, path.Coordinates[i].X,
                    path.Coordinates[i + 1].Y, path.Coordinates[i + 1].X);
            }

            return totalDistance;
        }

        private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return EARTH_RADIUS_KM * c;
        }

        private double ToRadians(double degrees) => degrees * Math.PI / 180;

        private int EstimateTravelTime(double distanceKm)
        {
            // Simplified: assume average speed of 25 km/h in urban areas
            const double averageSpeedKmh = 25.0;
            return (int)Math.Ceiling((distanceKm / averageSpeedKmh) * 60); // Convert to minutes
        }

        private decimal CalculateOperationalCost(double distanceKm, int timeMinutes)
        {
            // Simplified cost calculation
            const decimal costPerKm = 2.5m; // Fuel, maintenance, etc.
            const decimal costPerMinute = 0.5m; // Driver wages, etc.

            return (decimal)distanceKm * costPerKm + timeMinutes * costPerMinute;
        }

        private long[][] CreateDistanceMatrix(List<Point> points)
        {
            var matrix = new long[points.Count][];

            for (int i = 0; i < points.Count; i++)
            {
                matrix[i] = new long[points.Count];
                for (int j = 0; j < points.Count; j++)
                {
                    if (i == j)
                    {
                        matrix[i][j] = 0;
                    }
                    else
                    {
                        var distance = CalculateHaversineDistance(
                            points[i].Y, points[i].X,
                            points[j].Y, points[j].X);
                        matrix[i][j] = (long)(distance * 1000); // Convert to meters
                    }
                }
            }

            return matrix;
        }

        private List<Point> OptimizeWithNearestNeighbor(List<Point> stops)
        {
            if (stops.Count <= 1) return stops;

            var optimized = new List<Point>();
            var remaining = new List<Point>(stops);
            var current = remaining[0];

            optimized.Add(current);
            remaining.Remove(current);

            while (remaining.Any())
            {
                var nearest = remaining.OrderBy(p =>
                    CalculateHaversineDistance(current.Y, current.X, p.Y, p.X))
                    .First();

                optimized.Add(nearest);
                remaining.Remove(nearest);
                current = nearest;
            }

            return optimized;
        }

        private double CalculateEfficiencyScore(double distance, int travelTime, double coverage)
        {
            // Normalized efficiency score (0-100)
            var distanceScore = Math.Max(0, 100 - (distance / 50 * 100)); // Penalty for long routes
            var timeScore = Math.Max(0, 100 - (travelTime / 120.0 * 100)); // Penalty for long times
            var coverageScore = coverage * 100;

            return (distanceScore + timeScore + coverageScore) / 3.0;
        }

        private async Task<int> EstimateAveragePassengers(int routeId)
        {
            // Simplified estimation - in practice, use historical ridership data
            var tripRequests = await _context.TripRequests
                .Where(t => t.SelectedRouteId == routeId)
                .CountAsync();

            return Math.Max(50, tripRequests / 30); // Rough daily average
        }

        private async Task<List<string>> GenerateImprovementSuggestions(BusRoute route)
        {
            var suggestions = new List<string>();

            // Analyze route characteristics and suggest improvements
            var distance = CalculatePathDistance(route.Path);

            if (distance > 40)
                suggestions.Add("Consider splitting this route into two shorter routes for better efficiency");

            if (route.BusStops.Count < 5)
                suggestions.Add("Route may benefit from additional stops to improve coverage");

            if (route.BusStops.Count > 20)
                suggestions.Add("Consider reducing number of stops to improve travel time");

            return suggestions;
        }

        #endregion
    }
}
