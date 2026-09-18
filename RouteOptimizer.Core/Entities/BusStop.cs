using NetTopologySuite.Geometries;

namespace RouteOptimizer.Core.Entities
{
    public class BusStop
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Point Location { get; set; } = null!; // PostGIS geometry
        public string ZoneType { get; set; } = string.Empty; // residential, commercial, business
        public bool IsAccessible { get; set; } = true;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<BusRoute> BusRoutes { get; set; } = [];
    }
}
