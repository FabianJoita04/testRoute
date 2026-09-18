import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    IconButton,
} from '@mui/material';
import {
    DirectionsBus,
    LocationOn,
    AccessTime,
    AttachMoney,
    Search,
    FilterList,
    Download,
    Star,
    StarBorder,
    DirectionsWalk,
} from '@mui/icons-material';
import Navbar from '../../components/common/Navbar';
import type { NotificationState } from "@/types";
import { useAuth } from '@/providers/KeycloakProvider';

interface TripHistoryProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

interface Trip {
    id: string;
    origin: string;
    destination: string;
    date: Date;
    duration: number;
    cost: number;
    status: 'completed' | 'cancelled' | 'in_progress';
    routes: string[];
    walkingDistance: number;
    transfers: number;
    isFavorite: boolean;
}

const TripHistory: React.FC<TripHistoryProps> = ({ showNotification }) => {
    const { user, hasRole } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    // Sample trip data for demonstration
    const sampleTrips: Trip[] = [
        {
            id: '1',
            origin: 'Piața Victoriei',
            destination: 'Piața Unirii',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            duration: 25,
            cost: 3.50,
            status: 'completed',
            routes: ['Route 15', 'Route 23'],
            walkingDistance: 650,
            transfers: 1,
            isFavorite: true,
        },
        {
            id: '2',
            origin: 'Gara de Nord',
            destination: 'Aeroportul Henri Coandă',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
            duration: 45,
            cost: 8.50,
            status: 'completed',
            routes: ['Route 780'],
            walkingDistance: 320,
            transfers: 0,
            isFavorite: false,
        },
        {
            id: '3',
            origin: 'Piața Română',
            destination: 'Băneasa Shopping City',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            duration: 32,
            cost: 3.50,
            status: 'completed',
            routes: ['Route 131', 'Route 205'],
            walkingDistance: 480,
            transfers: 1,
            isFavorite: false,
        },
        {
            id: '4',
            origin: 'Piața Obor',
            destination: 'Herastrau Park',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            duration: 28,
            cost: 3.50,
            status: 'completed',
            routes: ['Route 16', 'Route 131'],
            walkingDistance: 720,
            transfers: 1,
            isFavorite: true,
        },
        {
            id: '5',
            origin: 'Universitate',
            destination: 'Baneasa Airport',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            duration: 55,
            cost: 8.50,
            status: 'cancelled',
            routes: ['Route 783'],
            walkingDistance: 200,
            transfers: 0,
            isFavorite: false,
        },
    ];

    useEffect(() => {
        if (user && hasRole('traveller')) {
            loadTripHistory();
        }
    }, [user, hasRole]);

    useEffect(() => {
        // Apply filters whenever trips, search term, or filters change
        applyFilters();
    }, [trips, searchTerm, statusFilter, dateFilter]);

    const loadTripHistory = async () => {
        setIsLoading(true);
        try {
            // In production: const response = await apiService.getTripHistory(user.id);
            // For demo, use sample data
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            setTrips(sampleTrips);
            showNotification('Trip history loaded successfully', 'success');
        } catch (error: unknown) {
            console.error('Failed to load trip history:', error);
            showNotification('Failed to load trip history', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = trips;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(trip =>
                trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.routes.some(route => route.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(trip => trip.status === statusFilter);
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(trip => trip.date >= filterDate);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    filtered = filtered.filter(trip => trip.date >= filterDate);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    filtered = filtered.filter(trip => trip.date >= filterDate);
                    break;
            }
        }

        setFilteredTrips(filtered);
    };

    const handleToggleFavorite = (tripId: string) => {
        setTrips(prevTrips =>
            prevTrips.map(trip =>
                trip.id === tripId ? { ...trip, isFavorite: !trip.isFavorite } : trip
            )
        );
        showNotification('Trip favorite status updated', 'success');
    };

    const handleExportHistory = () => {
        // In production, implement actual CSV export
        showNotification('Export functionality coming soon!', 'info');
    };

    const formatDate = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffHours < 24) {
            return diffHours < 1 ? 'Just now' : `${Math.floor(diffHours)} hours ago`;
        } else if (diffDays < 7) {
            return `${Math.floor(diffDays)} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const formatDistance = (meters: number): string => {
        return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${meters}m`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            case 'in_progress': return 'warning';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            case 'in_progress': return 'In Progress';
            default: return status;
        }
    };

    // Statistics calculations
    const totalTrips = trips.length;
    const completedTrips = trips.filter(trip => trip.status === 'completed').length;
    const totalCost = trips.reduce((sum, trip) => sum + trip.cost, 0);
    const totalTime = trips.reduce((sum, trip) => sum + trip.duration, 0);
    const avgTripTime = completedTrips > 0 ? Math.round(totalTime / completedTrips) : 0;

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
                        You don't have permission to access trip history.
                        Current roles: {user.roles?.join(', ') || 'No roles assigned'}
                    </Alert>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Navbar />

            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Trip History
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        View and manage your past journeys in Bucharest
                    </Typography>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <DirectionsBus sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h4" color="primary">
                                    {totalTrips}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Total Trips
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <AccessTime sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h4" color="primary">
                                    {formatDuration(avgTripTime)}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Avg Trip Time
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <AttachMoney sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h4" color="primary">
                                    {totalCost.toFixed(0)} LEI
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Total Spent
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Star sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h4" color="primary">
                                    {trips.filter(trip => trip.isFavorite).length}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Favorite Routes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters and Search */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <FilterList />
                        <Typography variant="h6">Filters & Search</Typography>
                        <Box sx={{ ml: 'auto' }}>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={handleExportHistory}
                            >
                                Export
                            </Button>
                        </Box>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Search trips"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by location or route..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Date Range</InputLabel>
                                <Select
                                    value={dateFilter}
                                    label="Date Range"
                                    onChange={(e) => setDateFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Time</MenuItem>
                                    <MenuItem value="today">Today</MenuItem>
                                    <MenuItem value="week">Last Week</MenuItem>
                                    <MenuItem value="month">Last Month</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Trip List */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Your Trips ({filteredTrips.length})
                    </Typography>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredTrips.length === 0 ? (
                        <Alert severity="info">
                            {trips.length === 0
                                ? "No trips found. Start planning your first journey!"
                                : "No trips match your current filters."
                            }
                        </Alert>
                    ) : (
                        <List>
                            {filteredTrips.map((trip, index) => (
                                <React.Fragment key={trip.id}>
                                    <ListItem
                                        sx={{
                                            px: 0,
                                            py: 2,
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        <ListItemIcon sx={{ mt: 1 }}>
                                            <LocationOn color="primary" />
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="h6">
                                                        {trip.origin} → {trip.destination}
                                                    </Typography>
                                                    <Chip
                                                        label={getStatusLabel(trip.status)}
                                                        color={getStatusColor(trip.status) as 'success' | 'error' | 'warning' | 'default'}
                                                        size="small"
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToggleFavorite(trip.id)}
                                                    >
                                                        {trip.isFavorite ? (
                                                            <Star color="warning" />
                                                        ) : (
                                                            <StarBorder />
                                                        )}
                                                    </IconButton>
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                                        {formatDate(trip.date)}
                                                    </Typography>

                                                    {/* Route badges */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                                        {trip.routes.map((route) => (
                                                            <Chip
                                                                key={route}
                                                                label={route}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ height: 20 }}
                                                            />
                                                        ))}
                                                    </Box>

                                                    {/* Trip details */}
                                                    <Grid container spacing={3}>
                                                        <Grid size={3}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <AccessTime fontSize="small" color="action" />
                                                                <Typography variant="caption">
                                                                    {formatDuration(trip.duration)}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>

                                                        <Grid size={3}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <DirectionsWalk fontSize="small" color="action" />
                                                                <Typography variant="caption">
                                                                    {formatDistance(trip.walkingDistance)}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>

                                                        <Grid size={3}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <AttachMoney fontSize="small" color="action" />
                                                                <Typography variant="caption">
                                                                    {trip.cost.toFixed(2)} LEI
                                                                </Typography>
                                                            </Box>
                                                        </Grid>

                                                        <Grid size={3}>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {trip.transfers} transfer{trip.transfers !== 1 ? 's' : ''}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < filteredTrips.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default TripHistory;