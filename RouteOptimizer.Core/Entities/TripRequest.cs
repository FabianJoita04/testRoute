using NetTopologySuite.Geometries;

namespace RouteOptimizer.Core.Entities
{
    public class TripRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public Point OriginPoint { get; set; } = null!;
        public Point DestinationPoint { get; set; } = null!;
        public DateTime RequestedTime { get; set; }
        public string Preferences { get; set; } = "{}"; // JSON preferences
        public int? SelectedRouteId { get; set; }
        public BusRoute? SelectedRoute { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
