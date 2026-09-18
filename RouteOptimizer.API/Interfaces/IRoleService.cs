using RouteOptimizer.Core.Entities;

namespace RouteOptimizer.API.Interfaces
{
    public interface IRoleService
    {
        Task<bool> HasPermissionAsync(int userId, string permission);
        Task<Role?> GetUserRoleAsync(int userId);
        Task<List<string>> GetUserPermissionsAsync(int userId);
        Task<bool> AssignRoleAsync(int userId, int roleId, int assignedBy);
        Task<bool> CanAssignRole(int assignerId, int roleId);
        Task<List<Role>> GetAllRolesAsync();
        Task<bool> CanManageUser(int managerId, int targetUserId);
    }
}
