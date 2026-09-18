using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace RouteOptimizer.API.Hubs
{
    public class UserLocationHub(ILogger<UserLocationHub> logger) : Hub
    {
        private readonly ILogger<UserLocationHub> _logger = logger;

        /// <summary>
        /// Called when a client connects to the hub
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var connectionId = Context.ConnectionId;
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _logger.LogInformation("Client connected: {ConnectionId}, User: {UserId}", connectionId, userId);

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Called when a client disconnects from the hub
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connectionId = Context.ConnectionId;
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _logger.LogInformation("Client disconnected: {ConnectionId}, User: {UserId}", connectionId, userId);

            if (exception != null)
            {
                _logger.LogError(exception, "Client disconnected with error: {ConnectionId}", connectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Allow clients to subscribe to specific user location updates
        /// </summary>
        [Authorize]
        public async Task SubscribeToUserLocation(int userId)
        {
            var connectionId = Context.ConnectionId;
            var groupName = $"User_{userId}";

            await Groups.AddToGroupAsync(connectionId, groupName);
            _logger.LogInformation("Connection {ConnectionId} subscribed to user {UserId}", connectionId, userId);

            // Notify the client they've successfully subscribed
            await Clients.Caller.SendAsync("UserLocationSubscriptionConfirmed", userId);
        }

        /// <summary>
        /// Allow clients to unsubscribe from specific user location updates
        /// </summary>
        [Authorize]
        public async Task UnsubscribeFromUserLocation(int userId)
        {
            var connectionId = Context.ConnectionId;
            var groupName = $"User_{userId}";

            await Groups.RemoveFromGroupAsync(connectionId, groupName);
            _logger.LogInformation("Connection {ConnectionId} unsubscribed from user {UserId}", connectionId, userId);

            // Notify the client they've successfully unsubscribed
            await Clients.Caller.SendAsync("UserLocationUnsubscriptionConfirmed", userId);
        }
    }
}
