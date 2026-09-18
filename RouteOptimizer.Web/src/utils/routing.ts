import type { BusStop } from '@/types';

/**
 * Fetches a route path from OSRM that follows actual streets
 * @param stops Array of bus stops in order
 * @returns Array of [lat, lng] coordinates following streets
 */
export async function fetchStreetRoute(stops: BusStop[]): Promise<[number, number][]> {
    if (stops.length < 2) {
        return [];
    }

    try {
        // Build coordinates string for OSRM API
        const coordinates = stops
            .map(stop => `${stop.location.longitude},${stop.location.latitude}`)
            .join(';');

        // Use public OSRM demo server
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            // Extract coordinates from GeoJSON geometry
            const coordinates = data.routes[0].geometry.coordinates;
            // Convert from [lng, lat] to [lat, lng] format
            return coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
        }

        // Fallback to direct lines if routing fails
        console.warn('OSRM routing failed, using direct lines');
        return stops.map(stop => [stop.location.latitude, stop.location.longitude] as [number, number]);
    } catch (error) {
        console.error('Error fetching route from OSRM:', error);
        // Fallback to direct lines if API call fails
        return stops.map(stop => [stop.location.latitude, stop.location.longitude] as [number, number]);
    }
}

/**
 * Generates route path for multiple stops by connecting them via streets
 * Can be used when creating or editing routes
 */
export async function generateRoutePath(stops: BusStop[]): Promise<[number, number][]> {
    return fetchStreetRoute(stops);
}
