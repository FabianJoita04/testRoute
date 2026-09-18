import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { DirectionsBus } from '@mui/icons-material';

const LoadingScreen: React.FC = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="background.default"
        >
            <Box mb={3}>
                <DirectionsBus
                    sx={{
                        fontSize: 60,
                        color: 'primary.main',
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                />
            </Box>

            <CircularProgress size={40} sx={{ mb: 2 }} />

            <Typography variant="h6" color="textSecondary">
                Loading Bus Route Optimizer...
            </Typography>

            <style>
                {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
            </style>
        </Box>
    );
};

export default LoadingScreen;