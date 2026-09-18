using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using RouteOptimizer.API.Interfaces;
using RouteOptimizer.Core.Entities;
using RouteOptimizer.Infrastructure.Data;
using System.Text.Json;

namespace RouteOptimizer.API.Services
{
    public class RoleService(ApplicationDbContext context, IMemoryCache cache, ILogger<RoleService> logger) : IRoleService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IMemoryCache _cache = cache;
        private readonly ILogger<RoleService> _logger = logger;

        public async Task<bool> HasPermissionAsync(int userId, string permission)
        {
            try
            {
                var permissions = await GetUserPermissionsAsync(userId);
                return permissions.Contains(permission) || permissions.Contains("all_permissions");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking permission {Permission} for user {UserId}", permission, userId);
                return false;
            }
        }

        public async Task<Role?> GetUserRoleAsync(int userId)
        {
            var cacheKey = $"user_role_{userId}";

            if (_cache.TryGetValue(cacheKey, out Role? cachedRole))
                return cachedRole;

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Role != null)
            {
                _cache.Set(cacheKey, user.Role, TimeSpan.FromMinutes(15));
            }

            return user?.Role;
        }

        public async Task<List<string>> GetUserPermissionsAsync(int userId)
        {
            var cacheKey = $"user_permissions_{userId}";

            if (_cache.TryGetValue(cacheKey, out List<string>? cachedPermissions))
                return cachedPermissions ?? new List<string>();

            var role = await GetUserRoleAsync(userId);
            if (role == null) return new List<string>();

            var permissions = JsonSerializer.Deserialize<List<string>>(role.Permissions) ?? new List<string>();

            _cache.Set(cacheKey, permissions, TimeSpan.FromMinutes(15));
            return permissions;
        }

        public async Task<bool> AssignRoleAsync(int userId, int roleId, int assignedBy)
        {
            try
            {
                // Check if the assigner has permission to assign this role
                if (!await CanAssignRole(assignedBy, roleId))
                {
                    _logger.LogWarning("User {AssignedBy} attempted to assign role {RoleId} without permission", assignedBy, roleId);
                    return false;
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return false;

                var oldRoleId = user.RoleId;
                user.RoleId = roleId;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Clear cache for this user
                _cache.Remove($"user_role_{userId}");
                _cache.Remove($"user_permissions_{userId}");

                _logger.LogInformation("Role changed for user {UserId} from {OldRoleId} to {NewRoleId} by {AssignedBy}",
                    userId, oldRoleId, roleId, assignedBy);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role {RoleId} to user {UserId}", roleId, userId);
                return false;
            }
        }

        public async Task<bool> CanAssignRole(int assignerId, int roleId)
        {
            var assignerRole = await GetUserRoleAsync(assignerId);
            var targetRole = await _context.Roles.FindAsync(roleId);

            if (assignerRole == null || targetRole == null) return false;

            // Users can only assign roles at their level or below
            // Admins can assign any role, others cannot assign admin roles
            return assignerRole.Level >= targetRole.Level &&
                   (assignerRole.Name == "admin" || targetRole.Name != "admin");
        }

        public async Task<List<Role>> GetAllRolesAsync()
        {
            return await _context.Roles
                .Where(r => r.IsActive)
                .OrderBy(r => r.Level)
                .ToListAsync();
        }

        public async Task<bool> CanManageUser(int managerId, int targetUserId)
        {
            var managerRole = await GetUserRoleAsync(managerId);
            var targetRole = await GetUserRoleAsync(targetUserId);

            if (managerRole == null || targetRole == null) return false;

            // Higher level roles can manage lower level roles
            return managerRole.Level > targetRole.Level;
        }
    }
}
