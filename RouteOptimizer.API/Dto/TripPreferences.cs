namespace RouteOptimizer.API.Dto
{
    public class TripPreferences
    {
        public int MaxWalkingDistanceMeters { get; set; } = 800;
        public bool AccessibilityRequired { get; set; } = false;
        public string RouteType { get; set; } = "fastest"; // fastest, cheapest, least_transfers
        public bool AvoidCrowdedRoutes { get; set; } = false;
    }
}
