import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Chip,
    Stack,
    FormControlLabel,
    Switch
} from '@mui/material';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BusRoute, BusStop } from '@/types';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface RouteMapViewProps {
    routes: BusRoute[];
    selectedRoute: BusRoute | null;
    onSelectRoute: (route: BusRoute) => void;
}

interface MapControllerProps {
    center: [number, number];
    zoom: number;
}

const MapController: React.FC<MapControllerProps> = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    return null;
};

const RouteMapView: React.FC<RouteMapViewProps> = ({ routes, selectedRoute, onSelectRoute }) => {
    const mapRef = useRef<LeafletMap | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([44.4268, 26.1025]);
    const [mapZoom, setMapZoom] = useState(12);
    const [colorMode, setColorMode] = useState<'status' | 'performance'>('status');
    const [showStops, setShowStops] = useState(true);
    const [showRoutes, setShowRoutes] = useState(true);
    const polylineRefs = useRef<{ [key: number]: L.Polyline }>({});

    useEffect(() => {
        if (selectedRoute && selectedRoute.path && selectedRoute.path.length > 0) {
            const firstPoint = selectedRoute.path[0];
            setMapCenter(firstPoint);
            setMapZoom(13);
        }
    }, [selectedRoute]);

    const getRouteColor = (route: BusRoute): string => {
        if (selectedRoute && selectedRoute.id !== route.id) {
            return '#cccccc';
        }

        if (colorMode === 'status') {
            switch (route.status) {
                case 'Active':
                    // Use different colors for different active routes
                    const routeColors = ['#2196f3', '#4caf50', '#9c27b0', '#ff5722', '#00bcd4', '#ff9800', '#3f51b5'];
                    return routeColors[route.id % routeColors.length];
                case 'Inactive':
                    return '#9e9e9e';
                case 'Under Maintenance':
                    return '#ff9800';
                default:
                    return '#2196f3';
            }
        } else {
            const performance = route.onTimePerformance || 0;
            if (performance >= 90) return '#4caf50';
            if (performance >= 75) return '#ff9800';
            return '#f44336';
        }
    };

    const getRouteWeight = (route: BusRoute): number => {
        return selectedRoute && selectedRoute.id === route.id ? 5 : 3;
    };

    const getRouteOpacity = (route: BusRoute): number => {
        if (!selectedRoute) return 0.7;
        return selectedRoute.id === route.id ? 1 : 0.3;
    };

    const createStopIcon = (stop: BusStop) => {
        const color = stop.isActive ? '#2196f3' : '#9e9e9e';

        return L.divIcon({
            className: 'custom-stop-marker',
            html: `
                <div style="
                    background-color: ${color};
                    width: 10px;
                    height: 10px;
                    border-radius: 2px;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                    cursor: pointer;
                "></div>
            `,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
        });
    };

    const createBusIcon = () => {
        return L.divIcon({
            className: 'custom-bus-marker',
            html: `
                <div style="
                    background-color: #f44336;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                    animation: pulse 2s infinite;
                "></div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        });
    };

    const activeRoutes = routes.filter(r => showRoutes && r.path && r.path.length > 0);

    // Get all unique stops from visible routes
    const visibleStops = React.useMemo(() => {
        if (!showStops) return [];

        const routesToShowStopsFor = selectedRoute ? [selectedRoute] : activeRoutes;
        const stopsMap = new Map<number, BusStop>();

        routesToShowStopsFor.forEach(route => {
            route.busStops?.forEach(stop => {
                stopsMap.set(stop.id, stop);
            });
        });

        return Array.from(stopsMap.values());
    }, [showStops, selectedRoute, activeRoutes]);

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2">
                        Map Controls:
                    </Typography>

                    <ToggleButtonGroup
                        value={colorMode}
                        exclusive
                        onChange={(_e, value) => value && setColorMode(value)}
                        size="small"
                    >
                        <ToggleButton value="status">
                            By Status
                        </ToggleButton>
                        <ToggleButton value="performance">
                            By Performance
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={showRoutes}
                                onChange={(e) => setShowRoutes(e.target.checked)}
                                size="small"
                            />
                        }
                        label="Show Routes"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={showStops}
                                onChange={(e) => setShowStops(e.target.checked)}
                                size="small"
                            />
                        }
                        label="Show Stops"
                    />

                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {colorMode === 'status' ? (
                            <>
                                <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
                                    Each active route has a unique color
                                </Typography>
                                <Chip label="Inactive" size="small" sx={{ bgcolor: '#9e9e9e', color: 'white' }} />
                                <Chip label="Maintenance" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
                            </>
                        ) : (
                            <>
                                <Chip label="≥90% On-Time" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                                <Chip label="75-89% On-Time" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
                                <Chip label="<75% On-Time" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
                            </>
                        )}
                    </Box>
                </Stack>
            </Paper>

            <Paper sx={{ height: '600px', position: 'relative' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                >
                    <MapController center={mapCenter} zoom={mapZoom} />

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {activeRoutes.map((route) => (
                        <React.Fragment key={`route-${route.id}`}>
                            {/* Invisible wider polyline for larger hover area */}
                            <Polyline
                                positions={route.path || []}
                                pathOptions={{
                                    color: 'transparent',
                                    weight: 20,
                                    opacity: 0
                                }}
                                eventHandlers={{
                                    click: () => onSelectRoute(route),
                                    mouseover: () => {
                                        const visiblePolyline = polylineRefs.current[route.id];
                                        if (visiblePolyline) {
                                            visiblePolyline.setStyle({
                                                weight: 7,
                                                opacity: 1
                                            });
                                            visiblePolyline.openPopup();
                                        }
                                    },
                                    mouseout: () => {
                                        const visiblePolyline = polylineRefs.current[route.id];
                                        if (visiblePolyline) {
                                            visiblePolyline.setStyle({
                                                weight: getRouteWeight(route),
                                                opacity: getRouteOpacity(route)
                                            });
                                            visiblePolyline.closePopup();
                                        }
                                    }
                                }}
                            />

                            {/* Visible polyline */}
                            <Polyline
                                ref={(el) => {
                                    if (el) {
                                        polylineRefs.current[route.id] = el;
                                    }
                                }}
                                positions={route.path || []}
                                pathOptions={{
                                    color: getRouteColor(route),
                                    weight: getRouteWeight(route),
                                    opacity: getRouteOpacity(route)
                                }}
                                eventHandlers={{
                                    click: () => onSelectRoute(route),
                                    mouseover: (e) => {
                                        const layer = e.target;
                                        layer.setStyle({
                                            weight: 7,
                                            opacity: 1
                                        });
                                        layer.openPopup();
                                    },
                                    mouseout: (e) => {
                                        const layer = e.target;
                                        layer.setStyle({
                                            weight: getRouteWeight(route),
                                            opacity: getRouteOpacity(route)
                                        });
                                        layer.closePopup();
                                    }
                                }}
                            >
                            <Popup maxWidth={280} autoPan={false}>
                                <Box sx={{ minWidth: 200 }}>
                                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                            {route.code}
                                        </Typography>
                                        <Chip
                                            label={route.status}
                                            size="small"
                                            color={
                                                route.status === 'Active' ? 'success' :
                                                route.status === 'Under Maintenance' ? 'warning' : 'default'
                                            }
                                            sx={{ height: 18, fontSize: '0.65rem' }}
                                        />
                                    </Stack>

                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                                        {route.name}
                                    </Typography>

                                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                                        {route.startPoint} → {route.endPoint}
                                    </Typography>

                                    <Stack spacing={0.5}>
                                        <Stack direction="row" spacing={1.5}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Stops: <strong>{route.busStops?.length || 0}</strong>
                                                </Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Freq: <strong>{route.frequency || 'N/A'} min</strong>
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1.5}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Hours: <strong>{route.operatingHours?.start}-{route.operatingHours?.end}</strong>
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1.5}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Passengers: <strong>{route.averageDailyPassengers?.toLocaleString() || 'N/A'}</strong>
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1.5}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography
                                                    variant="caption"
                                                    color={
                                                        (route.onTimePerformance || 0) >= 90 ? 'success.main' :
                                                        (route.onTimePerformance || 0) >= 75 ? 'warning.main' : 'error.main'
                                                    }
                                                >
                                                    On-Time: <strong>{route.onTimePerformance || 'N/A'}%</strong>
                                                </Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography
                                                    variant="caption"
                                                    color={
                                                        (route.capacityUtilization || 0) >= 90 ? 'error.main' :
                                                        (route.capacityUtilization || 0) >= 75 ? 'warning.main' : 'success.main'
                                                    }
                                                >
                                                    Capacity: <strong>{route.capacityUtilization || 'N/A'}%</strong>
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Popup>
                        </Polyline>
                        </React.Fragment>
                    ))}

                    {visibleStops.map((stop) => (
                        <Marker
                            key={`stop-${stop.id}`}
                            position={[stop.location.latitude, stop.location.longitude]}
                            icon={createStopIcon(stop)}
                        >
                            <Popup>
                                <Box sx={{ minWidth: 180 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        {stop.name}
                                    </Typography>
                                    <Stack spacing={0.5}>
                                        <Typography variant="caption">
                                            Zone: {stop.zoneType}
                                        </Typography>
                                        <Typography variant="caption">
                                            Accessible: {stop.isAccessible ? 'Yes' : 'No'}
                                        </Typography>
                                        {stop.averageWaitTime && (
                                            <Typography variant="caption">
                                                Avg Wait: {stop.averageWaitTime} min
                                            </Typography>
                                        )}
                                        {stop.passengerBoardingStats && (
                                            <Typography variant="caption">
                                                Daily Boarding: {stop.passengerBoardingStats.dailyAverage}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </Popup>
                        </Marker>
                    ))}

                    {selectedRoute?.buses?.map((bus) => bus.currentLocation && (
                        <Marker
                            key={`bus-${bus.id}`}
                            position={[bus.currentLocation.latitude, bus.currentLocation.longitude]}
                            icon={createBusIcon()}
                        >
                            <Popup>
                                <Box sx={{ minWidth: 150 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Bus {bus.licenseNumber}
                                    </Typography>
                                    <Stack spacing={0.5}>
                                        <Typography variant="caption">
                                            Type: {bus.busType}
                                        </Typography>
                                        <Typography variant="caption">
                                            Capacity: {bus.capacity}
                                        </Typography>
                                        <Typography variant="caption">
                                            Status: {bus.isActive ? 'Active' : 'Inactive'}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                <style>
                    {`
                        @keyframes pulse {
                            0% {
                                transform: scale(1);
                                opacity: 1;
                            }
                            50% {
                                transform: scale(1.2);
                                opacity: 0.8;
                            }
                            100% {
                                transform: scale(1);
                                opacity: 1;
                            }
                        }
                    `}
                </style>
            </Paper>
        </Box>
    );
};

export default RouteMapView;
