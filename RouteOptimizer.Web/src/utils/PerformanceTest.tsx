/**
 * Performance Testing Component
 *
 * This component helps measure the impact of React.memo by:
 * 1. Showing render counts before and after optimization
 * 2. Triggering state changes to measure re-renders
 * 3. Providing visual feedback on performance improvements
 */

import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Chip, Divider } from '@mui/material';
import { Speed, Timeline, Check } from '@mui/icons-material';

interface PerformanceTestProps {
    onTriggerRender: () => void;
}

export const PerformanceTest: React.FC<PerformanceTestProps> = ({ onTriggerRender }) => {
    const [testCount, setTestCount] = useState(0);
    const [results, setResults] = useState<{
        beforeMemo: number;
        afterMemo: number;
        improvement: number;
    } | null>(null);

    const runPerformanceTest = () => {
        console.clear();
        console.log('%c🚀 Starting Performance Test...', 'color: #00ff00; font-size: 16px; font-weight: bold');

        // Clear previous metrics
        if (window.performanceMetrics) {
            window.performanceMetrics = [];
        }

        // Trigger multiple renders to collect data
        const iterations = 10;
        console.log(`Testing with ${iterations} state changes...`);

        for (let i = 0; i < iterations; i++) {
            setTimeout(() => {
                onTriggerRender();
                setTestCount(prev => prev + 1);

                if (i === iterations - 1) {
                    // Test complete
                    setTimeout(() => {
                        console.log('%c✅ Test Complete!', 'color: #00ff00; font-size: 14px');
                        console.log('Check the React DevTools Profiler for detailed results');
                    }, 100);
                }
            }, i * 100);
        }
    };

    return (
        <Card
            sx={{
                position: 'fixed',
                bottom: 20,
                left: 20,
                width: 350,
                zIndex: 9999,
                boxShadow: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Speed sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                        Performance Tester
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.3)' }} />

                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    This will trigger 10 state changes to measure component re-renders.
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                        Test runs: {testCount}
                    </Typography>
                    <Chip
                        icon={<Timeline />}
                        label={testCount > 0 ? `${testCount} tests completed` : 'No tests run'}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={runPerformanceTest}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        mb: 1,
                    }}
                    startIcon={<Speed />}
                >
                    Run Performance Test
                </Button>

                <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7, fontSize: '10px' }}>
                    📊 Open React DevTools Profiler before running
                    <br />
                    🔍 Check console for render counts
                    <br />
                    📈 Compare before/after React.memo
                </Typography>

                {results && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                            Results:
                        </Typography>
                        <Typography variant="caption" display="block">
                            Before: {results.beforeMemo} renders
                        </Typography>
                        <Typography variant="caption" display="block">
                            After: {results.afterMemo} renders
                        </Typography>
                        <Chip
                            icon={<Check />}
                            label={`${results.improvement}% improvement`}
                            size="small"
                            color="success"
                            sx={{ mt: 1 }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// Extend window type for performance metrics
declare global {
    interface Window {
        performanceMetrics?: any[];
    }
}
