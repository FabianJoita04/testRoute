import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Chip,
    Divider,
} from '@mui/material';
import {
    DirectionsBus,
    AccountCircle,
    Dashboard,
    Route,
    Analytics,
    SmartToy,
    Map,
    History,
    Logout,
    Person,
    Settings,
} from '@mui/icons-material';
import { useAuth } from '@/providers/KeycloakProvider';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { user, logout, hasRole } = useAuth();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    const handleProfile = () => {
        handleClose();
        // You can implement profile navigation or modal here
        console.log('Navigate to profile');
    };

    const handleSettings = () => {
        handleClose();
        // You can implement settings navigation here
        console.log('Navigate to settings');
    };

    // Check if user has manager-level roles
    const isManager = hasRole('city_manager') || hasRole('senior_manager') || hasRole('admin');

    const getNavigationItems = () => {
        if (isManager) {
            return [
                { path: '/manager', label: 'Dashboard', icon: <Dashboard />, requiredRole: 'city_manager' },
                { path: '/manager/routes', label: 'Routes', icon: <Route />, requiredRole: 'city_manager' },
                { path: '/manager/analytics', label: 'Analytics', icon: <Analytics />, requiredRole: 'city_manager' },
                { path: '/manager/ai-recommendations', label: 'AI Recommendations', icon: <SmartToy />, requiredRole: 'city_manager' },
            ];
        } else {
            return [
                { path: '/traveller', label: 'Dashboard', icon: <Dashboard />, requiredRole: 'traveller' },
                { path: '/traveller/plan', label: 'Plan Trip', icon: <Map />, requiredRole: 'traveller' },
                { path: '/traveller/history', label: 'Trip History', icon: <History />, requiredRole: 'traveller' },
            ];
        }
    };

    const navigationItems = getNavigationItems();

    // Filter navigation items based on user roles
    const accessibleNavigationItems = navigationItems.filter(item =>
        !item.requiredRole || hasRole(item.requiredRole)
    );

    // Get user's primary role for display
    const getPrimaryRole = () => {
        if (hasRole('admin')) return 'Administrator';
        if (hasRole('senior_manager')) return 'Senior Manager';
        if (hasRole('city_manager')) return 'City Manager';
        if (hasRole('traveller')) return 'Traveller';
        return 'User';
    };

    // Get role color for chip
    const getRoleColor = () => {
        if (hasRole('admin')) return '#d32f2f';
        if (hasRole('senior_manager')) return '#ed6c02';
        if (hasRole('city_manager')) return '#2e7d32';
        if (hasRole('traveller')) return '#1976d2';
        return '#757575';
    };

    // Don't render navbar if user is not loaded
    if (!user) {
        return null;
    }

    return (
        <AppBar position="static" elevation={2}>
            <Toolbar>
                {/* Logo and Title */}
                <DirectionsBus sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
                    {import.meta.env.VITE_APP_NAME || 'Bus Route Optimizer'}
                </Typography>

                {/* Navigation Items */}
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                    {accessibleNavigationItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Button
                                key={item.path}
                                color="inherit"
                                startIcon={item.icon}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    borderRadius: 2,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </Box>

                {/* User Role Chip */}
                <Chip
                    label={getPrimaryRole()}
                    size="small"
                    variant="outlined"
                    sx={{
                        color: 'white',
                        borderColor: getRoleColor(),
                        backgroundColor: `${getRoleColor()}20`,
                        mr: 2,
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: `${getRoleColor()}30`,
                        }
                    }}
                />

                {/* User Menu */}
                <div>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                        sx={{
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }
                        }}
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                minWidth: 200,
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            }
                        }}
                    >
                        {/* User Info */}
                        <MenuItem disabled sx={{ opacity: 1, cursor: 'default' }}>
                            <Box>
                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                    {user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.username
                                    }
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user.email}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                    <Chip
                                        label={getPrimaryRole()}
                                        size="small"
                                        sx={{
                                            backgroundColor: getRoleColor(),
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            height: 20,
                                        }}
                                    />
                                </Box>
                            </Box>
                        </MenuItem>

                        <Divider />

                        {/* Menu Actions */}
                        <MenuItem onClick={handleProfile}>
                            <Person sx={{ mr: 2, fontSize: 20 }} />
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleSettings}>
                            <Settings sx={{ mr: 2, fontSize: 20 }} />
                            Settings
                        </MenuItem>

                        <Divider />

                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                color: 'error.main',
                                '&:hover': {
                                    backgroundColor: 'error.light',
                                    color: 'error.contrastText',
                                }
                            }}
                        >
                            <Logout sx={{ mr: 2, fontSize: 20 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;