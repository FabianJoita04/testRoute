using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using RouteOptimizer.API.Dto;
using RouteOptimizer.API.Interfaces;
using RouteOptimizer.Core.Entities;
using RouteOptimizer.Infrastructure.Data;

namespace RouteOptimizer.API.Services
{
    public class TripPlanningService(ApplicationDbContext context, ILogger<TripPlanningService> logger) : ITripPlanningService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<TripPlanningService> _logger = logger;
        private const double EARTH_RADIUS_KM = 6371.0;
        private const double WALKING_SPEED_MS = 1.4; // 1.4 m/s average walking speed
        private const int MAX_WALKING_TIME_MINUTES = 15;

        public async Task<List<TripOption>> PlanTripAsync(TripPlanRequest request)
        {
            try
            {
                _logger.LogInformation("Planning trip from {Origin} to {Destination}",
                    $"{request.Origin.Y},{request.Origin.X}", $"{request.Destination.Y},{request.Destination.X}");

                var tripOptions = new List<TripOption>();

                // Find nearby bus stops for origin and destination
                var originStops = await FindNearbyStopsAsync(request.Origin, request.Preferences.MaxWalkingDistanceMeters);
                var destinationStops = await FindNearbyStopsAsync(request.Destination, request.Preferences.MaxWalkingDistanceMeters);

                if (!originStops.Any() || !destinationStops.Any())
                {
                    _logger.LogWarning("No nearby bus stops found for trip planning");
                    return tripOptions;
                }

                // Find direct routes (no transfers)
                var directOptions = await FindDirectRoutes(request, originStops, destinationStops);
                tripOptions.AddRange(directOptions);

                // Find routes with one transfer
                var transferOptions = await FindRoutesWithTransfers(request, originStops, destinationStops, 1);
                tripOptions.AddRange(transferOptions);

                // Sort and filter options based on preferences
                tripOptions = FilterAndSortOptions(tripOptions, request.Preferences);

                // Limit to top 3 options
                return tripOptions.Take(3).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error planning trip");
                return new List<TripOption>();
            }
        }

        public async Task<TripOption?> GetOptimalTripAsync(TripPlanRequest request)
        {
            var options = await PlanTripAsync(request);
            return options.FirstOrDefault();
        }

        public async Task<List<BusStop>> FindNearbyStopsAsync(Point location, double radiusMeters = 500)
        {
            try
            {
                // Create a buffer around the location (rough conversion from meters to degrees)
                var radiusDegrees = radiusMeters / 111000.0; // Approximate conversion
                var searchArea = location.Buffer(radiusDegrees);

                var nearbyStops = await _context.BusStops
                    .Where(s => s.IsActive && s.Location.Intersects(searchArea))
                    .OrderBy(s => s.Location.Distance(location))
                    .Take(10)
                    .ToListAsync();

                return nearbyStops;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding nearby stops");
                return new List<BusStop>();
            }
        }

        public async Task<List<RealTimeUpdate>> GetRealTimeUpdatesAsync(int routeId)
        {
            try
            {
                // In a real implementation, this would connect to GPS tracking systems
                var buses = await _context.Buses
                    .Where(b => b.CurrentRouteId == routeId && b.IsActive)
                    .ToListAsync();

                var updates = buses.Select(bus => new RealTimeUpdate
                {
                    RouteId = routeId,
                    BusId = bus.Id,
                    CurrentLocation = bus.CurrentLocation ?? new Point(0, 0) { SRID = 4326 },
                    DelayMinutes = 0, // Would be calculated from real GPS data
                    LastUpdated = DateTime.UtcNow,
                    Status = "on_time"
                }).ToList();

                return updates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting real-time updates for route {RouteId}", routeId);
                return new List<RealTimeUpdate>();
            }
        }

