import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    IconButton,
    Button,
    Chip,
    CircularProgress,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
} from '@mui/material';
import {
    DirectionsBus,
    People,
    AttachMoney,
    Warning,
    CheckCircle,
    Refresh,
    TrendingUp,
    TrendingDown,
    Schedule,
    SmartToy,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

import type {SystemAnalytics, AIRecommendation, NotificationState, DashboardMetrics, SystemStatus} from '@/types';
import apiService from '../../services/api';
import Navbar from '../../components/common/Navbar';

interface ManagerDashboardProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
                                                               showNotification
                                                           }) => {
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
    const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
    const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
    const [realtimeStatus, setRealtimeStatus] = useState<SystemStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Sample data for charts (in production, this would come from API)
    const passengerTrendData = [
        { name: 'Mon', passengers: 4000, revenue: 8000 },
        { name: 'Tue', passengers: 3000, revenue: 6000 },
        { name: 'Wed', passengers: 2000, revenue: 4000 },
        { name: 'Thu', passengers: 2780, revenue: 5560 },
        { name: 'Fri', passengers: 1890, revenue: 3780 },
        { name: 'Sat', passengers: 2390, revenue: 4780 },
        { name: 'Sun', passengers: 3490, revenue: 6980 },
    ];

    const routePerformanceData = [
        { name: 'Route 1', efficiency: 85, passengers: 1200 },
        { name: 'Route 2', efficiency: 92, passengers: 980 },
        { name: 'Route 3', efficiency: 78, passengers: 1500 },
        { name: 'Route 4', efficiency: 88, passengers: 800 },
        { name: 'Route 5', efficiency: 75, passengers: 600 },
    ];

    const zoneDistributionData = [
        { name: 'Business', value: 35, color: '#0088FE' },
        { name: 'Residential', value: 45, color: '#00C49F' },
        { name: 'Commercial', value: 15, color: '#FFBB28' },
        { name: 'Educational', value: 5, color: '#FF8042' },
    ];

    useEffect(() => {
        loadDashboardData();

        // Set up real-time updates every 30 seconds
        const interval = setInterval(() => {
            loadRealtimeData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Load all dashboard data
            const [metricsResponse, analyticsResponse, recommendationsResponse, statusResponse] = await Promise.all([
                apiService.getDashboardMetrics(),
                apiService.getSystemAnalytics(
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                    new Date().toISOString()
                ),
                apiService.getAIRecommendations(),
                apiService.getRealtimeSystemStatus(),
            ]);

            if (metricsResponse.success) {
                setDashboardMetrics(metricsResponse.data);
            }

            if (analyticsResponse.success) {
                setSystemAnalytics(analyticsResponse.data);
            }

            if (recommendationsResponse.success) {
                setAiRecommendations(recommendationsResponse.data.slice(0, 5)); // Top 5 recommendations
            }

            if (statusResponse.success) {
                setRealtimeStatus(statusResponse.data);
            }

            setLastUpdated(new Date());
        } catch (error: unknown) {
            console.error('Failed to load dashboard data:', error);
            showNotification('Failed to load dashboard data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const loadRealtimeData = async () => {
        try {
            const [metricsResponse, statusResponse] = await Promise.all([
                apiService.getDashboardMetrics(),
                apiService.getRealtimeSystemStatus(),
            ]);

            if (metricsResponse.success) {
                setDashboardMetrics(metricsResponse.data);
            }

            if (statusResponse.success) {
                setRealtimeStatus(statusResponse.data);
            }

            setLastUpdated(new Date());
        } catch (error: unknown) {
            console.error('Failed to load realtime data:', error);
        }
    };

    const handleRefresh = () => {
        loadDashboardData();
        showNotification('Dashboard refreshed', 'success');
    };

    const handleApproveRecommendation = async (recommendationId: number) => {
        try {
            const response = await apiService.approveAIRecommendation(recommendationId);
            if (response.success) {
                showNotification('Recommendation approved successfully', 'success');
                loadDashboardData(); // Refresh data
            }
        } catch (error: unknown) {
            console.error('Failed to approve recommendation:', error);
            showNotification('Failed to approve recommendation', 'error');
        }
    };

    // const getStatusColor = (status: string) => {
    //     switch (status.toLowerCase()) {
    //         case 'healthy':
    //         case 'on_time':
    //             return 'success';
    //         case 'warning':
    //         case 'delayed':
    //             return 'warning';
    //         case 'error':
    //         case 'offline':
    //             return 'error';
    //         default:
    //             return 'default';
    //     }
    // };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (isLoading && !dashboardMetrics) {
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
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Navbar />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        System Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </Typography>
                        <IconButton onClick={handleRefresh} disabled={isLoading}>
                            <Refresh />
                        </IconButton>
                    </Box>
                </Box>

                {/* Key Metrics Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom variant="body2">
                                            Active Buses
                                        </Typography>
                                        <Typography variant="h4">
                                            {systemAnalytics?.activeBuses || dashboardMetrics?.totalBuses || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <TrendingUp color="success" fontSize="small" />
                                            <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                                                +2 from yesterday
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <DirectionsBus color="primary" sx={{ fontSize: 40 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom variant="body2">
                                            Today's Passengers
                                        </Typography>
                                        <Typography variant="h4">
                                            {dashboardMetrics?.totalPassengersToday?.toLocaleString() || '0'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <TrendingUp color="success" fontSize="small" />
                                            <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                                                +12% from yesterday
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <People color="primary" sx={{ fontSize: 40 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom variant="body2">
                                            Daily Revenue
                                        </Typography>
                                        <Typography variant="h4">
                                            {formatCurrency(dashboardMetrics?.revenueToday || 0)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <TrendingDown color="error" fontSize="small" />
                                            <Typography variant="body2" color="error.main" sx={{ ml: 0.5 }}>
                                                -5% from yesterday
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <AttachMoney color="primary" sx={{ fontSize: 40 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom variant="body2">
                                            On-Time Performance
                                        </Typography>
                                        <Typography variant="h4">
                                            {dashboardMetrics ? (100 - dashboardMetrics.averageDelayMinutes * 2).toFixed(1) : 87.5}%
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={dashboardMetrics ? 100 - dashboardMetrics.averageDelayMinutes * 2 : 87.5}
                                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                        />
                                    </Box>
                                    <Schedule color="primary" sx={{ fontSize: 40 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Passenger Trends Chart */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3, height: 400 }}>
                            <Typography variant="h6" gutterBottom>
                                Passenger Trends (Last 7 Days)
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={passengerTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="passengers"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        name="Passengers"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        name="Revenue ($)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Zone Distribution */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, height: 400 }}>
                            <Typography variant="h6" gutterBottom>
                                Service Coverage by Zone
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={zoneDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => {
                                            const percentValue = percent ?? 0;
                                            return `${name} ${(percentValue * 100).toFixed(0)}%`;
                                        }}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {zoneDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Route Performance */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Route Performance
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={routePerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* AI Recommendations */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">
                                    AI Recommendations
                                </Typography>
                                <SmartToy color="primary" />
                            </Box>

                            {aiRecommendations.length === 0 ? (
                                <Alert severity="info">
                                    No new AI recommendations at this time.
                                </Alert>
                            ) : (
                                <Box sx={{ maxHeight: 250, overflow: 'auto' }}>
                                    {aiRecommendations.map((recommendation) => (
                                        <Card key={recommendation.id} sx={{ mb: 2, bgcolor: 'background.default' }}>
                                            <CardContent sx={{ pb: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Chip
                                                        label={recommendation.recommendationType.replace('_', ' ')}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                    <Typography variant="body2" color="success.main" fontWeight="bold">
                                                        {(recommendation.confidenceScore * 100).toFixed(0)}% confidence
                                                    </Typography>
                                                </Box>

                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    {typeof recommendation.proposedChanges === 'object'
                                                        ? `Optimize Route ${recommendation.currentRouteId}`
                                                        : recommendation.proposedChanges}
                                                </Typography>

                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => handleApproveRecommendation(recommendation.id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* System Status */}
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                System Status
                            </Typography>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Service</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Last Check</TableCell>
                                            <TableCell>Details</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Database</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<CheckCircle />}
                                                    label="Healthy"
                                                    color="success"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{new Date().toLocaleTimeString()}</TableCell>
                                            <TableCell>Response time: 12ms</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell>API Gateway</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<CheckCircle />}
                                                    label="Healthy"
                                                    color="success"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{new Date().toLocaleTimeString()}</TableCell>
                                            <TableCell>All endpoints operational</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell>ML Services</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<Warning />}
                                                    label="Warning"
                                                    color="warning"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{new Date().toLocaleTimeString()}</TableCell>
                                            <TableCell>Model retraining in progress</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell>Real-time Updates</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<CheckCircle />}
                                                    label="Healthy"
                                                    color="success"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{new Date().toLocaleTimeString()}</TableCell>
                                            <TableCell>{realtimeStatus?.activeBuses || 0} buses reporting</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ManagerDashboard;