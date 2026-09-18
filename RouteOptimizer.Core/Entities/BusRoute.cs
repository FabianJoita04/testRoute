using NetTopologySuite.Geometries;

namespace RouteOptimizer.Core.Entities
{
    public class BusRoute
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public LineString Path { get; set; } = null!; // PostGIS geometry
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public decimal OperationalCost { get; set; }
        public int EstimatedTravelTime { get; set; } // in minutes
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<BusStop> BusStops { get; set; } = [];
        public ICollection<Bus> Buses { get; set; } = [];
    }
}
