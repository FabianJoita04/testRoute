using NetTopologySuite.Geometries;

namespace RouteOptimizer.API.Dto
{
    public class TripSegment
    {
        public string Type { get; set; } = string.Empty; // "walking", "bus", "waiting"
        public Point StartLocation { get; set; } = null!;
        public Point EndLocation { get; set; } = null!;
        public string? StartLocationName { get; set; }
        public string? EndLocationName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public double DistanceMeters { get; set; }

        // Bus-specific properties
        public int? RouteId { get; set; }
        public string? RouteName { get; set; }
        public int? BusId { get; set; }
        public decimal Cost { get; set; }

        // Walking-specific properties
        public List<Point>? WalkingPath { get; set; }
        public string? WalkingInstructions { get; set; }
    }
}
