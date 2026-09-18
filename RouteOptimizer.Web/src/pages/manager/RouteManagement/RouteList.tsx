import React, { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    TablePagination
} from '@mui/material';
import {
    Delete,
    Edit,
    Visibility,
    ToggleOn,
    ToggleOff,
    Add,
    FilterList
} from '@mui/icons-material';
import type { BusRoute } from '@/types';

interface RouteListProps {
    routes: BusRoute[];
    onSelectRoute: (route: BusRoute) => void;
    onEditRoute: (route: BusRoute) => void;
    onDeleteRoute: (routeId: number) => void;
    onToggleStatus: (routeId: number) => void;
    onAddRoute: () => void;
    selectedRouteId?: number;
}

const RouteList: React.FC<RouteListProps> = ({
    routes,
    onSelectRoute,
    onEditRoute,
    onDeleteRoute,
    onToggleStatus,
    onAddRoute,
    selectedRouteId
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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

    const getPerformanceColor = (value?: number) => {
        if (!value) return 'inherit';
        if (value >= 90) return 'success.main';
        if (value >= 75) return 'warning.main';
        return 'error.main';
    };

    const filteredRoutes = routes.filter(route => {
        const matchesSearch =
            route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            route.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            route.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            route.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const paginatedRoutes = filteredRoutes.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5">
                    Routes ({filteredRoutes.length})
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onAddRoute}
                >
                    Add Route
                </Button>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TextField
                    placeholder="Search routes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Status Filter</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status Filter"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        startAdornment={<FilterList sx={{ mr: 1 }} />}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                        <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Route Code</TableCell>
                            <TableCell>Route Name</TableCell>
                            <TableCell>Start/End Points</TableCell>
                            <TableCell align="center">Stops</TableCell>
                            <TableCell>Operating Hours</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Daily Passengers</TableCell>
                            <TableCell align="right">On-Time %</TableCell>
                            <TableCell align="right">Capacity %</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedRoutes.map((route) => (
                            <TableRow
                                key={route.id}
                                hover
                                selected={selectedRouteId === route.id}
                                sx={{ cursor: 'pointer' }}
                                onClick={() => onSelectRoute(route)}
                            >
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        {route.code}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        {route.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {route.description}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {route.startPoint || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        → {route.endPoint || 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={route.busStops?.length || 0}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {route.operatingHours?.start || 'N/A'} - {route.operatingHours?.end || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Every {route.frequency || 'N/A'} min
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={route.status || 'Unknown'}
                                        color={getStatusColor(route.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2">
                                        {route.averageDailyPassengers?.toLocaleString() || 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                        color={getPerformanceColor(route.onTimePerformance)}
                                    >
                                        {route.onTimePerformance ? `${route.onTimePerformance}%` : 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                        color={getPerformanceColor(route.capacityUtilization)}
                                    >
                                        {route.capacityUtilization ? `${route.capacityUtilization}%` : 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectRoute(route);
                                                }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Route">
                                            <IconButton
                                                size="small"
                                                color="info"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditRoute(route);
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={route.isActive ? 'Disable Route' : 'Enable Route'}>
                                            <IconButton
                                                size="small"
                                                color={route.isActive ? 'success' : 'default'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleStatus(route.id);
                                                }}
                                            >
                                                {route.isActive ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Route">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Are you sure you want to delete route ${route.code}?`)) {
                                                        onDeleteRoute(route.id);
                                                    }
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginatedRoutes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                                        No routes found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredRoutes.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </Box>
    );
};

export default RouteList;
