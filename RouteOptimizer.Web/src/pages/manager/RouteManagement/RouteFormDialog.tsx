import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Chip,
    IconButton,
    Stack,
    Autocomplete,
    InputAdornment
} from '@mui/material';
import {
    Close,
    Add,
    Delete,
    Edit,
    ArrowUpward,
    ArrowDownward,
    LocationOn,
    Accessible,
    DragIndicator
} from '@mui/icons-material';
import type { BusRoute, BusStop } from '@/types';
import { generateRoutePath } from '@/utils/routing';

interface RouteFormDialogProps {
    open: boolean;
    route: BusRoute | null;
    allStops: BusStop[];
    onClose: () => void;
    onSave: (route: Partial<BusRoute>) => void;
}

const RouteFormDialog: React.FC<RouteFormDialogProps> = ({
    open,
    route,
    allStops,
    onClose,
    onSave
}) => {
    const [formData, setFormData] = useState<Partial<BusRoute>>({
        name: '',
        code: '',
        description: '',
        status: 'Active',
        startPoint: '',
        endPoint: '',
        operatingHours: { start: '05:00', end: '23:00' },
        frequency: 10,
        vehicleType: 'Standard Bus',
        operationalCost: 0,
        estimatedTravelTime: 0,
        isActive: true,
        busStops: [],
        buses: []
    });

    const [selectedStops, setSelectedStops] = useState<BusStop[]>([]);

    useEffect(() => {
        if (route) {
            setFormData({
                ...route,
                operatingHours: route.operatingHours || { start: '05:00', end: '23:00' }
            });
            setSelectedStops(route.busStops || []);
        } else {
            setFormData({
                name: '',
                code: '',
                description: '',
                status: 'Active',
                startPoint: '',
                endPoint: '',
                operatingHours: { start: '05:00', end: '23:00' },
                frequency: 10,
                vehicleType: 'Standard Bus',
                operationalCost: 0,
                estimatedTravelTime: 0,
                isActive: true,
                busStops: [],
                buses: []
            });
            setSelectedStops([]);
        }
    }, [route, open]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOperatingHoursChange = (field: 'start' | 'end', value: string) => {
        setFormData(prev => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours!,
                [field]: value
            }
        }));
    };

    const handleAddStop = (stop: BusStop | null) => {
        if (stop && !selectedStops.find(s => s.id === stop.id)) {
            setSelectedStops(prev => [...prev, stop]);
        }
    };

    const handleRemoveStop = (stopId: number) => {
        setSelectedStops(prev => prev.filter(s => s.id !== stopId));
    };

    const handleMoveStop = (index: number, direction: 'up' | 'down') => {
        const newStops = [...selectedStops];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newStops.length) {
            [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
            setSelectedStops(newStops);
        }
    };

    const handleSubmit = async () => {
        const routeData: Partial<BusRoute> = {
            ...formData,
            busStops: selectedStops,
            isActive: formData.status === 'Active'
        };

        if (selectedStops.length >= 2) {
            routeData.startPoint = selectedStops[0].name;
            routeData.endPoint = selectedStops[selectedStops.length - 1].name;

            // Generate street-following path
            try {
                const pathCoordinates = await generateRoutePath(selectedStops);
                routeData.path = pathCoordinates;
            } catch (error) {
                console.error('Failed to generate route path:', error);
                // Fallback to straight lines
                const pathCoordinates: [number, number][] = selectedStops.map(stop => [
                    stop.location.latitude,
                    stop.location.longitude
                ]);
                routeData.path = pathCoordinates;
            }
        }

        onSave(routeData);
        onClose();
    };

    const isFormValid = () => {
        return (
            formData.name &&
            formData.code &&
            formData.description &&
            selectedStops.length >= 2 &&
            formData.frequency &&
            formData.frequency > 0 &&
            formData.estimatedTravelTime &&
            formData.estimatedTravelTime > 0
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        {route ? 'Edit Route' : 'Add New Route'}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Route Code"
                            value={formData.code || ''}
                            onChange={(e) => handleChange('code', e.target.value)}
                            required
                            placeholder="e.g., 133"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status || 'Active'}
                                label="Status"
                                onChange={(e) => handleChange('status', e.target.value)}
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                                <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Route Name"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            placeholder="e.g., Piața Victoriei - Piața Unirii"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            required
                            multiline
                            rows={2}
                            placeholder="Brief description of the route"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Operating Hours - Start"
                            type="time"
                            value={formData.operatingHours?.start || '05:00'}
                            onChange={(e) => handleOperatingHoursChange('start', e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Operating Hours - End"
                            type="time"
                            value={formData.operatingHours?.end || '23:00'}
                            onChange={(e) => handleOperatingHoursChange('end', e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Frequency"
                            type="number"
                            value={formData.frequency || ''}
                            onChange={(e) => handleChange('frequency', parseInt(e.target.value))}
                            required
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Vehicle Type</InputLabel>
                            <Select
                                value={formData.vehicleType || 'Standard Bus'}
                                label="Vehicle Type"
                                onChange={(e) => handleChange('vehicleType', e.target.value)}
                            >
                                <MenuItem value="Standard Bus">Standard Bus</MenuItem>
                                <MenuItem value="Articulated Bus">Articulated Bus</MenuItem>
                                <MenuItem value="Minibus">Minibus</MenuItem>
                                <MenuItem value="Electric Bus">Electric Bus</MenuItem>
                                <MenuItem value="Double Decker">Double Decker</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Estimated Travel Time"
                            type="number"
                            value={formData.estimatedTravelTime || ''}
                            onChange={(e) => handleChange('estimatedTravelTime', parseInt(e.target.value))}
                            required
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Operational Cost"
                            type="number"
                            value={formData.operationalCost || ''}
                            onChange={(e) => handleChange('operationalCost', parseFloat(e.target.value))}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">LEI/day</InputAdornment>
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{
                            p: 2,
                            border: 2,
                            borderColor: 'primary.main',
                            borderRadius: 2,
                            bgcolor: 'primary.50'
                        }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <LocationOn color="primary" />
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Route Stops
                                </Typography>
                                <Chip
                                    label={`${selectedStops.length} stop${selectedStops.length !== 1 ? 's' : ''}`}
                                    size="small"
                                    color={selectedStops.length >= 2 ? 'success' : 'warning'}
                                />
                                {selectedStops.length < 2 && (
                                    <Chip
                                        label="Minimum 2 required"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>

                            <Autocomplete
                                options={allStops.filter(s => !selectedStops.find(ss => ss.id === s.id))}
                                getOptionLabel={(option) => option.name}
                                onChange={(_e, value) => handleAddStop(value)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Add Stop to Route"
                                        placeholder="Search and select a stop..."
                                        variant="outlined"
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                                            <LocationOn fontSize="small" color="action" />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {option.name}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip
                                                        label={option.zoneType}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.65rem', height: 18 }}
                                                    />
                                                    {option.isAccessible && (
                                                        <Accessible sx={{ fontSize: 14 }} color="primary" />
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </li>
                                )}
                            />

                            <Box sx={{
                                mt: 2,
                                minHeight: '300px',
                                maxHeight: '400px',
                                overflow: 'auto',
                                border: 2,
                                borderStyle: selectedStops.length === 0 ? 'dashed' : 'solid',
                                borderColor: selectedStops.length === 0 ? 'divider' : 'divider',
                                borderRadius: 2,
                                bgcolor: 'background.paper'
                            }}>
                                {selectedStops.length === 0 ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '300px',
                                            px: 2
                                        }}
                                    >
                                        <LocationOn sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="body2" color="textSecondary" fontWeight="medium">
                                            No stops added yet
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Search and add at least 2 stops to create a route
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
                                        {selectedStops.map((stop, index) => (
                                            <Box
                                                key={stop.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    p: 2,
                                                    bgcolor: index === 0 || index === selectedStops.length - 1
                                                        ? 'primary.50'
                                                        : 'background.paper',
                                                    '&:hover': {
                                                        bgcolor: 'action.hover'
                                                    },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <DragIndicator sx={{ color: 'text.disabled', cursor: 'grab' }} />

                                                <Chip
                                                    label={index + 1}
                                                    size="small"
                                                    color={index === 0 ? 'success' : index === selectedStops.length - 1 ? 'error' : 'primary'}
                                                    sx={{ minWidth: 32, fontWeight: 'bold' }}
                                                />

                                                <LocationOn
                                                    color={index === 0 ? 'success' : index === selectedStops.length - 1 ? 'error' : 'primary'}
                                                    fontSize="small"
                                                />

                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {stop.name}
                                                        </Typography>
                                                        {index === 0 && (
                                                            <Chip label="Start" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
                                                        )}
                                                        {index === selectedStops.length - 1 && (
                                                            <Chip label="End" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />
                                                        )}
                                                        {stop.isAccessible && (
                                                            <Accessible sx={{ fontSize: 16 }} color="primary" />
                                                        )}
                                                    </Stack>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {stop.zoneType}
                                                    </Typography>
                                                </Box>

                                                <Stack direction="row" spacing={0.5}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleMoveStop(index, 'up')}
                                                        disabled={index === 0}
                                                        title="Move up"
                                                        sx={{
                                                            bgcolor: 'background.paper',
                                                            border: 1,
                                                            borderColor: 'divider',
                                                            '&:hover': { bgcolor: 'action.hover' },
                                                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                                                        }}
                                                    >
                                                        <ArrowUpward fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleMoveStop(index, 'down')}
                                                        disabled={index === selectedStops.length - 1}
                                                        title="Move down"
                                                        sx={{
                                                            bgcolor: 'background.paper',
                                                            border: 1,
                                                            borderColor: 'divider',
                                                            '&:hover': { bgcolor: 'action.hover' },
                                                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                                                        }}
                                                    >
                                                        <ArrowDownward fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveStop(stop.id)}
                                                        title="Remove stop"
                                                        sx={{
                                                            bgcolor: 'background.paper',
                                                            border: 1,
                                                            borderColor: 'divider',
                                                            '&:hover': { bgcolor: 'error.light', color: 'white' }
                                                        }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!isFormValid()}
                    startIcon={route ? <Edit /> : <Add />}
                >
                    {route ? 'Update Route' : 'Create Route'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RouteFormDialog;
