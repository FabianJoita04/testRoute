export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    roles: string[];
    permissions: string[];
    isActive: boolean;
    keycloakId?: string;
    realmRoles?: string[];
    clientRoles?: string[];
}

export interface KeycloakUser {
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
    given_name: string;
    family_name: string;
    preferred_username: string;
    realm_access?: {
        roles: string[];
    };
    resource_access?: {
        [clientId: string]: {
            roles: string[];
        };
    };
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    keycloakInitialized: boolean;
}

export interface Role {
    id: number;
    name: string;
    description: string;
    level: number;
    permissions: string[];
}

export interface BusRoute {
    id: number;
    name: string;
    code: string;
    description: string;
    isActive: boolean;
    operationalCost: number;
    estimatedTravelTime: number;
    busStops: BusStop[];
    buses: Bus[];
    path?: [number, number][];  // Array of [lat, lng] coordinates
    status?: 'Active' | 'Inactive' | 'Under Maintenance';
    startPoint?: string;
    endPoint?: string;
    operatingHours?: {
        start: string;
        end: string;
    };
    frequency?: number; // minutes between buses
    vehicleType?: string;
    averageDailyPassengers?: number;
    onTimePerformance?: number; // percentage
    capacityUtilization?: number; // percentage
}

export interface BusStop {
    id: number;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    zoneType: string;
    isAccessible: boolean;
    isActive: boolean;
    averageWaitTime?: number; // minutes
    passengerBoardingStats?: {
        dailyAverage: number;
        peakHourAverage: number;
    };
    passengerAlightingStats?: {
        dailyAverage: number;
        peakHourAverage: number;
    };
    distanceToNext?: number; // meters
}

export interface Bus {
    id: number;
    licenseNumber: string;
    capacity: number;
    busType: string;
    isActive: boolean;
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
    currentRoute?: BusRoute;
}

export interface TripRequest {
    origin: {
        latitude: number;
        longitude: number;
    };
    destination: {
        latitude: number;
        longitude: number;
    };
    departureTime: string;
    preferences: TripPreferences;
}

export interface TripPreferences {
    maxWalkingDistanceMeters: number;
    accessibilityRequired: boolean;
    routeType: 'fastest' | 'cheapest' | 'least_transfers';
    avoidCrowdedRoutes: boolean;
}

export interface TripOption {
    id: string;
    segments: TripSegment[];
    totalTravelTimeMinutes: number;
    totalWalkingDistanceMeters: number;
    totalCost: number;
    transferCount: number;
    departureTime: string;
    arrivalTime: string;
    routeType: string;
    confidenceScore: number;
}

export interface TripSegment {
    id: string;
    type: 'walking' | 'bus' | 'waiting';
    startLocation: {
        latitude: number;
        longitude: number;
    };
    endLocation: {
        latitude: number;
        longitude: number;
    };
    startLocationName?: string;
    endLocationName?: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    distanceMeters: number;
    routeId?: number;
    routeName?: string;
    busId?: number;
    cost: number;
    walkingInstructions?: string;
}

export interface RealTimeUpdate {
    routeId: number;
    busId: number;
    currentLocation: {
        latitude: number;
        longitude: number;
    };
    delayMinutes: number;
    lastUpdated: string;
    status: 'on_time' | 'delayed' | 'cancelled';
}

export interface AIRecommendation {
    id: number;
    recommendationType: string;
    currentRouteId?: number;
    proposedChanges: any;
    confidenceScore: number;
    expectedImpact: any;
    status: 'pending' | 'approved' | 'rejected' | 'implemented';
    createdAt: string;
}

export interface SystemAnalytics {
    totalRoutes: number;
    activeBuses: number;
    totalBusStops: number;
    dailyPassengers: number;
    dailyRevenue: number;
    systemEfficiency: number;
    averageDelay: number;
    topPerformingRoutes: RouteAnalytics[];
    underperformingRoutes: RouteAnalytics[];
    generatedAt: string;
}

export interface RouteAnalytics {
    routeId: number;
    routeName: string;
    totalPassengers: number;
    averagePassengersPerTrip: number;
    revenue: number;
    operationalCost: number;
    profit: number;
    onTimePerformance: number;
    customerSatisfaction: number;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
}

// UI specific types
export interface MapViewport {
    center: [number, number];
    zoom: number;
}

export interface NotificationState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

// Location type for coordinates
export interface Location {
    latitude: number;
    longitude: number;
}

// Favorite route type
export interface FavoriteRoute {
    id: number;
    userId: string;
    origin: Location;
    destination: Location;
    routeName: string;
    createdAt: string;
}

// Trip history entry
export interface TripHistoryEntry {
    id: number;
    userId: string;
    tripRequest: TripRequest;
    selectedOption: TripOption;
    timestamp: string;
}

// Route optimization parameters
export interface RouteOptimizationParameters {
    maxVehicles?: number;
    maxDistancePerVehicle?: number;
    considerTraffic?: boolean;
    optimizationGoal?: 'minimize_time' | 'minimize_cost' | 'maximize_coverage';
}

// Scenario simulation parameters
export interface ScenarioSimulation {
    scenarioName: string;
    routeChanges: RouteChange[];
    expectedDate?: string;
}

export interface RouteChange {
    routeId: number;
    changeType: 'add_stop' | 'remove_stop' | 'modify_schedule' | 'change_path';
    parameters: Record<string, any>;
}

// Dashboard metrics
export interface DashboardMetrics {
    totalRoutes: number;
    activeRoutes: number;
    totalBuses: number;
    activeBuses: number;
    totalPassengersToday: number;
    revenueToday: number;
    averageDelayMinutes: number;
    systemHealth: number;
}

// Real-time system status
export interface SystemStatus {
    timestamp: string;
    activeBuses: number;
    operationalRoutes: number;
    systemLoad: number;
    alerts: SystemAlert[];
}

export interface SystemAlert {
    id: number;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
}

// Dashboard specific types
export interface FavoriteRouteDisplay {
    id: number;
    name: string;
    origin: string;
    destination: string;
    estimatedTime: number;
    lastUsed: Date;
    routeNumbers: string[];
}

export interface RecentTrip {
    id: number;
    origin: string;
    destination: string;
    date: Date;
    duration: number;
    cost: number;
    status: string;
}

export interface NearbyStop {
    id: number;
    name: string;
    distance: number;
    routes: string[];
    nextBus: Date;
    delay: number;
}

// Route Management specific types
export interface RouteStop extends BusStop {
    order: number;
    scheduledArrivalOffset?: number; // minutes from route start
}

export interface RouteSchedule {
    dayOfWeek: string;
    trips: TripSchedule[];
}

export interface TripSchedule {
    departureTime: string;
    arrivalTime: string;
    vehicleId?: number;
}