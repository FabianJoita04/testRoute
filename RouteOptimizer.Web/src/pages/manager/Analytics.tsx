import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type {NotificationState} from '../../types';
import Navbar from '../../components/common/Navbar';

interface AnalyticsProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

const Analytics: React.FC<AnalyticsProps> = () => {
    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Analytics
                </Typography>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="body1">
                        Analytics functionality will be implemented here.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Analytics;