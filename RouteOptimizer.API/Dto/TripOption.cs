namespace RouteOptimizer.API.Dto
{
    public class TripOption
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public List<TripSegment> Segments { get; set; } = [];
        public int TotalTravelTimeMinutes { get; set; }
        public double TotalWalkingDistanceMeters { get; set; }
        public decimal TotalCost { get; set; }
        public int TransferCount { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }
        public string RouteType { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; } // How reliable this option is
    }
}
