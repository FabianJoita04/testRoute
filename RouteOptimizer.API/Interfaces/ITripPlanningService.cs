using NetTopologySuite.Geometries;
using RouteOptimizer.API.Dto;
using RouteOptimizer.Core.Entities;

namespace RouteOptimizer.API.Interfaces
{
    public interface ITripPlanningService
    {
        Task<List<TripOption>> PlanTripAsync(TripPlanRequest request);
        Task<TripOption?> GetOptimalTripAsync(TripPlanRequest request);
        Task<List<BusStop>> FindNearbyStopsAsync(Point location, double radiusMeters = 500);
        Task<List<RealTimeUpdate>> GetRealTimeUpdatesAsync(int routeId);
        Task<TripOption> UpdateTripWithRealTimeDataAsync(TripOption trip);
        Task<bool> SaveTripRequestAsync(int userId, TripPlanRequest request, string? selectedTripId = null);
        Task<List<TripRequest>> GetUserTripHistoryAsync(int userId, int pageSize = 20);
    }
}
