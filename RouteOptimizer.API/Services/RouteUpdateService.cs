using Microsoft.AspNetCore.SignalR;
using RouteOptimizer.API.Hubs;
using RouteOptimizer.API.Interfaces;

namespace RouteOptimizer.API.Services
{
    public class RouteUpdateService(IHubContext<RouteUpdatesHub> hubContext, ILogger<RouteUpdateService> logger) : IRouteUpdateService
    {
        private readonly IHubContext<RouteUpdatesHub> _hubContext = hubContext;
        private readonly ILogger<RouteUpdateService> _logger = logger;

        public async Task NotifyBusLocationUpdate(int routeId, int busId, double latitude, double longitude)
        {
            var update = new
            {
                RouteId = routeId,
                BusId = busId,
                Latitude = latitude,
                Longitude = longitude,
                Timestamp = DateTime.UtcNow
            };

            // Send to travellers subscribed to this route
            await _hubContext.Clients.Group($"Route_{routeId}")
                .SendAsync("BusLocationUpdate", update);

            // Send to city managers
            await _hubContext.Clients.Group("CityManagers")
                .SendAsync("BusLocationUpdate", update);

            _logger.LogDebug("Bus location update sent for Route {RouteId}, Bus {BusId}", routeId, busId);
        }

        public async Task NotifyRouteDelayUpdate(int routeId, int delayMinutes, string reason)
        {
            var update = new
            {
                RouteId = routeId,
                DelayMinutes = delayMinutes,
                Reason = reason,
                Timestamp = DateTime.UtcNow
            };

            // Send to travellers subscribed to this route
            await _hubContext.Clients.Group($"Route_{routeId}")
                .SendAsync("RouteDelayUpdate", update);

            // Send to city managers
            await _hubContext.Clients.Group("CityManagers")
                .SendAsync("RouteDelayUpdate", update);

            _logger.LogInformation("Route delay update sent for Route {RouteId}: {DelayMinutes} minutes - {Reason}",
                routeId, delayMinutes, reason);
        }

        public async Task NotifyRouteModified(int routeId, string modificationType)
        {
            var update = new
            {
                RouteId = routeId,
                ModificationType = modificationType,
                Timestamp = DateTime.UtcNow
            };

            // Send to all travellers (they might be affected)
            await _hubContext.Clients.Group("Travellers")
                .SendAsync("RouteModified", update);

            // Send to city managers
            await _hubContext.Clients.Group("CityManagers")
                .SendAsync("RouteModified", update);

            _logger.LogInformation("Route modification notification sent for Route {RouteId}: {ModificationType}",
                routeId, modificationType);
        }

        public async Task NotifySystemAlert(string message, string alertType = "info")
        {
            var alert = new
            {
                Message = message,
                AlertType = alertType,
                Timestamp = DateTime.UtcNow
            };

            // Send to all connected clients
            await _hubContext.Clients.All.SendAsync("SystemAlert", alert);

            _logger.LogInformation("System alert sent to all clients: {Message} ({AlertType})", message, alertType);
        }
    }
}
