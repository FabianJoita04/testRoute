using NetTopologySuite.Geometries;

namespace RouteOptimizer.API.Dto
{
    public class RealTimeUpdate
    {
        public int RouteId { get; set; }
        public int BusId { get; set; }
        public Point CurrentLocation { get; set; } = null!;
        public int DelayMinutes { get; set; }
        public DateTime LastUpdated { get; set; }
        public string Status { get; set; } = "on_time"; // on_time, delayed, cancelled
    }
}
