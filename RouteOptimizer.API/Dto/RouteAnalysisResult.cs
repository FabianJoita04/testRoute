namespace RouteOptimizer.API.Dto
{
    public class RouteAnalysisResult
    {
        public int RouteId { get; set; }
        public double EfficiencyScore { get; set; }
        public double CoverageScore { get; set; }
        public decimal CostPerKm { get; set; }
        public int AveragePassengersPerDay { get; set; }
        public List<string> ImprovementSuggestions { get; set; } = [];
    }
}
