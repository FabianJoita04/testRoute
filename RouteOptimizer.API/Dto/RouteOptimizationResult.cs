using NetTopologySuite.Geometries;

namespace RouteOptimizer.API.Dto
{
    public class RouteOptimizationResult
    {
        public bool Success { get; set; }
        public List<Point> OptimizedStops { get; set; } = [];
        public LineString? OptimizedPath { get; set; }
        public double TotalDistance { get; set; }
        public int EstimatedTravelTime { get; set; }
        public decimal EstimatedCost { get; set; }
        public double CoverageScore { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
