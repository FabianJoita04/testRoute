import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type {NotificationState} from '@/types';
import Navbar from '../../components/common/Navbar';

interface AIRecommendationsProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = () => {
    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    AI Recommendations
                </Typography>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="body1">
                        AI recommendations functionality will be implemented here.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default AIRecommendations;