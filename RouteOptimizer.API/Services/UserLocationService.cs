using Microsoft.AspNetCore.SignalR;
using RouteOptimizer.API.Hubs;

namespace RouteOptimizer.API.Services
{
    public class UserLocationService(IHubContext<UserLocationHub> hubContext, ILogger<UserLocationService> logger)
    {
        private readonly IHubContext<UserLocationHub> _hubContext = hubContext;
        private readonly ILogger<UserLocationService> _logger = logger;

        public async Task NotifyUserLocationUpdate(int userId, double latitude, double longitude)
        {
            var update = new
            {
                UserId = userId,
                Latitude = latitude,
                Longitude = longitude,
                Timestamp = DateTime.UtcNow
            };

            // Send to all subscribed clients
            await _hubContext.Clients.Group($"User_{userId}")
                .SendAsync("UserLocationUpdate", update);

            _logger.LogDebug("User location update sent for User {UserId}", userId);
        }
    }
}
