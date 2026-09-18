import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    Stack,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    LinearProgress
} from '@mui/material';
import {
    Close,
    DirectionsBus,
    Schedule,
    People,
    TrendingUp,
    LocationOn,
    Accessible,
    Timer
} from '@mui/icons-material';
import type { BusRoute } from '@/types';

interface RouteDetailsPanelProps {
    route: BusRoute | null;
    onClose: () => void;
}

const RouteDetailsPanel: React.FC<RouteDetailsPanelProps> = ({ route, onClose }) => {
    if (!route) {
        return (
            <Paper sx={{
                p: 3,
                height: 'calc(100vh - 200px)',
                maxHeight: 'calc(100vh - 200px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'sticky',
                top: '24px'
            }}>
                <Typography variant="body1" color="textSecondary">
                    Select a route to view details
                </Typography>
            </Paper>
        );
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Inactive':
                return 'default';
            case 'Under Maintenance':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatDistance = (meters?: number): string => {
        if (!meters) return 'N/A';
        return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${meters} m`;
    };

    return (
        <Paper sx={{
            p: 3,
            height: 'calc(100vh - 200px)',
            maxHeight: 'calc(100vh - 200px)',
            overflow: 'auto',
            position: 'sticky',
            top: '24px'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Typography variant="h5" fontWeight="bold">
                            {route.code}
                        </Typography>
                        <Chip label={route.status} color={getStatusColor(route.status)} size="small" />
                    </Stack>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        {route.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {route.description}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                Route Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <LocationOn color="primary" />
                                <Typography variant="caption" color="textSecondary">
                                    Route Endpoints
                                </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="medium">
                                {route.startPoint || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                →
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {route.endPoint || 'N/A'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <Schedule color="primary" />
                                <Typography variant="caption" color="textSecondary">
                                    Operating Hours
                                </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="medium">
                                {route.operatingHours?.start || 'N/A'} - {route.operatingHours?.end || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Frequency: Every {route.frequency || 'N/A'} minutes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <DirectionsBus color="primary" />
                                <Typography variant="caption" color="textSecondary">
                                    Vehicle Type
                                </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="medium">
                                {route.vehicleType || 'N/A'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <Timer color="primary" />
                                <Typography variant="caption" color="textSecondary">
                                    Travel Time
                                </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="medium">
                                {route.estimatedTravelTime || 'N/A'} minutes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Performance Metrics
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <People color="primary" />
                                <Typography variant="caption" color="textSecondary">
                                    Average Daily Passengers
                                </Typography>
                            </Stack>
                            <Typography variant="h6" fontWeight="bold">
                                {route.averageDailyPassengers?.toLocaleString() || 'N/A'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <TrendingUp color="primary" />
                                <Typography variant="caption" color="textSecondary">
                                    On-Time Performance
                                </Typography>
                            </Stack>
                            <Typography variant="h6" fontWeight="bold">
                                {route.onTimePerformance || 'N/A'}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={route.onTimePerformance || 0}
                                sx={{ mt: 1 }}
                                color={
                                    (route.onTimePerformance || 0) >= 90
                                        ? 'success'
                                        : (route.onTimePerformance || 0) >= 75
                                        ? 'warning'
                                        : 'error'
                                }
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <DirectionsBus color="primary" />
                                <Typography variant="caption" color="textSecondary">
                                    Capacity Utilization
                                </Typography>
                            </Stack>
                            <Typography variant="h6" fontWeight="bold">
                                {route.capacityUtilization || 'N/A'}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={route.capacityUtilization || 0}
                                sx={{ mt: 1 }}
                                color={
                                    (route.capacityUtilization || 0) >= 90
                                        ? 'error'
                                        : (route.capacityUtilization || 0) >= 75
                                        ? 'warning'
                                        : 'success'
                                }
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Bus Stops ({route.busStops?.length || 0})
            </Typography>

            <List>
                {route.busStops?.map((stop, index) => (
                    <ListItem
                        key={stop.id}
                        divider={index < (route.busStops?.length || 0) - 1}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            mb: 1,
                            border: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <ListItemText
                            primary={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        label={index + 1}
                                        size="small"
                                        color="primary"
                                        sx={{ width: 32, height: 24 }}
                                    />
                                    <Typography variant="body1" fontWeight="medium">
                                        {stop.name}
                                    </Typography>
                                    {stop.isAccessible && (
                                        <Tooltip title="Accessible">
                                            <Accessible fontSize="small" color="primary" />
                                        </Tooltip>
                                    )}
                                    <Chip
                                        label={stop.zoneType}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                            }
                            secondary={
                                <Box sx={{ mt: 1 }}>
                                    <Grid container spacing={2}>
                                        {stop.averageWaitTime && (
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Avg Wait Time: <strong>{stop.averageWaitTime} min</strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                        {stop.passengerBoardingStats && (
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Daily Boarding: <strong>{stop.passengerBoardingStats.dailyAverage}</strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                        {stop.passengerAlightingStats && (
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Daily Alighting: <strong>{stop.passengerAlightingStats.dailyAverage}</strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                        {stop.distanceToNext && index < (route.busStops?.length || 0) - 1 && (
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Distance to next: <strong>{formatDistance(stop.distanceToNext)}</strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                                        Location: {stop.location.latitude.toFixed(5)}, {stop.location.longitude.toFixed(5)}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
                {(!route.busStops || route.busStops.length === 0) && (
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                        No stops configured for this route
                    </Typography>
                )}
            </List>
        </Paper>
    );
};

export default RouteDetailsPanel;
