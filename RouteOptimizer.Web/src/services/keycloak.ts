import Keycloak from 'keycloak-js';

// Keycloak configuration
const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'bus-route-optimizer',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'bus-route-web-app',
};

// Create Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

// Keycloak initialization options
export const keycloakInitOptions = {
    onLoad: 'check-sso' as const,
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256' as const,
    checkLoginIframe: false,
    flow: 'standard' as const,
};

// Token refresh configuration
export const keycloakTokens = {
    token: keycloak.token,
    refreshToken: keycloak.refreshToken,
    idToken: keycloak.idToken,
};

export default keycloak;