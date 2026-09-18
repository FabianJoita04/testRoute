import { UserLocationService } from '../services/UserLocationService';
import { MapController } from './MapController';

export class UserLocationController {
    private userLocationService: UserLocationService;
    private mapController: MapController;

    constructor(userLocationService: UserLocationService, mapController: MapController) {
        this.userLocationService = userLocationService;
        this.mapController = mapController;
    }

    public handleUserLocationUpdate(userId: number, latitude: number, longitude: number): void {
        // Update the user location on the map
        this.mapController.updateUserLocation(userId, [latitude, longitude]);

        // Log the update
        console.log(`User ${userId} location updated to: ${latitude}, ${longitude}`);
    }
}
