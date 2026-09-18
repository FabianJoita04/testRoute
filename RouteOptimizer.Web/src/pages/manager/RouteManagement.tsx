import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { ViewList, Map as MapIcon } from '@mui/icons-material';
import type { NotificationState, BusRoute } from '../../types';
import Navbar from '../../components/common/Navbar';
import RouteList from './RouteManagement/RouteList';
import RouteMapView from './RouteManagement/RouteMapView';
import RouteDetailsPanel from './RouteManagement/RouteDetailsPanel';
import RouteFormDialog from './RouteManagement/RouteFormDialog';
import { bucharestRoutes, bucharestStops } from '../../data/sampleRoutes';

interface RouteManagementProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

const RouteManagement: React.FC<RouteManagementProps> = ({ showNotification }) => {
    const [routes, setRoutes] = useState<BusRoute[]>(bucharestRoutes);
    const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);

    const handleSelectRoute = (route: BusRoute) => {
        setSelectedRoute(route);
        setShowDetailsPanel(true);
    };

    const handleAddRoute = () => {
        setEditingRoute(null);
        setIsFormOpen(true);
    };

    const handleEditRoute = (route: BusRoute) => {
        setEditingRoute(route);
        setIsFormOpen(true);
    };

    const handleSaveRoute = (routeData: Partial<BusRoute>) => {
        if (editingRoute) {
            setRoutes(prev =>
                prev.map(r =>
                    r.id === editingRoute.id ? { ...r, ...routeData } : r
                )
            );
            showNotification('Route updated successfully', 'success');

            if (selectedRoute?.id === editingRoute.id) {
                setSelectedRoute({ ...selectedRoute, ...routeData } as BusRoute);
            }
        } else {
            const newRoute: BusRoute = {
                id: Math.max(...routes.map(r => r.id), 0) + 1,
                ...routeData,
                buses: [],
                busStops: routeData.busStops || [],
                isActive: routeData.status === 'Active',
                name: routeData.name || '',
                code: routeData.code || '',
                description: routeData.description || '',
                operationalCost: routeData.operationalCost || 0,
                estimatedTravelTime: routeData.estimatedTravelTime || 0
            };
            setRoutes(prev => [...prev, newRoute]);
            showNotification('Route created successfully', 'success');
        }
        setIsFormOpen(false);
    };

    const handleDeleteRoute = (routeId: number) => {
        setRoutes(prev => prev.filter(r => r.id !== routeId));
        if (selectedRoute?.id === routeId) {
            setSelectedRoute(null);
            setShowDetailsPanel(false);
        }
        showNotification('Route deleted successfully', 'info');
    };

    const handleToggleStatus = (routeId: number) => {
        setRoutes(prev =>
            prev.map(r =>
                r.id === routeId
                    ? {
                          ...r,
                          isActive: !r.isActive,
                          status: !r.isActive ? 'Active' : 'Inactive'
                      }
                    : r
            )
        );

        if (selectedRoute?.id === routeId) {
            setSelectedRoute(prev =>
                prev
                    ? {
                          ...prev,
                          isActive: !prev.isActive,
                          status: !prev.isActive ? 'Active' : 'Inactive'
                      }
                    : null
            );
        }
        showNotification('Route status updated', 'success');
    };

    const handleCloseDetails = () => {
        setShowDetailsPanel(false);
        setSelectedRoute(null);
    };

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Route Management
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Manage bus routes for Bucharest public transport system
                        </Typography>
                    </Box>

                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_e, value) => value && setViewMode(value)}
                        size="small"
                    >
                        <ToggleButton value="list">
                            <ViewList sx={{ mr: 1 }} />
                            List View
                        </ToggleButton>
                        <ToggleButton value="map">
                            <MapIcon sx={{ mr: 1 }} />
                            Map View
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, lg: showDetailsPanel ? 8 : 12 }}>
                        {viewMode === 'list' ? (
                            <RouteList
                                routes={routes}
                                onSelectRoute={handleSelectRoute}
                                onEditRoute={handleEditRoute}
                                onDeleteRoute={handleDeleteRoute}
                                onToggleStatus={handleToggleStatus}
                                onAddRoute={handleAddRoute}
                                selectedRouteId={selectedRoute?.id}
                            />
                        ) : (
                            <RouteMapView
                                routes={routes}
                                selectedRoute={selectedRoute}
                                onSelectRoute={handleSelectRoute}
                            />
                        )}
                    </Grid>

                    {showDetailsPanel && (
                        <Grid size={{ xs: 12, lg: 4 }}>
                            <RouteDetailsPanel
                                route={selectedRoute}
                                onClose={handleCloseDetails}
                            />
                        </Grid>
                    )}
                </Grid>
            </Box>

            <RouteFormDialog
                open={isFormOpen}
                route={editingRoute}
                allStops={bucharestStops}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveRoute}
            />
        </Box>
    );
};

export default RouteManagement;
