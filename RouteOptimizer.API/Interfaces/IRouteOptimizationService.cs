using NetTopologySuite.Geometries;
using RouteOptimizer.API.Dto;
using RouteOptimizer.Core.Entities;

namespace RouteOptimizer.API.Interfaces
{
    public interface IRouteOptimizationService
    {
        Task<RouteOptimizationResult> OptimizeRouteAsync(RouteOptimizationRequest request);
        Task<List<RouteOptimizationResult>> GenerateRouteAlternativesAsync(RouteOptimizationRequest request, int numberOfAlternatives = 3);
        Task<RouteAnalysisResult> AnalyzeExistingRouteAsync(int routeId);
        Task<List<Point>> OptimizeStopOrderAsync(List<Point> stops);
        Task<double> CalculateRouteCoverageAsync(LineString routePath, double radiusMeters = 500);
        Task<List<BusStop>> FindOptimalStopLocationsAsync(Polygon serviceArea, int maxStops);

    }
}
