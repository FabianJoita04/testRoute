import axios, {type AxiosInstance } from 'axios';
import type {
    TripRequest,
    TripOption,
    BusRoute,
    BusStop,
    RealTimeUpdate,
    AIRecommendation,
    SystemAnalytics,
    RouteAnalytics,
    ApiResponse,
    Location,
    FavoriteRoute,
    TripHistoryEntry,
    RouteOptimizationParameters,
    ScenarioSimulation,
    DashboardMetrics,
    SystemStatus
} from '@/types';
import keycloak from "@services/keycloak.ts";

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7135/api',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.api.interceptors.request.use(
            (config) => {
                if (keycloak.authenticated && keycloak.token) {
                    config.headers.Authorization = `Bearer ${keycloak.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Try to refresh token
                    try {
                        const refreshed = await keycloak.updateToken(0);
                        if (refreshed) {
                            // Retry the original request with new token
                            const originalRequest = error.config;
                            originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
                            return this.api.request(originalRequest);
                        } else {
                            // Refresh failed, redirect to login
                            await keycloak.login();
                            return Promise.reject(error);
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        await keycloak.login();
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    // async getUserProfile(): Promise<ApiResponse<User>> {
    //     const response = await this.api.get('/user/profile');
    //     return response.data;
    // }
    //
    // async updateUserProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    //     const response = await this.api.put('/user/profile', userData);
    //     return response.data;
    // }

    // Traveller endpoints
    async planTrip(request: TripRequest): Promise<ApiResponse<TripOption[]>> {
        const response = await this.api.post('/traveller/plan-trip', request);
        return response.data;
    }

    async getNearbyStops(lat: number, lng: number, radiusMeters: number = 500): Promise<ApiResponse<BusStop[]>> {
        const response = await this.api.get(`/traveller/nearby-stops?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
        return response.data;
    }

    async getRealTimeUpdates(routeId: number): Promise<ApiResponse<RealTimeUpdate[]>> {
        const response = await this.api.get(`/traveller/real-time-updates/${routeId}`);
        return response.data;
    }

    async saveFavoriteRoute(origin: Location, destination: Location, routeName: string): Promise<ApiResponse<void>> {
        const response = await this.api.post('/traveller/favorites', {
            origin,
            destination,
            routeName
        });
        return response.data;
    }

    async getFavoriteRoutes(): Promise<ApiResponse<FavoriteRoute[]>> {
        const response = await this.api.get('/traveller/favorites');
        return response.data;
    }

    async getTripHistory(): Promise<ApiResponse<TripHistoryEntry[]>> {
        const response = await this.api.get('/traveller/history');
        return response.data;
    }

    // City Manager endpoints
    async getAllRoutes(): Promise<ApiResponse<BusRoute[]>> {
        const response = await this.api.get('/manager/routes');
        return response.data;
    }

    async getRoute(routeId: number): Promise<ApiResponse<BusRoute>> {
        const response = await this.api.get(`/manager/routes/${routeId}`);
        return response.data;
    }

    async createRoute(route: Partial<BusRoute>): Promise<ApiResponse<BusRoute>> {
        const response = await this.api.post('/manager/routes', route);
        return response.data;
    }

    async updateRoute(routeId: number, route: Partial<BusRoute>): Promise<ApiResponse<BusRoute>> {
        const response = await this.api.put(`/manager/routes/${routeId}`, route);
        return response.data;
    }

    async deleteRoute(routeId: number): Promise<ApiResponse<void>> {
        const response = await this.api.delete(`/manager/routes/${routeId}`);
        return response.data;
    }

    async getSystemAnalytics(startDate: string, endDate: string): Promise<ApiResponse<SystemAnalytics>> {
        const response = await this.api.get(`/manager/analytics/system?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    }

    async getRouteAnalytics(routeId: number, startDate: string, endDate: string): Promise<ApiResponse<RouteAnalytics>> {
        const response = await this.api.get(`/manager/analytics/route/${routeId}?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    }

    async getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
        const response = await this.api.get('/manager/dashboard/metrics');
        return response.data;
    }

    async getAIRecommendations(): Promise<ApiResponse<AIRecommendation[]>> {
        const response = await this.api.get('/manager/ai/recommendations');
        return response.data;
    }

    async approveAIRecommendation(recommendationId: number): Promise<ApiResponse<void>> {
        const response = await this.api.post(`/manager/ai/recommendations/${recommendationId}/approve`);
        return response.data;
    }

    async rejectAIRecommendation(recommendationId: number, reason: string): Promise<ApiResponse<void>> {
        const response = await this.api.post(`/manager/ai/recommendations/${recommendationId}/reject`, { reason });
        return response.data;
    }

    async getAllBusStops(): Promise<ApiResponse<BusStop[]>> {
        const response = await this.api.get('/manager/stops');
        return response.data;
    }

    async createBusStop(stop: Partial<BusStop>): Promise<ApiResponse<BusStop>> {
        const response = await this.api.post('/manager/stops', stop);
        return response.data;
    }

    async updateBusStop(stopId: number, stop: Partial<BusStop>): Promise<ApiResponse<BusStop>> {
        const response = await this.api.put(`/manager/stops/${stopId}`, stop);
        return response.data;
    }

    async optimizeRoute(routeId: number, parameters: RouteOptimizationParameters): Promise<ApiResponse<BusRoute>> {
        const response = await this.api.post(`/manager/routes/${routeId}/optimize`, parameters);
        return response.data;
    }

    async simulateScenario(scenario: ScenarioSimulation): Promise<ApiResponse<SystemAnalytics>> {
        const response = await this.api.post('/manager/scenarios/simulate', scenario);
        return response.data;
    }

    // Health check
    async getHealthStatus(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
        const response = await this.api.get('/health');
        return response.data;
    }

    async getRealtimeSystemStatus(): Promise<ApiResponse<SystemStatus>> {
        const response = await this.api.get('/manager/system/status');
        return response.data;
    }
}

export const apiService = new ApiService();
export default apiService;