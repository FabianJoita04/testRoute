import React from 'react';
import {
    Box,
    Paper,
    Button,
    Typography,
    Container,
    Card,
    CardContent,
    Fade,
    Zoom,
} from '@mui/material';
import {
    DirectionsBus,
    Person,
    Business,
    LocationCity,
    AdminPanelSettings,
    Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from "@/providers/KeycloakProvider.tsx";

const LoginPage: React.FC = () => {
    const { login } = useAuth();

    const handleLogin = () => {
        login();
    };

    // Demo account information (for display only)
    const demoAccounts = [
        {
            type: 'Traveller',
            icon: <Person sx={{ fontSize: 24 }} />,
            description: 'Plan trips, track buses, and manage favorites',
            color: '#1976d2',
            features: ['Trip Planning', 'Real-time Tracking', 'Route History']
        },
        {
            type: 'City Manager',
            icon: <LocationCity sx={{ fontSize: 24 }} />,
            description: 'Manage routes, view analytics, and optimize system',
            color: '#2e7d32',
            features: ['Route Management', 'Analytics Dashboard', 'AI Recommendations']
        },
        {
            type: 'Senior Manager',
            icon: <Business sx={{ fontSize: 24 }} />,
            description: 'Advanced management and system configuration',
            color: '#ed6c02',
            features: ['System Config', 'User Management', 'Budget Control']
        },
        {
            type: 'Administrator',
            icon: <AdminPanelSettings sx={{ fontSize: 24 }} />,
            description: 'Full system access and administrative controls',
            color: '#d32f2f',
            features: ['Full Access', 'System Admin', 'Data Management']
        }
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    animation: 'float 6s ease-in-out infinite',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    top: '70%',
                    right: '15%',
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    animation: 'float 8s ease-in-out infinite reverse',
                }}
            />

            <Container maxWidth="lg">
                <Fade in timeout={800}>
                    <Box display="flex" gap={4} alignItems="stretch" flexWrap="wrap" justifyContent="center">
                        {/* Login Section */}
                        <Zoom in timeout={600}>
                            <Paper
                                elevation={24}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    minWidth: { xs: '100%', md: 450 },
                                    maxWidth: 450,
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    boxShadow: '0 25px 45px rgba(0, 0, 0, 0.1)',
                                    textAlign: 'center',
                                }}
                            >
                                {/* Header */}
                                <Box mb={4}>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                            mb: 2,
                                            boxShadow: '0 10px 25px rgba(25, 118, 210, 0.3)',
                                        }}
                                    >
                                        <DirectionsBus
                                            sx={{
                                                fontSize: 40,
                                                color: 'white',
                                            }}
                                        />
                                    </Box>
                                    <Typography
                                        variant="h4"
                                        component="h1"
                                        gutterBottom
                                        fontWeight="bold"
                                        sx={{
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {import.meta.env.VITE_APP_NAME || 'Bus Route Optimizer'}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                                        Secure authentication powered by Keycloak
                                    </Typography>
                                </Box>

                                {/* Login Button */}
                                <Button
                                    onClick={handleLogin}
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<LoginIcon />}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                        boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                                            boxShadow: '0 12px 35px rgba(25, 118, 210, 0.4)',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.3s ease',
                                        mb: 3,
                                    }}
                                >
                                    Sign In with Keycloak
                                </Button>

                                {/* Info */}
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                        border: '1px solid rgba(25, 118, 210, 0.1)',
                                    }}
                                >
                                    <Typography variant="body2" color="textSecondary">
                                        You will be redirected to Keycloak for secure authentication.
                                        Use your organization credentials to sign in.
                                    </Typography>
                                </Box>

                                {/* Footer */}
                                <Box textAlign="center" mt={3}>
                                    <Typography variant="body2" color="textSecondary">
                                        Need access?{' '}
                                        <Button
                                            variant="text"
                                            size="small"
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Contact Administrator
                                        </Button>
                                    </Typography>
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Available Roles Information */}
                        <Box sx={{ minWidth: { xs: '100%', md: 400 }, maxWidth: 500 }}>
                            <Fade in timeout={1000} style={{ transitionDelay: '300ms' }}>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        color="white"
                                        gutterBottom
                                        textAlign="center"
                                        sx={{
                                            mb: 3,
                                            fontWeight: 600,
                                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                                        }}
                                    >
                                        Available Roles
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {demoAccounts.map((account, index) => (
                                            <Zoom
                                                key={account.type}
                                                in
                                                timeout={600}
                                                style={{ transitionDelay: `${400 + index * 100}ms` }}
                                            >
                                                <Card
                                                    sx={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        backdropFilter: 'blur(20px)',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        transition: 'all 0.3s ease-out',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
                                                        },
                                                    }}
                                                >
                                                    {/* Color accent bar */}
                                                    <Box
                                                        sx={{
                                                            height: 4,
                                                            background: `linear-gradient(90deg, ${account.color}, ${account.color}aa)`,
                                                        }}
                                                    />

                                                    <CardContent sx={{ p: 3 }}>
                                                        <Box display="flex" alignItems="flex-start" mb={2}>
                                                            <Box
                                                                sx={{
                                                                    color: 'white',
                                                                    mr: 2,
                                                                    p: 1.5,
                                                                    borderRadius: 2,
                                                                    backgroundColor: account.color,
                                                                    boxShadow: `0 4px 15px ${account.color}40`,
                                                                }}
                                                            >
                                                                {account.icon}
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography
                                                                    variant="h6"
                                                                    color="white"
                                                                    fontWeight="bold"
                                                                    sx={{ mb: 0.5 }}
                                                                >
                                                                    {account.type}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="rgba(255, 255, 255, 0.8)"
                                                                    sx={{ mb: 2 }}
                                                                >
                                                                    {account.description}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        {/* Features */}
                                                        <Box sx={{ mb: 2 }}>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {account.features.map((feature) => (
                                                                    <Box
                                                                        key={feature}
                                                                        sx={{
                                                                            px: 1,
                                                                            py: 0.5,
                                                                            borderRadius: 1,
                                                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="caption"
                                                                            color="rgba(255, 255, 255, 0.9)"
                                                                            fontSize="0.7rem"
                                                                        >
                                                                            {feature}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Zoom>
                                        ))}
                                    </Box>

                                    <Typography
                                        variant="caption"
                                        color="rgba(255, 255, 255, 0.8)"
                                        display="block"
                                        textAlign="center"
                                        mt={3}
                                        sx={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
                                    >
                                        Your role and permissions will be determined by your Keycloak account
                                    </Typography>
                                </Box>
                            </Fade>
                        </Box>
                    </Box>
                </Fade>
            </Container>

            {/* CSS Animations */}
            <style>
                {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
            </style>
        </Box>
    );
};

export default LoginPage;