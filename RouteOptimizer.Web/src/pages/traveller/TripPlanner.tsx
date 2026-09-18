import React, {useRef, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import {
    AccessTime,
    AttachMoney,
    DirectionsBus,
    DirectionsWalk,
    ExpandMore,
    LocationOn,
    MyLocation,
    Navigation,
    Schedule,
    SwapVert,
} from '@mui/icons-material';
import {MapContainer, Marker, Polyline, Popup, TileLayer} from 'react-leaflet';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type {NotificationState, TripOption, TripSegment} from '@/types';
import Navbar from '../../components/common/Navbar';
import {useAuth} from '@/providers/KeycloakProvider';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface TripPlannerProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ showNotification }) => {
    const { user, hasRole } = useAuth();
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
    const [departureTime, setDepartureTime] = useState(
        new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)
    );
    const [tripOptions, setTripOptions] = useState<TripOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<TripOption | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([44.4268, 26.1025]); // Bucharest default

    // Preferences
    const [maxWalkingDistance, setMaxWalkingDistance] = useState(800);
    const [accessibilityRequired, setAccessibilityRequired] = useState(false);
    const [routeType, setRouteType] = useState<'fastest' | 'cheapest' | 'least_transfers'>('fastest');
    const [avoidCrowdedRoutes, setAvoidCrowdedRoutes] = useState(false);

    const mapRef = useRef<LeafletMap | null>(null);

    // Get user's current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setOriginCoords(coords);
                    setMapCenter(coords);
                    setOrigin(`${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`);
                    showNotification('Current location set as origin', 'success');
                },
                () => {
                    showNotification('Unable to get current location', 'error');
                }
            );
        } else {
            showNotification('Geolocation is not supported by this browser', 'error');
        }
    };

    // Geocode address to coordinates (simplified - in production use proper geocoding service)
    const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
        // This is a simplified geocoding - in production, use Google Maps API or similar
        try {
            // For demo purposes, return Bucharest area coordinates
            // In production, you would call a real geocoding service with the address
            console.log('Geocoding address:', address);
            return [44.4268 + (Math.random() - 0.5) * 0.1, 26.1025 + (Math.random() - 0.5) * 0.1];
        } catch (error: unknown) {
            console.error('Geocoding error:', error);
            return null;
        }
    };

    // Handle address input change
    const handleOriginChange = async (value: string) => {
        setOrigin(value);
        if (value.length > 5) {
            const coords = await geocodeAddress(value);
            if (coords) {
                setOriginCoords(coords);
                // Update map center to origin
                setMapCenter(coords);
            }
        }
    };

    const handleDestinationChange = async (value: string) => {
        setDestination(value);
        if (value.length > 5) {
            const coords = await geocodeAddress(value);
            if (coords) {
                setDestinationCoords(coords);
            }
        }
    };

    // Swap origin and destination
    const swapLocations = () => {
        const tempOrigin = origin;
        const tempOriginCoords = originCoords;

        setOrigin(destination);
        setOriginCoords(destinationCoords);
        setDestination(tempOrigin);
        setDestinationCoords(tempOriginCoords);
    };

    // Generate sample trip options for demo
    const generateSampleTripOptions = (): TripOption[] => {
        if (!originCoords || !destinationCoords) return [];

        return [
            {
                id: '1',
                routeType: 'fastest',
                totalTravelTimeMinutes: 32,
                totalWalkingDistanceMeters: 650,
                totalCost: 3.50,
                transferCount: 1,
                segments: [
                    {
                        id: '1-1',
                        type: 'walking',
                        routeName: '',
                        startLocation: {latitude: originCoords[0], longitude: originCoords[1]},
                        endLocation: {latitude: originCoords[0] + 0.002, longitude: originCoords[1] + 0.001},
                        startLocationName: 'Origin',
                        endLocationName: 'Piața Victoriei Station',
                        startTime: new Date(departureTime).toISOString(),
                        endTime: new Date(new Date(departureTime).getTime() + 8 * 60 * 1000).toISOString(),
                        durationMinutes: 8,
                        walkingInstructions: 'Walk east on Calea Victoriei towards the metro station',
                        distanceMeters: 0,
                        cost: 0
                    },
                    {
                        id: '1-2',
                        type: 'bus',
                        routeName: 'Route 15',
                        startLocation: {latitude: originCoords[0] + 0.002, longitude: originCoords[1] + 0.001},
                        endLocation: {latitude: destinationCoords[0] - 0.001, longitude: destinationCoords[1] - 0.002},
                        startLocationName: 'Piața Victoriei',
                        endLocationName: 'Piața Unirii',
                        startTime: new Date(new Date(departureTime).getTime() + 10 * 60 * 1000).toISOString(),
                        endTime: new Date(new Date(departureTime).getTime() + 25 * 60 * 1000).toISOString(),
                        durationMinutes: 15,
                        distanceMeters: 0,
                        cost: 0
                    },
                    {
                        id: '1-3',
                        type: 'walking',
                        routeName: '',
                        startLocation: {
                            latitude: destinationCoords[0] - 0.001,
                            longitude: destinationCoords[1] - 0.002
                        },
                        endLocation: {latitude: destinationCoords[0], longitude: destinationCoords[1]},
                        startLocationName: 'Piața Unirii',
                        endLocationName: 'Destination',
                        startTime: new Date(new Date(departureTime).getTime() + 25 * 60 * 1000).toISOString(),
                        endTime: new Date(new Date(departureTime).getTime() + 32 * 60 * 1000).toISOString(),
                        durationMinutes: 7,
                        walkingInstructions: 'Walk south to your destination',
                        distanceMeters: 0,
                        cost: 0
                    },
                ],
                departureTime: '',
                arrivalTime: '',
                confidenceScore: 0
            },
            {
                id: '2',
                routeType: 'cheapest',
                totalTravelTimeMinutes: 45,
                totalWalkingDistanceMeters: 920,
                totalCost: 2.50,
                transferCount: 2,
                segments: [
                    {
                        id: '2-1',
                        type: 'walking',
                        routeName: '',
                        startLocation: {latitude: originCoords[0], longitude: originCoords[1]},
                        endLocation: {latitude: originCoords[0] + 0.003, longitude: originCoords[1] + 0.002},
                        startLocationName: 'Origin',
                        endLocationName: 'Bus Stop A',
                        startTime: new Date(departureTime).toISOString(),
                        endTime: new Date(new Date(departureTime).getTime() + 12 * 60 * 1000).toISOString(),
                        durationMinutes: 12,
                        walkingInstructions: 'Walk to the nearest bus stop',
                        distanceMeters: 0,
                        cost: 0
                    },
                    {
                        id: '2-2',
                        type: 'bus',
                        routeName: 'Route 5',
                        startLocation: {latitude: originCoords[0] + 0.003, longitude: originCoords[1] + 0.002},
                        endLocation: {
                            latitude: (originCoords[0] + destinationCoords[0]) / 2,
                            longitude: (originCoords[1] + destinationCoords[1]) / 2
                        },
                        startLocationName: 'Bus Stop A',
                        endLocationName: 'Transfer Hub',
                        startTime: new Date(new Date(departureTime).getTime() + 15 * 60 * 1000).toISOString(),
                        endTime: new Date(new Date(departureTime).getTime() + 30 * 60 * 1000).toISOString(),
                        durationMinutes: 15,
                        distanceMeters: 0,
                        cost: 0
                    },
                    {
                        id: '2-3',
                        type: 'bus',
                        routeName: 'Route 23',
                        startLocation: {
                            latitude: (originCoords[0] + destinationCoords[0]) / 2,
                            longitude: (originCoords[1] + destinationCoords[1]) / 2
                        },
                        endLocation: {latitude: destinationCoords[0] - 0.001, longitude: destinationCoords[1] - 0.001},
                        startLocationName: 'Transfer Hub',
                        endLocationName: 'Near Destination',
                        startTime: new Date(new Date(departureTime).getTime() + 33 * 60 * 1000).toISOString(),
                        endTime: new Date(new Date(departureTime).getTime() + 40 * 60 * 1000).toISOString(),
                        durationMinutes: 7,
                        distanceMeters: 0,
                        cost: 0
                    },
                    {
                        id: '2-4',
                        type: 'walking',
                        routeName: '',
                        startLocation: {
                            latitude: destinationCoords[0] - 0.001,
                            longitude: destinationCoords[1] - 0.001
                        },
                        endLocation: {latitude: destinationCoords[0], longitude: destinationCoords[1]},
                        startLocationName: 'Near Destination',
                        endLocationName: 'Destination',
                        startTime: new Date(new Date(departureTime).getTime() + 40 * 60 * 1000).toISOString(),
                        endTime: new Date(new Date(departureTime).getTime() + 45 * 60 * 1000).toISOString(),
                        durationMinutes: 5,
                        walkingInstructions: 'Short walk to final destination',
                        distanceMeters: 0,
                        cost: 0
                    },
                ],
                departureTime: '',
                arrivalTime: '',
                confidenceScore: 0
            }
        ];
    };

    // Plan trip
    const handlePlanTrip = async () => {
        if (!originCoords || !destinationCoords) {
            showNotification('Please enter valid origin and destination addresses', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            // const request: TripRequest = {
            //     origin: {
            //         latitude: originCoords[0],
            //         longitude: originCoords[1],
            //     },
            //     destination: {
            //         latitude: destinationCoords[0],
            //         longitude: destinationCoords[1],
            //     },
            //     departureTime,
            //     preferences: {
            //         maxWalkingDistanceMeters: maxWalkingDistance,
            //         accessibilityRequired,
            //         routeType,
            //         avoidCrowdedRoutes,
            //     },
            // };

            // In development, use sample data
            // In production, use: const response = await apiService.planTrip(request);
            const sampleOptions = generateSampleTripOptions();

            if (sampleOptions.length > 0) {
                setTripOptions(sampleOptions);
                setSelectedOption(sampleOptions[0]);
                showNotification(`Found ${sampleOptions.length} trip options`, 'success');
            } else {
                showNotification('No trip options found. Please try different locations.', 'warning');
            }

            // Uncomment for production API call:
            // const response = await apiService.planTrip(request);
            // if (response.success) {
            //     setTripOptions(response.data);
            //     setSelectedOption(response.data[0] || null);
            //     showNotification(`Found ${response.data.length} trip options`, 'success');
            // } else {
            //     showNotification('Failed to plan trip', 'error');
            // }
        } catch (error: unknown) {
            console.error('Trip planning error:', error);
            showNotification('Error planning trip. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Format duration
    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // Format distance
    const formatDistance = (meters: number): string => {
        return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
    };

    // Get segment icon
    const getSegmentIcon = (segment: TripSegment) => {
        switch (segment.type) {
            case 'walking':
                return <DirectionsWalk />;
            case 'bus':
                return <DirectionsBus />;
            case 'waiting':
                return <Schedule />;
            default:
                return <DirectionsBus />;
        }
    };

    // Get segment color
    const getSegmentColor = (segment: TripSegment) => {
        switch (segment.type) {
            case 'walking':
                return '#4caf50';
            case 'bus':
                return '#2196f3';
            case 'waiting':
                return '#ff9800';
            default:
                return '#757575';
        }
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
                        You don't have permission to access the trip planner.
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
                        Plan Your Trip
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Find the best public transport routes in Bucharest
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Trip Planning Form */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Trip Details
                            </Typography>

                            {/* Origin */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="From"
                                    value={origin}
                                    onChange={(e) => handleOriginChange(e.target.value)}
                                    placeholder="e.g., Piața Victoriei, Bucharest"
                                    slotProps={{
                                        input: {
                                            startAdornment: <Navigation color="success" sx={{ mr: 1 }} />,
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={getCurrentLocation}
                                    sx={{ ml: 1 }}
                                    title="Use current location"
                                >
                                    <MyLocation />
                                </IconButton>
                            </Box>

                            {/* Swap Button */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <IconButton
                                    onClick={swapLocations}
                                    title="Swap origin and destination"
                                    disabled={!origin || !destination}
                                >
                                    <SwapVert />
                                </IconButton>
                            </Box>

                            {/* Destination */}
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="To"
                                    value={destination}
                                    onChange={(e) => handleDestinationChange(e.target.value)}
                                    placeholder="e.g., Piața Unirii, Bucharest"
                                    slotProps={{
                                        input: {
                                            startAdornment: <LocationOn color="error" sx={{ mr: 1 }} />,
                                        }
                                    }}
                                />
                            </Box>

                            {/* Departure Time */}
                            <TextField
                                fullWidth
                                label="Departure Time"
                                type="datetime-local"
                                value={departureTime}
                                onChange={(e) => setDepartureTime(e.target.value)}
                                sx={{ mb: 3 }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    }
                                }}
                            />

                            {/* Preferences */}
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>Trip Preferences</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            label="Max Walking Distance (meters)"
                                            type="number"
                                            value={maxWalkingDistance}
                                            onChange={(e) => setMaxWalkingDistance(Number(e.target.value))}
                                            slotProps={{
                                                htmlInput: { min: 100, max: 2000, step: 100 }
                                            }}
                                        />

                                        <FormControl fullWidth>
                                            <InputLabel>Route Type</InputLabel>
                                            <Select
                                                value={routeType}
                                                label="Route Type"
                                                onChange={(e) => setRouteType(e.target.value as 'fastest' | 'cheapest' | 'least_transfers')}
                                            >
                                                <MenuItem value="fastest">Fastest Route</MenuItem>
                                                <MenuItem value="cheapest">Cheapest Route</MenuItem>
                                                <MenuItem value="least_transfers">Least Transfers</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={accessibilityRequired}
                                                    onChange={(e) => setAccessibilityRequired(e.target.checked)}
                                                />
                                            }
                                            label="Accessibility Required"
                                        />

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={avoidCrowdedRoutes}
                                                    onChange={(e) => setAvoidCrowdedRoutes(e.target.checked)}
                                                />
                                            }
                                            label="Avoid Crowded Routes"
                                        />
                                    </Box>
                                </AccordionDetails>
                            </Accordion>

                            {/* Plan Trip Button */}
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handlePlanTrip}
                                disabled={isLoading || !origin || !destination}
                                sx={{ mt: 3 }}
                                startIcon={isLoading ? <CircularProgress size={20} /> : <Navigation />}
                            >
                                {isLoading ? 'Planning Trip...' : 'Plan Trip'}
                            </Button>
                        </Paper>

                        {/* Trip Options */}
                        {tripOptions.length > 0 && (
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Trip Options ({tripOptions.length})
                                </Typography>

                                {tripOptions.map((option, index) => (
                                    <Card
                                        key={option.id}
                                        sx={{
                                            mb: 2,
                                            cursor: 'pointer',
                                            border: selectedOption?.id === option.id ? 2 : 1,
                                            borderColor: selectedOption?.id === option.id ? 'primary.main' : 'divider',
                                            '&:hover': {
                                                boxShadow: 3,
                                            },
                                        }}
                                        onClick={() => setSelectedOption(option)}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6">
                                                    Option {index + 1}
                                                </Typography>
                                                <Chip
                                                    label={option.routeType}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>

                                            <Grid container spacing={2}>
                                                <Grid size={4}>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <AccessTime color="action" />
                                                        <Typography variant="body2" color="textSecondary">
                                                            Duration
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="bold">
                                                            {formatDuration(option.totalTravelTimeMinutes)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                <Grid size={4}>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <DirectionsWalk color="action" />
                                                        <Typography variant="body2" color="textSecondary">
                                                            Walking
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="bold">
                                                            {formatDistance(option.totalWalkingDistanceMeters)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                <Grid size={4}>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <AttachMoney color="action" />
                                                        <Typography variant="body2" color="textSecondary">
                                                            Cost
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="bold">
                                                            {option.totalCost.toFixed(2)} LEI
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>

                                            {option.transferCount > 0 && (
                                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                                    {option.transferCount} transfer{option.transferCount > 1 ? 's' : ''}
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </Paper>
                        )}
                    </Grid>

                    {/* Map */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 2, height: '600px' }}>
                            <MapContainer
                                center={mapCenter}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                ref={mapRef}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {/* Origin Marker */}
                                {originCoords && (
                                    <Marker position={originCoords}>
                                        <Popup>
                                            <strong>Origin</strong><br />
                                            {origin}
                                        </Popup>
                                    </Marker>
                                )}

                                {/* Destination Marker */}
                                {destinationCoords && (
                                    <Marker position={destinationCoords}>
                                        <Popup>
                                            <strong>Destination</strong><br />
                                            {destination}
                                        </Popup>
                                    </Marker>
                                )}

                                {/* Route Polyline */}
                                {selectedOption && (
                                    <>
                                        {selectedOption.segments.map((segment, index) => {
                                            if (segment.type === 'walking') {
                                                return (
                                                    <Polyline
                                                        key={`segment-${index}`}
                                                        positions={[
                                                            [segment.startLocation.latitude, segment.startLocation.longitude],
                                                            [segment.endLocation.latitude, segment.endLocation.longitude],
                                                        ]}
                                                        color={getSegmentColor(segment)}
                                                        weight={3}
                                                        dashArray="5, 10"
                                                    />
                                                );
                                            } else if (segment.type === 'bus') {
                                                return (
                                                    <Polyline
                                                        key={`segment-${index}`}
                                                        positions={[
                                                            [segment.startLocation.latitude, segment.startLocation.longitude],
                                                            [segment.endLocation.latitude, segment.endLocation.longitude],
                                                        ]}
                                                        color={getSegmentColor(segment)}
                                                        weight={5}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}
                                    </>
                                )}
                            </MapContainer>
                        </Paper>

                        {/* Selected Trip Details */}
                        {selectedOption && (
                            <Paper sx={{ p: 3, mt: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Trip Details
                                </Typography>

                                {selectedOption.segments.map((segment, index) => (
                                    <Box key={index} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            {getSegmentIcon(segment)}
                                            <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                                                {segment.type === 'walking' && 'Walk'}
                                                {segment.type === 'bus' && `Bus ${segment.routeName}`}
                                                {segment.type === 'waiting' && 'Wait'}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                                                {formatDuration(segment.durationMinutes)}
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" color="textSecondary">
                                            {segment.startLocationName} → {segment.endLocationName}
                                        </Typography>

                                        <Typography variant="body2" color="textSecondary">
                                            {new Date(segment.startTime).toLocaleTimeString()} - {new Date(segment.endTime).toLocaleTimeString()}
                                        </Typography>

                                        {segment.walkingInstructions && (
                                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                                {segment.walkingInstructions}
                                            </Typography>
                                        )}

                                        {index < selectedOption.segments.length - 1 && <Divider sx={{ mt: 2 }} />}
                                    </Box>
                                ))}

                                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <Grid container spacing={2}>
                                        <Grid size={3}>
                                            <Typography variant="body2" color="textSecondary">
                                                Total Time
                                            </Typography>
                                            <Typography variant="h6">
                                                {formatDuration(selectedOption.totalTravelTimeMinutes)}
                                            </Typography>
                                        </Grid>

                                        <Grid size={3}>
                                            <Typography variant="body2" color="textSecondary">
                                                Walking
                                            </Typography>
                                            <Typography variant="h6">
                                                {formatDistance(selectedOption.totalWalkingDistanceMeters)}
                                            </Typography>
                                        </Grid>

                                        <Grid size={3}>
                                            <Typography variant="body2" color="textSecondary">
                                                Cost
                                            </Typography>
                                            <Typography variant="h6">
                                                {selectedOption.totalCost.toFixed(2)} LEI
                                            </Typography>
                                        </Grid>

                                        <Grid size={3}>
                                            <Typography variant="body2" color="textSecondary">
                                                Transfers
                                            </Typography>
                                            <Typography variant="h6">
                                                {selectedOption.transferCount}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={() => {
                                            // In production, save to user's favorites via API
                                            showNotification('Trip saved to favorites!', 'success');
                                        }}
                                    >
                                        Save This Trip
                                    </Button>
                                </Box>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default TripPlanner;