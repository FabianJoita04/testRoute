/**
 * Script to generate actual street-following paths for sample routes
 * Run this to update the sampleRoutes.ts file with realistic paths
 *
 * Usage: Run this in a browser console or Node.js environment
 */

import { bucharestRoutes, bucharestStops } from '../data/sampleRoutes';
import { fetchStreetRoute } from '../utils/routing';

async function generateAllRoutePaths() {
    console.log('Generating street-following paths for all routes...');

    const updatedRoutes = [];

    for (const route of bucharestRoutes) {
        console.log(`Processing route ${route.code}: ${route.name}`);

        if (route.busStops && route.busStops.length >= 2) {
            const path = await fetchStreetRoute(route.busStops);
            updatedRoutes.push({
                ...route,
                path
            });
            console.log(`✓ Generated ${path.length} points for route ${route.code}`);
        } else {
            updatedRoutes.push(route);
            console.log(`✗ Skipped route ${route.code} (insufficient stops)`);
        }

        // Add small delay to avoid overwhelming the OSRM server
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=== Generated Route Data ===');
    console.log('Copy this to sampleRoutes.ts:\n');
    console.log(JSON.stringify(updatedRoutes, null, 2));

    return updatedRoutes;
}

// Export for use in browser or Node
export { generateAllRoutePaths };

// Auto-run if executed directly
if (typeof window !== 'undefined') {
    (window as any).generateAllRoutePaths = generateAllRoutePaths;
    console.log('Run: generateAllRoutePaths() to generate paths');
}
