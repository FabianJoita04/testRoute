using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace RouteOptimizer.API.Hubs
{
    public class RouteUpdatesHub(ILogger<RouteUpdatesHub> logger) : Hub
    {
        private readonly ILogger<RouteUpdatesHub> _logger = logger;

        /// <summary>
        /// Called when a client connects to the hub
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var connectionId = Context.ConnectionId;
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _logger.LogInformation("Client connected: {ConnectionId}, User: {UserId}", connectionId, userId);

            // Add user to appropriate groups based on their role
            if (Context.User?.IsInRole("city_manager") == true || Context.User?.IsInRole("admin") == true)
            {
                await Groups.AddToGroupAsync(connectionId, "CityManagers");
                _logger.LogInformation("Added connection {ConnectionId} to CityManagers group", connectionId);
            }
            else
            {
                await Groups.AddToGroupAsync(connectionId, "Travellers");
                _logger.LogInformation("Added connection {ConnectionId} to Travellers group", connectionId);
            }

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
        /// Allow travellers to subscribe to specific route updates
        /// </summary>
        [Authorize]
        public async Task SubscribeToRoute(int routeId)
        {
            var connectionId = Context.ConnectionId;
            var groupName = $"Route_{routeId}";

            await Groups.AddToGroupAsync(connectionId, groupName);
            _logger.LogInformation("Connection {ConnectionId} subscribed to route {RouteId}", connectionId, routeId);

            // Notify the client they've successfully subscribed
            await Clients.Caller.SendAsync("RouteSubscriptionConfirmed", routeId);
        }

        /// <summary>
        /// Allow travellers to unsubscribe from specific route updates
        /// </summary>
        [Authorize]
        public async Task UnsubscribeFromRoute(int routeId)
        {
            var connectionId = Context.ConnectionId;
            var groupName = $"Route_{routeId}";

            await Groups.RemoveFromGroupAsync(connectionId, groupName);
            _logger.LogInformation("Connection {ConnectionId} unsubscribed from route {RouteId}", connectionId, routeId);

            // Notify the client they've successfully unsubscribed
            await Clients.Caller.SendAsync("RouteUnsubscriptionConfirmed", routeId);
        }

        /// <summary>
        /// Allow city managers to join route management groups
        /// </summary>
        [Authorize(Roles = "city_manager,senior_manager,admin")]
        public async Task JoinRouteManagement(int routeId)
        {
            var connectionId = Context.ConnectionId;
            var groupName = $"Management_Route_{routeId}";

            await Groups.AddToGroupAsync(connectionId, groupName);
            _logger.LogInformation("Manager connection {ConnectionId} joined management for route {RouteId}", connectionId, routeId);
        }

        /// <summary>
        /// Send a message to other connected clients (for testing/admin purposes)
        /// </summary>
        [Authorize(Roles = "admin")]
        public async Task SendMessageToAll(string message)
        {
            await Clients.All.SendAsync("SystemMessage", message, DateTime.UtcNow);
            _logger.LogInformation("System message sent to all clients: {Message}", message);
        }

        /// <summary>
        /// Get current connection statistics
        /// </summary>
        [Authorize(Roles = "city_manager,senior_manager,admin")]
        public async Task GetConnectionStats()
        {
            // In a real implementation, you'd track this information
            var stats = new
            {
                TotalConnections = "N/A", // Would need to implement connection tracking
                TravellersConnected = "N/A",
                ManagersConnected = "N/A",
                Timestamp = DateTime.UtcNow
            };

            await Clients.Caller.SendAsync("ConnectionStats", stats);
        }
    }
}
