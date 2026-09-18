using NetTopologySuite.Geometries;

namespace RouteOptimizer.API.Dto
{
    public class RouteOptimizationRequest
    {
        public List<Point> RequiredStops { get; set; } = [];
        public Point? StartPoint { get; set; }
        public Point? EndPoint { get; set; }
        public int MaxRouteLength { get; set; } = 50; // km
        public int MaxTravelTime { get; set; } = 120; // minutes
        public string OptimizationGoal { get; set; } = "minimize_time"; // minimize_time, minimize_distance, maximize_coverage
    }
}
