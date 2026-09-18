/**
 * Performance measurement utilities for React components
 */

import React, { Profiler, ProfilerOnRenderCallback } from 'react';

interface PerformanceMetrics {
    componentName: string;
    renderCount: number;
    totalTime: number;
    averageTime: number;
    lastRenderTime: number;
}

const metrics = new Map<string, PerformanceMetrics>();

/**
 * Profiler callback that tracks component render performance
 */
export const onRenderCallback: ProfilerOnRenderCallback = (
    id, // the "id" prop of the Profiler tree that has just committed
    phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration, // time spent rendering the committed update
    baseDuration, // estimated time to render the entire subtree without memoization
    startTime, // when React began rendering this update
    commitTime, // when React committed this update
    interactions // the Set of interactions belonging to this update
) => {
    const existing = metrics.get(id) || {
        componentName: id,
        renderCount: 0,
        totalTime: 0,
        averageTime: 0,
        lastRenderTime: 0,
    };

    const updated: PerformanceMetrics = {
        componentName: id,
        renderCount: existing.renderCount + 1,
        totalTime: existing.totalTime + actualDuration,
        averageTime: (existing.totalTime + actualDuration) / (existing.renderCount + 1),
        lastRenderTime: actualDuration,
    };

    metrics.set(id, updated);

    // Log to console in development
    if (import.meta.env.DEV) {
        console.group(`⚡ Profiler: ${id} (${phase})`);
        console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
        console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);
        console.log(`Render count: ${updated.renderCount}`);
        console.log(`Average time: ${updated.averageTime.toFixed(2)}ms`);
        console.log(`Time saved: ${(baseDuration - actualDuration).toFixed(2)}ms`);
        console.groupEnd();
    }
};

/**
 * Get performance metrics for a component
 */
export const getMetrics = (componentId: string): PerformanceMetrics | undefined => {
    return metrics.get(componentId);
};

/**
 * Get all performance metrics
 */
export const getAllMetrics = (): PerformanceMetrics[] => {
    return Array.from(metrics.values());
};

/**
 * Clear all metrics
 */
export const clearMetrics = (): void => {
    metrics.clear();
};

/**
 * Print performance summary to console
 */
export const printPerformanceSummary = (): void => {
    const allMetrics = getAllMetrics();

    if (allMetrics.length === 0) {
        console.log('No performance metrics collected yet');
        return;
    }

    console.table(
        allMetrics.map(m => ({
            Component: m.componentName,
            'Render Count': m.renderCount,
            'Avg Time (ms)': m.averageTime.toFixed(2),
            'Last Render (ms)': m.lastRenderTime.toFixed(2),
            'Total Time (ms)': m.totalTime.toFixed(2),
        }))
    );
};

/**
 * HOC to wrap component with Profiler
 */
export function withProfiler<P extends object>(
    Component: React.ComponentType<P>,
    id: string
): React.FC<P> {
    return (props: P) => (
        <Profiler id={id} onRender={onRenderCallback}>
            <Component {...props} />
        </Profiler>
    );
}

/**
 * Custom hook to track component renders
 */
export const useRenderCount = (componentName: string): number => {
    const renderCount = React.useRef(0);

    React.useEffect(() => {
        renderCount.current += 1;
        console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
    });

    return renderCount.current;
};

/**
 * Custom hook to measure render time
 */
export const useRenderTime = (componentName: string): void => {
    const startTime = React.useRef(performance.now());

    React.useEffect(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime.current;
        console.log(`⏱️ ${componentName} render time: ${renderTime.toFixed(2)}ms`);
        startTime.current = endTime;
    });
};

/**
 * Performance monitoring component
 */
export const PerformanceMonitor: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const metricsData = getAllMetrics();

    React.useEffect(() => {
        if (!enabled) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            // Press Ctrl+Shift+P to toggle performance monitor
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                setIsVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [enabled]);

    if (!enabled || !isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 10,
                right: 10,
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#00ff00',
                padding: '15px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxWidth: '400px',
                maxHeight: '300px',
                overflow: 'auto',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Performance Monitor</strong>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#00ff00',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    ×
                </button>
            </div>
            {metricsData.length === 0 ? (
                <div>No metrics collected yet</div>
            ) : (
                <table style={{ width: '100%', fontSize: '11px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #00ff00' }}>
                            <th style={{ textAlign: 'left', padding: '5px' }}>Component</th>
                            <th style={{ textAlign: 'right', padding: '5px' }}>Renders</th>
                            <th style={{ textAlign: 'right', padding: '5px' }}>Avg (ms)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metricsData.map(m => (
                            <tr key={m.componentName}>
                                <td style={{ padding: '5px' }}>{m.componentName}</td>
                                <td style={{ textAlign: 'right', padding: '5px' }}>{m.renderCount}</td>
                                <td style={{ textAlign: 'right', padding: '5px' }}>{m.averageTime.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
                Press Ctrl+Shift+P to toggle
            </div>
        </div>
    );
};
