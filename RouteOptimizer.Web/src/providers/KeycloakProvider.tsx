// providers/KeycloakProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getKeycloakInstance } from '../utils/keycloak';
import type Keycloak from 'keycloak-js';

interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    permissions: string[];
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    keycloak: Keycloak | null;
    login: () => void;
    logout: () => void;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface KeycloakProviderProps {
    children: React.ReactNode;
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const parseUserFromKeycloak = useCallback((keycloakInstance: Keycloak): User | null => {
        if (!keycloakInstance.tokenParsed) {
            return null;
        }

        const tokenParsed = keycloakInstance.tokenParsed as any;

        // Debug: Log the full token to see what's available
        console.log('=== KEYCLOAK TOKEN DEBUG ===');
        console.log('Full Token:', tokenParsed);
        console.log('Realm Access:', tokenParsed.realm_access);
        console.log('Resource Access:', tokenParsed.resource_access);
        console.log('============================');

        let roles: string[] = [];

        // Method 1: Handle realm_access.roles (could be array or string)
        if (tokenParsed.realm_access?.roles) {
            const realmRoles = tokenParsed.realm_access.roles;

            if (Array.isArray(realmRoles)) {
                // JSON format - already an array
                roles = [...roles, ...realmRoles];
                console.log('Found realm_access roles (JSON format):', realmRoles);
            } else if (typeof realmRoles === 'string') {
                // String format - need to parse
                const parsedRoles = realmRoles.split(',').map(role => role.trim()).filter(role => role);
                roles = [...roles, ...parsedRoles];
                console.log('Found realm_access roles (String format):', realmRoles, '→ Parsed:', parsedRoles);
            }
        }

        // Method 2: Handle custom user_roles field (recommended approach)
        if (tokenParsed.user_roles) {
            if (Array.isArray(tokenParsed.user_roles)) {
                roles = [...roles, ...tokenParsed.user_roles];
                console.log('Found user_roles field (array):', tokenParsed.user_roles);
            } else if (typeof tokenParsed.user_roles === 'string') {
                const parsedRoles = tokenParsed.user_roles.split(',').map((role: string) => role.trim()).filter((role: any) => role);
                roles = [...roles, ...parsedRoles];
                console.log('Found user_roles field (string):', tokenParsed.user_roles, '→ Parsed:', parsedRoles);
            }
        }

        // Method 3: Handle direct roles field (in case of other custom mapping)
        if (tokenParsed.roles) {
            if (Array.isArray(tokenParsed.roles)) {
                roles = [...roles, ...tokenParsed.roles];
                console.log('Found direct roles field (array):', tokenParsed.roles);
            } else if (typeof tokenParsed.roles === 'string') {
                const parsedRoles = tokenParsed.roles.split(',').map((role: string) => role.trim()).filter((role: any) => role);
                roles = [...roles, ...parsedRoles];
                console.log('Found direct roles field (string):', tokenParsed.roles, '→ Parsed:', parsedRoles);
            }
        }

        // Method 3: Handle client roles from resource_access
        if (tokenParsed.resource_access) {
            Object.keys(tokenParsed.resource_access).forEach(clientId => {
                const clientRoles = tokenParsed.resource_access[clientId]?.roles || [];
                if (Array.isArray(clientRoles)) {
                    roles = [...roles, ...clientRoles];
                    console.log(`Found client roles for ${clientId}:`, clientRoles);
                }
            });
        }

        // Remove duplicates and filter out Keycloak default/internal roles
        const uniqueRoles = [...new Set(roles)];
        const keycloakInternalRoles = [
            'offline_access',
            'uma_authorization',
            'manage-account',
            'manage-account-links',
            'view-profile',
            'view-applications',
            'view-consent',
            'manage-consent',
            'delete-account'
        ];

        const filteredRoles = uniqueRoles.filter(role =>
            role &&
            typeof role === 'string' &&
            role.trim() !== '' &&
            !keycloakInternalRoles.includes(role) &&
            !role.startsWith('default-roles-')
        );

        console.log('=== ROLES PROCESSING ===');
        console.log('All found roles:', uniqueRoles);
        console.log('Filtered roles:', filteredRoles);
        console.log('========================');

        const userData = {
            id: tokenParsed.sub || '',
            username: tokenParsed.preferred_username || tokenParsed.email || '',
            email: tokenParsed.email || '',
            firstName: tokenParsed.given_name || '',
            lastName: tokenParsed.family_name || '',
            roles: filteredRoles,
            permissions: filteredRoles,
        };

        console.log('=== FINAL USER DATA ===');
        console.log('User object:', userData);
        console.log('=======================');

        return userData;
    }, []);

    const initializeKeycloak = useCallback(async () => {
        try {
            setIsLoading(true);
            const keycloakInstance = getKeycloakInstance();

            // Check if already initialized
            if (keycloakInstance.authenticated !== undefined) {
                setKeycloak(keycloakInstance);
                setIsAuthenticated(keycloakInstance.authenticated || false);
                setToken(keycloakInstance.token || null);

                if (keycloakInstance.authenticated) {
                    const userData = parseUserFromKeycloak(keycloakInstance);
                    setUser(userData);
                }
                setIsLoading(false);
                return;
            }

            const authenticated = await keycloakInstance.init({
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
                checkLoginIframe: false,
                pkceMethod: 'S256',
                // Add these for better CORS handling
                enableLogging: true,
                messageReceiveTimeout: 10000,
                responseMode: 'fragment',
                flow: 'standard'
            });

            setKeycloak(keycloakInstance);
            setIsAuthenticated(authenticated);
            setToken(keycloakInstance.token || null);

            if (authenticated) {
                // Load user profile first
                try {
                    await keycloakInstance.loadUserProfile();
                    console.log('User Profile Loaded:', keycloakInstance.userInfo);
                } catch (profileError) {
                    console.warn('Failed to load user profile, continuing with token data only:', profileError);
                }

                const userData = parseUserFromKeycloak(keycloakInstance);
                console.log('Setting user data:', userData);

                // IMPORTANT: Only set loading to false AFTER user data is fully parsed
                // Set user data first, then wait a tick to ensure state is updated
                setUser(userData);

                if (userData && userData.roles && userData.roles.length > 0) {
                    console.log('User data with roles ready:', userData.roles);
                    // Use setTimeout to ensure user state is updated before marking as loaded
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 100);
                } else {
                    console.warn('User data loaded but no roles found, will retry...');
                    // Try parsing again after a brief delay
                    setTimeout(() => {
                        const retryUserData = parseUserFromKeycloak(keycloakInstance);
                        console.log('Retry user data:', retryUserData);
                        setUser(retryUserData);
                        setTimeout(() => {
                            setIsLoading(false);
                        }, 100);
                    }, 500);
                }

                // Set up token refresh
                keycloakInstance.onTokenExpired = () => {
                    console.log('Token expired, refreshing...');
                    keycloakInstance.updateToken(30).then((refreshed) => {
                        if (refreshed) {
                            console.log('Token refreshed successfully');
                            setToken(keycloakInstance.token || null);
                            // Re-parse user data in case roles changed
                            const updatedUserData = parseUserFromKeycloak(keycloakInstance);
                            setUser(updatedUserData);
                        }
                    }).catch(() => {
                        console.log('Failed to refresh token');
                        logout();
                    });
                };
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Keycloak initialization failed:', error);
            setIsLoading(false);
        }
    }, [parseUserFromKeycloak]);

    useEffect(() => {
        initializeKeycloak();
    }, [initializeKeycloak]);

    const login = useCallback(() => {
        if (keycloak) {
            keycloak.login();
        }
    }, [keycloak]);

    const logout = useCallback(() => {
        if (keycloak) {
            setUser(null);
            setIsAuthenticated(false);
            setToken(null);
            keycloak.logout();
        }
    }, [keycloak]);

    const hasRole = useCallback((role: string): boolean => {
        return user?.roles.includes(role) || false;
    }, [user]);

    const hasPermission = useCallback((permission: string): boolean => {
        return user?.permissions.includes(permission) || false;
    }, [user]);

    const contextValue: AuthContextType = {
        isAuthenticated,
        isLoading,
        user,
        keycloak,
        login,
        logout,
        hasRole,
        hasPermission,
        token
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};