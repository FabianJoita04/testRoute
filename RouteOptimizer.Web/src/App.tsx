import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert, Box, Typography, Button } from '@mui/material';
import type { NotificationState} from './types';
import LoginPage from './pages/LoginPage';
import TravellerDashboard from './pages/traveller/TravellerDashboard';
import TripPlanner from './pages/traveller/TripPlanner';
import TripHistory from './pages/traveller/TripHistory';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import RouteManagement from './pages/manager/RouteManagement';
import Analytics from './pages/manager/Analytics';
import AIRecommendations from './pages/manager/AIRecommendations';
import LoadingScreen from './components/common/LoadingScreen';
import {useAuth} from "@/providers/KeycloakProvider.tsx";
import { PerformanceMonitor } from './utils/performance';

// Create theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
    },
});

// Protected Route Component
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
    requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           children,
                                                           requiredRole,
                                                           requiredPermission
                                                       }) => {
    const { isAuthenticated, hasRole, hasPermission, isLoading, user } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // IMPORTANT: Wait for user data to be fully loaded
    if (!user) {
        console.log('ProtectedRoute: User data not yet loaded, showing loading...');
        return <LoadingScreen />;
    }

    // Additional check: if user exists but roles are still undefined/empty, wait a bit more
    if (user && (!user.roles || user.roles.length === 0)) {
        console.log('ProtectedRoute: User loaded but no roles yet, waiting...', user);
        // Give it a moment for roles to be parsed
        return <LoadingScreen />;
    }

    // Debug: Log user roles and required role
    console.log('ProtectedRoute Debug:', {
        userRoles: user?.roles,
        requiredRole,
        hasRequiredRole: requiredRole ? hasRole(requiredRole) : true,
        requiredPermission,
        hasRequiredPermission: requiredPermission ? hasPermission(requiredPermission) : true
    });

    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

// Unauthorized page component
const UnauthorizedPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                textAlign: 'center',
                p: 3
            }}
        >
            <Typography variant="h4" gutterBottom color="error">
                Unauthorized Access
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                You don't have permission to access this page.
            </Typography>

            {/* Debug information */}
            {user && (
                <Box sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 1, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body2" fontWeight="bold">Debug Info:</Typography>
                    <Typography variant="body2">User: {user.username}</Typography>
                    <Typography variant="body2">Roles: {user.roles?.join(', ') || 'No roles'}</Typography>
                    <Typography variant="body2">Current path: {window.location.pathname}</Typography>
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => navigate(getDashboardRoute(user?.roles || []))}
                >
                    Go to Dashboard
                </Button>
                <Button
                    variant="outlined"
                    onClick={logout}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );
};

const App: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        severity: 'info'
    });

    const showNotification = (message: string, severity: NotificationState['severity']) => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <div className="App">
                    <Routes>
                        {/* Public Routes */}
                        <Route
                            path="/login"
                            element={
                                !isAuthenticated ? (
                                    <LoginPage />
                                ) : !user || !user.roles || user.roles.length === 0 ? (
                                    <LoadingScreen />
                                ) : (
                                    <Navigate to={getDashboardRoute(user.roles)} replace />
                                )
                            }
                        />

                        {/* Traveller Routes - Components use useAuth hook */}
                        <Route
                            path="/traveller"
                            element={
                                <ProtectedRoute requiredRole="traveller">
                                    <TravellerDashboard
                                        showNotification={showNotification}
                                    />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/traveller/plan"
                            element={
                                <ProtectedRoute requiredRole="traveller">
                                    <TripPlanner
                                        showNotification={showNotification}
                                    />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/traveller/history"
                            element={
                                <ProtectedRoute requiredRole="traveller">
                                    <TripHistory
                                        showNotification={showNotification}
                                    />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager"
                            element={
                                <ProtectedRoute requiredRole="city_manager">
                                    <ManagerDashboard
                                        showNotification={showNotification}
                                    />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/routes"
                            element={
                                <ProtectedRoute requiredRole="city_manager">
                                    <RouteManagement
                                        showNotification={showNotification}
                                    />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/analytics"
                            element={
                                <ProtectedRoute requiredRole="city_manager">
                                    <Analytics
                                        showNotification={showNotification}
                                    />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/ai-recommendations"
                            element={
                                <ProtectedRoute requiredRole="city_manager">
                                    <AIRecommendations
                                        showNotification={showNotification}
                                    />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Redirects */}
                        <Route
                            path="/"
                            element={
                                (() => {
                                    console.log('Home route render - Auth state:', {
                                        isAuthenticated,
                                        isLoading,
                                        hasUser: !!user,
                                        userRoles: user?.roles,
                                        rolesLength: user?.roles?.length
                                    });

                                    if (!isAuthenticated) {
                                        console.log('Not authenticated, redirecting to login');
                                        return <Navigate to="/login" replace />;
                                    }

                                    if (isLoading) {
                                        console.log('Still loading, showing loading screen');
                                        return <LoadingScreen />;
                                    }

                                    if (!user || !user.roles || user.roles.length === 0) {
                                        console.log('User data not ready, showing loading screen');
                                        return <LoadingScreen />;
                                    }

                                    const route = getDashboardRoute(user.roles);
                                    console.log('Redirecting to:', route);
                                    return <Navigate to={route} replace />;
                                })()
                            }
                        />

                        {/* Unauthorized with debug info */}
                        <Route
                            path="/unauthorized"
                            element={<UnauthorizedPage />}
                        />

                        {/* 404 */}
                        <Route
                            path="*"
                            element={
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '100vh',
                                    textAlign: 'center',
                                    p: 3
                                }}>
                                    <Typography variant="h4" gutterBottom>
                                        Page Not Found
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                                        The page you're looking for doesn't exist.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => window.location.href = '/'}
                                    >
                                        Go Home
                                    </Button>
                                </Box>
                            }
                        />
                    </Routes>

                    {/* Global Notification Snackbar */}
                    <Snackbar
                        open={notification.open}
                        autoHideDuration={6000}
                        onClose={handleCloseNotification}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={handleCloseNotification}
                            severity={notification.severity}
                            sx={{ width: '100%' }}
                        >
                            {notification.message}
                        </Alert>
                    </Snackbar>
                </div>
            </Router>
            <PerformanceMonitor enabled={import.meta.env.DEV} />
        </ThemeProvider>
    );
};

// Helper function to determine dashboard route based on user roles
const getDashboardRoute = (roles: string[]): string => {
    console.log('getDashboardRoute called with roles:', roles);

    if (roles.includes('admin') || roles.includes('senior_manager') || roles.includes('city_manager')) {
        return '/manager';
    }
    if (roles.includes('traveller')) {
        return '/traveller';
    }

    // Fallback - if no recognized roles, redirect to unauthorized
    console.warn('No recognized roles found for user, redirecting to unauthorized');
    return '/unauthorized';
};

export default App;