using NetTopologySuite.Geometries;

namespace RouteOptimizer.API.Dto
{
    public class TripPlanRequest
    {
        public Point Origin { get; set; } = null!;
        public Point Destination { get; set; } = null!;
        public DateTime DepartureTime { get; set; }
        public TripPreferences Preferences { get; set; } = new();
    }
}
