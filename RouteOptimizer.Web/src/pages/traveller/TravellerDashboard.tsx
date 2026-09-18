import React, { useState, useEffect } from 'react';
import { Profiler } from 'react';
import { onRenderCallback } from '../../utils/performance';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Navigation,
    History,
    Star,
    DirectionsBus,
    Schedule,
    LocationOn,
    Warning,
    AccessTime,
    Refresh,
    Add,
} from '@mui/icons-material';

import type { NotificationState, RealTimeUpdate, FavoriteRouteDisplay, RecentTrip, NearbyStop } from '@/types';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '@/providers/KeycloakProvider';

interface TravellerDashboardProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

const TravellerDashboard: React.FC<TravellerDashboardProps> = ({ showNotification }) => {
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const [favoriteRoutes, setFavoriteRoutes] = useState<FavoriteRouteDisplay[]>([]);
    const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
    const [nearbyStops, setNearbyStops] = useState<NearbyStop[]>([]);
    const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Sample data for demonstration
    const sampleFavorites: FavoriteRouteDisplay[] = [
        {
            id: 1,
            name: 'Home to Work',
            origin: 'Piața Victoriei',
            destination: 'Piața Unirii',
            estimatedTime: 25,
            lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
            routeNumbers: ['Route 15', 'Route 23']
        },
        {
            id: 2,
            name: 'University Route',
            origin: 'Gara de Nord',
            destination: 'Universitate',
            estimatedTime: 18,
            lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            routeNumbers: ['Route 8']
        }
    ];

    const sampleRecentTrips: RecentTrip[] = [
        {
            id: 1,
            origin: 'Piața Română',
            destination: 'Băneasa Shopping City',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            duration: 22,
            cost: 3.50,
            status: 'completed'
        },
        {
            id: 2,
            origin: 'Calea Victoriei',
            destination: 'Aeroportul Henri Coandă',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            duration: 45,
            cost: 8.50,
            status: 'completed'
        },
        {
            id: 3,
            origin: 'Piața Obor',
            destination: 'Herastrau Park',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            duration: 15,
            cost: 3.50,
            status: 'completed'
        }
    ];

    const sampleNearbyStops: NearbyStop[] = [
        {
            id: 1,
            name: 'Piața Victoriei',
            distance: 150,
            routes: ['Route 12', 'Route 34', 'Route 56'],
            nextBus: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes
            delay: 0
        },
        {
            id: 2,
            name: 'Calea Victoriei',
            distance: 320,
            routes: ['Route 1', 'Route 5', 'Route 15'],
            nextBus: new Date(Date.now() + 12 * 60 * 1000), // 12 minutes
            delay: 3
        },
        {
            id: 3,
            name: 'Piața Amzei',
            distance: 480,
            routes: ['Route 23', 'Route 44'],
            nextBus: new Date(Date.now() + 6 * 60 * 1000), // 6 minutes
            delay: -2
        }
    ];

    useEffect(() => {
        // Only load data if user is authenticated and has proper role
        if (user && hasRole('traveller')) {
            loadDashboardData();

            // Set up periodic updates for real-time data
            const interval = setInterval(() => {
                loadRealTimeData();
            }, 30000); // Every 30 seconds

            return () => clearInterval(interval);
        }
    }, [user, hasRole]);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // In production, these would be real API calls
            await Promise.all([
                loadFavoriteRoutes(),
                loadRecentTrips(),
                loadNearbyStops(),
            ]);
            showNotification('Dashboard data loaded successfully', 'success');
        } catch (error: unknown) {
            console.error('Dashboard data loading error:', error);
            showNotification('Failed to load dashboard data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const loadFavoriteRoutes = async () => {
        try {
            // const response = await apiService.getFavoriteRoutes(user.id);
            // For demo, use sample data
            setFavoriteRoutes(sampleFavorites);
        } catch (error: unknown) {
            console.error('Failed to load favorite routes:', error);
        }
    };

    const loadRecentTrips = async () => {
        try {
            // const response = await apiService.getTripHistory(user.id);
            // For demo, use sample data
            setRecentTrips(sampleRecentTrips);
        } catch (error: unknown) {
            console.error('Failed to load recent trips:', error);
        }
    };

    const loadNearbyStops = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // In production:
                        // const response = await apiService.getNearbyStops(
                        //   position.coords.latitude,
                        //   position.coords.longitude
                        // );
                        // For demo, use Bucharest coordinates with sample data
                        console.log('User location:', position.coords.latitude, position.coords.longitude);
                        setNearbyStops(sampleNearbyStops);
                    } catch (error: unknown) {
                        console.error('Failed to load nearby stops:', error);
                    }
                },
                (error) => {
                    console.warn('Location access denied, using default data:', error);
                    // Use sample data if location is not available
                    setNearbyStops(sampleNearbyStops);
                }
            );
        } else {
            setNearbyStops(sampleNearbyStops);
        }
    };

    const loadRealTimeData = async () => {
        // Load real-time updates for user's favorite routes
        try {
            const updates: RealTimeUpdate[] = [];
            for (const favorite of favoriteRoutes) {
                for (const routeNumber of favorite.routeNumbers) {
                    // In production: const response = await apiService.getRealTimeUpdates(routeId);
                    // For demo, create sample real-time updates with Bucharest coordinates
                    updates.push({
                        routeId: parseInt(routeNumber.split(' ')[1]),
                        busId: Math.floor(Math.random() * 100),
                        currentLocation: {
                            latitude: 44.4268 + (Math.random() - 0.5) * 0.05, // Bucharest coordinates
                            longitude: 26.1025 + (Math.random() - 0.5) * 0.05,
                        },
                        delayMinutes: Math.floor(Math.random() * 10) - 2,
                        lastUpdated: new Date().toISOString(),
                        status: Math.random() > 0.8 ? 'delayed' : 'on_time',
                    });
                }
            }
            setRealTimeUpdates(updates);
        } catch (error: unknown) {
            console.error('Failed to load real-time data:', error);
        }
    };

    const handlePlanNewTrip = () => {
        navigate('/traveller/plan');
    };

    const handleUseFavorite = (favorite: FavoriteRouteDisplay) => {
        navigate('/traveller/plan', {
            state: {
                origin: favorite.origin,
                destination: favorite.destination
            }
        });
    };

    const handleViewHistory = () => {
        navigate('/traveller/history');
    };

    const formatDistance = (meters: number): string => {
        return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${meters}m`;
    };

    const formatTime = (date: Date): string => {
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return 'Now';
        if (diffMins < 60) return `${diffMins} min`;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getDelayStatus = (delayMinutes: number) => {
        if (delayMinutes > 5) return { color: 'error', text: `${delayMinutes} min late` };
        if (delayMinutes > 0) return { color: 'warning', text: `${delayMinutes} min late` };
        if (delayMinutes < -1) return { color: 'success', text: `${Math.abs(delayMinutes)} min early` };
        return { color: 'success', text: 'On time' };
    };

    // Show loading if user data is not yet available
    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    // Show unauthorized if user doesn't have traveller role
    if (!hasRole('traveller')) {
        return (
            <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
                <Navbar />
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">
                        You don't have permission to access the traveller dashboard.
                        Current roles: {user.roles?.join(', ') || 'No roles assigned'}
                    </Alert>
                </Box>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
                <Navbar />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Box>
        );
    }

    return (
        <Profiler id="TravellerDashboard" onRender={onRenderCallback}>
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Navbar />

            <Box sx={{ p: 3 }}>
                {/* Welcome Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Welcome back, {user.firstName || user.username}!
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Plan your journey and track your buses in real-time in Bucharest
                    </Typography>

                </Box>

                {/* Quick Actions */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card
                            sx={{
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                },
                            }}
                            onClick={handlePlanNewTrip}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Navigation sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Plan New Trip
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Find the best route from A to B
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card
                            sx={{
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                },
                            }}
                            onClick={handleViewHistory}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <History sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Trip History
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    View your past journeys
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Star sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Saved Routes
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {favoriteRoutes.length} favorite routes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Favorite Routes */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, height: 'fit-content' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Favorite Routes
                                </Typography>
                                <IconButton size="small">
                                    <Add />
                                </IconButton>
                            </Box>

                            {favoriteRoutes.length === 0 ? (
                                <Alert severity="info">
                                    No favorite routes yet. Plan a trip to save your first route!
                                </Alert>
                            ) : (
                                <List>
                                    {favoriteRoutes.map((favorite, index) => (
                                        <React.Fragment key={favorite.id}>
                                            <ListItem
                                                sx={{
                                                    px: 0,
                                                    py: 2,
                                                    cursor: 'pointer',
                                                    borderRadius: 1,
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                    },
                                                }}
                                                onClick={() => handleUseFavorite(favorite)}
                                            >
                                                <ListItemIcon>
                                                    <Star color="primary" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={favorite.name}
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {favorite.origin} → {favorite.destination}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                                <AccessTime fontSize="small" color="action" />
                                                                <Typography variant="caption">
                                                                    ~{favorite.estimatedTime} min
                                                                </Typography>
                                                                {favorite.routeNumbers.map((route: string) => (
                                                                    <Chip
                                                                        key={route}
                                                                        label={route}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ height: 20 }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    }
                                                />
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUseFavorite(favorite);
                                                    }}
                                                >
                                                    Use Route
                                                </Button>
                                            </ListItem>
                                            {index < favoriteRoutes.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Nearby Bus Stops */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, height: 'fit-content' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Nearby Bus Stops
                                </Typography>
                                <IconButton size="small" onClick={loadNearbyStops}>
                                    <Refresh />
                                </IconButton>
                            </Box>

                            <List>
                                {nearbyStops.map((stop, index) => (
                                    <React.Fragment key={stop.id}>
                                        <ListItem sx={{ px: 0, py: 2 }}>
                                            <ListItemIcon>
                                                <DirectionsBus color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {stop.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {formatDistance(stop.distance)} away
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                            {stop.routes.slice(0, 3).map((route: string) => (
                                                                <Chip
                                                                    key={route}
                                                                    label={route}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ height: 18, fontSize: '0.7rem' }}
                                                                />
                                                            ))}
                                                            {stop.routes.length > 3 && (
                                                                <Typography variant="caption" color="textSecondary">
                                                                    +{stop.routes.length - 3} more
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Schedule fontSize="small" color="action" />
                                                                <Typography variant="caption">
                                                                    Next: {formatTime(stop.nextBus)}
                                                                </Typography>
                                                            </Box>
                                                            {stop.delay !== 0 && (
                                                                <Chip
                                                                    label={getDelayStatus(stop.delay).text}
                                                                    size="small"
                                                                    color={getDelayStatus(stop.delay).color as 'error' | 'warning' | 'success'}
                                                                    variant="outlined"
                                                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < nearbyStops.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Recent Trips */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Recent Trips
                                </Typography>
                                <Button size="small" onClick={handleViewHistory}>
                                    View All
                                </Button>
                            </Box>

                            {recentTrips.length === 0 ? (
                                <Alert severity="info">
                                    No recent trips. Start planning your first journey!
                                </Alert>
                            ) : (
                                <List>
                                    {recentTrips.slice(0, 3).map((trip, index) => (
                                        <React.Fragment key={trip.id}>
                                            <ListItem sx={{ px: 0, py: 2 }}>
                                                <ListItemIcon>
                                                    <LocationOn color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`${trip.origin} → ${trip.destination}`}
                                                    secondary={
                                                        <Box sx={{ mt: 0.5 }}>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {trip.date.toLocaleDateString()} at {trip.date.toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <AccessTime fontSize="small" color="action" />
                                                                    <Typography variant="caption">
                                                                        {trip.duration} min
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {trip.cost.toFixed(2)} LEI
                                                                </Typography>
                                                                <Chip
                                                                    label={trip.status}
                                                                    size="small"
                                                                    color="success"
                                                                    variant="outlined"
                                                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {index < Math.min(recentTrips.length, 3) - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Real-time Alerts */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Service Alerts
                            </Typography>

                            {realTimeUpdates.filter(update => update.status === 'delayed').length === 0 ? (
                                <Alert severity="success" icon={<DirectionsBus />}>
                                    All your favorite routes are running on time!
                                </Alert>
                            ) : (
                                <Box>
                                    {realTimeUpdates
                                        .filter(update => update.status === 'delayed')
                                        .slice(0, 3)
                                        .map((update, index) => (
                                            <Alert
                                                key={index}
                                                severity="warning"
                                                sx={{ mb: index < 2 ? 1 : 0 }}
                                                icon={<Warning />}
                                            >
                                                Route {update.routeId} is running {update.delayMinutes} minutes late
                                            </Alert>
                                        ))
                                    }
                                </Box>
                            )}

                            {/* Quick Stats */}
                            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 4 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" color="primary">
                                                {recentTrips.length}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Trips This Month
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" color="primary">
                                                {recentTrips.reduce((sum, trip) => sum + trip.cost, 0).toFixed(0)} LEI
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Total Spent
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" color="primary">
                                                {Math.round(recentTrips.reduce((sum, trip) => sum + trip.duration, 0) / 60)}h
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Time Traveled
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
        </Profiler>
    );
};

export default TravellerDashboard;