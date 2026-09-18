namespace RouteOptimizer.API.Interfaces
{
    /// <summary>
    /// Service for sending real-time updates through SignalR
    /// </summary>
    public interface IRouteUpdateService
    {
        Task NotifyBusLocationUpdate(int routeId, int busId, double latitude, double longitude);
        Task NotifyRouteDelayUpdate(int routeId, int delayMinutes, string reason);
        Task NotifyRouteModified(int routeId, string modificationType);
        Task NotifySystemAlert(string message, string alertType = "info");
    }
}
