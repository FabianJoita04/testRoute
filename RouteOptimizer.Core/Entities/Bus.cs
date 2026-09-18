using NetTopologySuite.Geometries;

namespace RouteOptimizer.Core.Entities
{
    public class Bus
    {
        public int Id { get; set; }
        public string RefNumber { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string BusType { get; set; } = string.Empty; // standard, articulated, electric
        public bool IsActive { get; set; } = true;
        public int? CurrentRouteId { get; set; }
        public BusRoute? CurrentRoute { get; set; }
        public Point? CurrentLocation { get; set; } // Real-time location
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<BusRoute> AssignedRoutes { get; set; } = [];
    }
}