        public async Task<TripOption> UpdateTripWithRealTimeDataAsync(TripOption trip)
        {
            try
            {
                foreach (var segment in trip.Segments.Where(s => s.Type == "bus" && s.RouteId.HasValue))
                {
                    var updates = await GetRealTimeUpdatesAsync(segment.RouteId.Value);
                    var relevantUpdate = updates.FirstOrDefault();

                    if (relevantUpdate != null && relevantUpdate.DelayMinutes > 0)
                    {
                        // Update segment times with delay
                        segment.StartTime = segment.StartTime.AddMinutes(relevantUpdate.DelayMinutes);
                        segment.EndTime = segment.EndTime.AddMinutes(relevantUpdate.DelayMinutes);
                        segment.DurationMinutes += relevantUpdate.DelayMinutes;
                    }
                }

                // Recalculate total trip time
                trip.TotalTravelTimeMinutes = trip.Segments.Sum(s => s.DurationMinutes);
                trip.ArrivalTime = trip.DepartureTime.AddMinutes(trip.TotalTravelTimeMinutes);

                return trip;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating trip with real-time data");
                return trip;
            }
        }

        public async Task<bool> SaveTripRequestAsync(int userId, TripPlanRequest request, string? selectedTripId = null)
        {
            try
            {
                var tripRequest = new TripRequest
                {
                    UserId = userId,
                    OriginPoint = request.Origin,
                    DestinationPoint = request.Destination,
                    RequestedTime = request.DepartureTime,
                    Preferences = System.Text.Json.JsonSerializer.Serialize(request.Preferences),
                    CreatedAt = DateTime.UtcNow
                };

                _context.TripRequests.Add(tripRequest);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Saved trip request for user {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving trip request for user {UserId}", userId);
                return false;
            }
        }

        public async Task<List<TripRequest>> GetUserTripHistoryAsync(int userId, int pageSize = 20)
        {
            try
            {
                return await _context.TripRequests
                    .Where(t => t.UserId == userId)
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting trip history for user {UserId}", userId);
                return [];
            }
        }

        #region Private Helper Methods

        private async Task<List<TripOption>> FindDirectRoutes(TripPlanRequest request, List<BusStop> originStops, List<BusStop> destinationStops)
        {
            var directOptions = new List<TripOption>();

            foreach (var originStop in originStops)
            {
                foreach (var destinationStop in destinationStops)
                {
                    // Find routes that serve both stops
                    var commonRoutes = await _context.BusRoutes
                        .Where(r => r.IsActive &&
                                   r.BusStops.Contains(originStop) &&
                                   r.BusStops.Contains(destinationStop))
                        .ToListAsync();

                    foreach (var route in commonRoutes)
                    {
                        var option = await CreateTripOption(request, route, originStop, destinationStop, false);
                        if (option != null)
                        {
                            directOptions.Add(option);
                        }
                    }
                }
            }

            return directOptions;
        }

        private async Task<List<TripOption>> FindRoutesWithTransfers(TripPlanRequest request, List<BusStop> originStops, List<BusStop> destinationStops, int maxTransfers)
        {
            var transferOptions = new List<TripOption>();

            // Simplified transfer logic - find intermediate stops that connect origin and destination routes
            foreach (var originStop in originStops)
            {
                var originRoutes = await _context.BusRoutes
                    .Where(r => r.IsActive && r.BusStops.Contains(originStop))
                    .Include(r => r.BusStops)
                    .ToListAsync();

                foreach (var originRoute in originRoutes)
                {
                    // Find potential transfer stops
                    var transferStops = originRoute.BusStops
                        .Where(s => s.Id != originStop.Id)
                        .ToList();

                    foreach (var transferStop in transferStops)
                    {
                        // Find routes from transfer stop to destination
                        var destinationRoutes = await _context.BusRoutes
                            .Where(r => r.IsActive &&
                                       r.Id != originRoute.Id &&
                                       r.BusStops.Contains(transferStop) &&
                                       r.BusStops.Any(s => destinationStops.Contains(s)))
                            .Include(r => r.BusStops)
                            .ToListAsync();

                        foreach (var destinationRoute in destinationRoutes)
                        {
                            var finalStop = destinationRoute.BusStops
                                .Where(s => destinationStops.Contains(s))
                                .OrderBy(s => s.Location.Distance(request.Destination))
                                .FirstOrDefault();

                            if (finalStop != null)
                            {
                                var option = await CreateTransferTripOption(request,
                                    originRoute, originStop, transferStop,
                                    destinationRoute, transferStop, finalStop);

                                if (option != null)
                                {
                                    transferOptions.Add(option);
                                }
                            }
                        }
                    }
                }
            }

            return transferOptions;
        }

        private async Task<TripOption?> CreateTripOption(TripPlanRequest request, BusRoute route, BusStop originStop, BusStop destinationStop, bool hasTransfer)
        {
            try
            {
                var segments = new List<TripSegment>();

                // Walking segment to origin stop
                var walkToStop = CreateWalkingSegment(request.Origin, originStop.Location, request.DepartureTime, "Walk to bus stop");
                segments.Add(walkToStop);

                // Bus segment
                var busStartTime = walkToStop.EndTime;
                var busSegment = CreateBusSegment(route, originStop, destinationStop, busStartTime);
                segments.Add(busSegment);

                // Walking segment from destination stop
                var walkFromStop = CreateWalkingSegment(destinationStop.Location, request.Destination, busSegment.EndTime, "Walk to destination");
                segments.Add(walkFromStop);

                // Check if total walking distance exceeds preference
                var totalWalkingDistance = segments.Where(s => s.Type == "walking").Sum(s => s.DistanceMeters);
                if (totalWalkingDistance > request.Preferences.MaxWalkingDistanceMeters)
                {
                    return null;
                }

                var tripOption = new TripOption
                {
                    Segments = segments,
                    TotalTravelTimeMinutes = segments.Sum(s => s.DurationMinutes),
                    TotalWalkingDistanceMeters = totalWalkingDistance,
                    TotalCost = segments.Sum(s => s.Cost),
                    TransferCount = hasTransfer ? 1 : 0,
                    DepartureTime = request.DepartureTime,
                    ArrivalTime = segments.Last().EndTime,
                    RouteType = DetermineRouteType(segments),
                    ConfidenceScore = CalculateConfidenceScore(segments)
                };

                return tripOption;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating trip option");
                return null;
            }
        }

        private async Task<TripOption?> CreateTransferTripOption(TripPlanRequest request,
            BusRoute route1, BusStop originStop, BusStop transferStop,
            BusRoute route2, BusStop transferStop2, BusStop destinationStop)
        {
            try
            {
                var segments = new List<TripSegment>();

                // Walking to first stop
                var walkToFirst = CreateWalkingSegment(request.Origin, originStop.Location, request.DepartureTime, "Walk to first bus stop");
                segments.Add(walkToFirst);

                // First bus segment
                var firstBus = CreateBusSegment(route1, originStop, transferStop, walkToFirst.EndTime);
                segments.Add(firstBus);

                // Transfer waiting time (assume 5 minutes minimum)
                var transferWait = new TripSegment
                {
                    Type = "waiting",
                    StartLocation = transferStop.Location,
                    EndLocation = transferStop.Location,
                    StartLocationName = transferStop.Name,
                    EndLocationName = transferStop.Name,
                    StartTime = firstBus.EndTime,
                    EndTime = firstBus.EndTime.AddMinutes(5),
                    DurationMinutes = 5,
                    DistanceMeters = 0,
                    Cost = 0
                };
                segments.Add(transferWait);

                // Second bus segment
                var secondBus = CreateBusSegment(route2, transferStop2, destinationStop, transferWait.EndTime);
                segments.Add(secondBus);

                // Walking from final stop
                var walkFromFinal = CreateWalkingSegment(destinationStop.Location, request.Destination, secondBus.EndTime, "Walk to destination");
                segments.Add(walkFromFinal);

                var totalWalkingDistance = segments.Where(s => s.Type == "walking").Sum(s => s.DistanceMeters);
                if (totalWalkingDistance > request.Preferences.MaxWalkingDistanceMeters)
                {
                    return null;
                }

                return new TripOption
                {
                    Segments = segments,
                    TotalTravelTimeMinutes = segments.Sum(s => s.DurationMinutes),
                    TotalWalkingDistanceMeters = totalWalkingDistance,
                    TotalCost = segments.Sum(s => s.Cost),
                    TransferCount = 1,
                    DepartureTime = request.DepartureTime,
                    ArrivalTime = segments.Last().EndTime,
                    RouteType = "transfer",
                    ConfidenceScore = CalculateConfidenceScore(segments) * 0.9 // Slightly lower confidence for transfers
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating transfer trip option");
                return null;
            }
        }

        private TripSegment CreateWalkingSegment(Point start, Point end, DateTime startTime, string instructions)
        {
            var distance = CalculateDistance(start, end);
            var walkingTimeMinutes = (int)Math.Ceiling(distance / WALKING_SPEED_MS / 60);

            return new TripSegment
            {
                Type = "walking",
                StartLocation = start,
                EndLocation = end,
                StartTime = startTime,
                EndTime = startTime.AddMinutes(walkingTimeMinutes),
                DurationMinutes = walkingTimeMinutes,
                DistanceMeters = distance,
                Cost = 0,
                WalkingInstructions = instructions
            };
        }

        private TripSegment CreateBusSegment(BusRoute route, BusStop originStop, BusStop destinationStop, DateTime startTime)
        {
            // Simplified: assume buses run every 10 minutes and take route's estimated time
            var waitTime = 5; // Average wait time
            var busStartTime = startTime.AddMinutes(waitTime);
            var travelTime = route.EstimatedTravelTime / 2; // Rough estimate for partial route

            return new TripSegment
            {
                Type = "bus",
                StartLocation = originStop.Location,
                EndLocation = destinationStop.Location,
                StartLocationName = originStop.Name,
                EndLocationName = destinationStop.Name,
                StartTime = busStartTime,
                EndTime = busStartTime.AddMinutes(travelTime),
                DurationMinutes = waitTime + travelTime,
                DistanceMeters = CalculateDistance(originStop.Location, destinationStop.Location),
                RouteId = route.Id,
                RouteName = route.Name,
                Cost = 2.50m // Fixed fare
            };
        }

        private List<TripOption> FilterAndSortOptions(List<TripOption> options, TripPreferences preferences)
        {
            var filtered = options.Where(o =>
                o.TotalWalkingDistanceMeters <= preferences.MaxWalkingDistanceMeters &&
                (!preferences.AccessibilityRequired || IsAccessible(o)))
                .ToList();

            return preferences.RouteType switch
            {
                "fastest" => filtered.OrderBy(o => o.TotalTravelTimeMinutes).ToList(),
                "cheapest" => filtered.OrderBy(o => o.TotalCost).ToList(),
                "least_transfers" => filtered.OrderBy(o => o.TransferCount).ThenBy(o => o.TotalTravelTimeMinutes).ToList(),
                _ => filtered.OrderBy(o => o.TotalTravelTimeMinutes).ToList()
            };
        }

        private bool IsAccessible(TripOption option)
        {
            // Check if all bus segments use accessible routes and stops
            return option.Segments
                .Where(s => s.Type == "bus")
                .All(s => true); // Simplified - would check actual accessibility data
        }

        private string DetermineRouteType(List<TripSegment> segments)
        {
            var busSegments = segments.Count(s => s.Type == "bus");
            return busSegments switch
            {
                0 => "walking",
                1 => "direct",
                _ => "transfer"
            };
        }

        private double CalculateConfidenceScore(List<TripSegment> segments)
        {
            // Base confidence score, reduced by complexity factors
            double score = 1.0;

            var transferCount = segments.Count(s => s.Type == "waiting");
            score -= transferCount * 0.1; // Each transfer reduces confidence

            var totalWalkingTime = segments.Where(s => s.Type == "walking").Sum(s => s.DurationMinutes);
            if (totalWalkingTime > 10) score -= 0.1; // Long walks reduce confidence

            return Math.Max(0.5, score); // Minimum 50% confidence
        }

        private double CalculateDistance(Point point1, Point point2)
        {
            var lat1 = point1.Y * Math.PI / 180;
            var lon1 = point1.X * Math.PI / 180;
            var lat2 = point2.Y * Math.PI / 180;
            var lon2 = point2.X * Math.PI / 180;

            var dlat = lat2 - lat1;
            var dlon = lon2 - lon1;

            var a = Math.Sin(dlat / 2) * Math.Sin(dlat / 2) +
                    Math.Cos(lat1) * Math.Cos(lat2) *
                    Math.Sin(dlon / 2) * Math.Sin(dlon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return EARTH_RADIUS_KM * c * 1000; // Convert to meters
        }

        #endregion
    }
}
