// utils/keycloak.ts
import Keycloak from 'keycloak-js';

// Singleton instance
let keycloakInstance: Keycloak | null = null;

export const getKeycloakInstance = (): Keycloak => {
    if (!keycloakInstance) {
        keycloakInstance = new Keycloak({
            url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
            realm: import.meta.env.VITE_KEYCLOAK_REALM || 'your-realm',
            clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'your-client-id',
        });
    }
    return keycloakInstance;
};

// Optional: Function to clear instance (useful for testing)
export const clearKeycloakInstance = () => {
    keycloakInstance = null;
};