import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'drivoo_auth_token';
const REFRESH_TOKEN_SERVICE = 'drivoo_refresh_token';
const KEYCHAIN_USERNAME = 'drivoo_user';

/**
 * Retrieves the access token from Keychain
 * Uses native OS-level encryption for maximum security
 * @returns The access token string or null if not found
 * @throws Error if Keychain operation fails
 */
export async function getToken(): Promise<string | null> {
    try {
        const credentials = await Keychain.getGenericPassword({
            service: TOKEN_SERVICE,
        });

        if (credentials) {
            return credentials.password;
        }
        return null;
    } catch (error) {
        console.error('Failed to get token from Keychain:', error);
        throw new Error('Falha ao recuperar token de autenticação');
    }
}

/**
 * Stores the access token in Keychain with native OS encryption
 * @param token The access token to store
 * @throws Error if Keychain operation fails
 */
export async function setToken(token: string): Promise<void> {
    const params = {
        username: KEYCHAIN_USERNAME,
        token,
        service: TOKEN_SERVICE,
    };

    validateKeychainParams(params);
    try {
        await Keychain.setGenericPassword(KEYCHAIN_USERNAME, token, {
            service: TOKEN_SERVICE,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
    } catch (error) {
        console.error('Failed to set token in Keychain:', error);
        throw new Error('Falha ao armazenar token de autenticação');
    }
}

/**
 * Retrieves the refresh token from Keychain
 * @returns The refresh token string or null if not found
 * @throws Error if Keychain operation fails
 */
export async function getRefreshToken(): Promise<string | null> {
    try {
        const credentials = await Keychain.getGenericPassword({
            service: REFRESH_TOKEN_SERVICE,
        });

        if (credentials) {
            return credentials.password;
        }
        return null;
    } catch (error) {
        console.error('Failed to get refresh token from Keychain:', error);
        throw new Error('Falha ao recuperar token de renovação');
    }
}

/**
 * Stores the refresh token in Keychain with native OS encryption
 * @param token The refresh token to store
 * @throws Error if Keychain operation fails
 */
export async function setRefreshToken(token: string): Promise<void> {
    const params = {
        username: KEYCHAIN_USERNAME,
        token,
        service: REFRESH_TOKEN_SERVICE,
    };
    validateKeychainParams(params);
    try {
        await Keychain.setGenericPassword(KEYCHAIN_USERNAME, token, {
            service: REFRESH_TOKEN_SERVICE,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
    } catch (error) {
        console.error('Failed to set refresh token in Keychain:', error);
        throw new Error('Falha ao armazenar token de renovação');
    }
}

/**
 * Removes both access and refresh tokens from Keychain
 * @throws Error if Keychain operation fails
 */
export async function removeToken(): Promise<void> {
    try {
        await Promise.all([
            Keychain.resetGenericPassword({ service: TOKEN_SERVICE }),
            Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE }),
        ]);
    } catch (error) {
        console.error('Failed to remove tokens from Keychain:', error);
        throw new Error('Falha ao remover tokens de autenticação');
    }
}

/**
 * Checks if a valid token exists in Keychain
 * @returns true if token exists, false otherwise
 */
export async function hasToken(): Promise<boolean> {
    try {
        const token = await getToken();
        return token !== null && token.length > 0;
    } catch (error) {
        console.error('Failed to check token existence:', error);
        return false;
    }
}

/**
 * Clears all authentication-related data from Keychain
 * This is a comprehensive cleanup of all auth credentials
 * @throws Error if Keychain operation fails
 */
export async function clearAuthStorage(): Promise<void> {
    try {
        await Promise.all([
            Keychain.resetGenericPassword({ service: TOKEN_SERVICE }),
            Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE }),
        ]);
    } catch (error) {
        console.error('Failed to clear auth storage:', error);
        throw new Error('Falha ao limpar dados de autenticação');
    }
}


function validateKeychainParams(params: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) {
            throw new Error(`Keychain param "${key}" is ${value}`);
        }

        if (typeof value === "string" && value.trim() === "") {
            throw new Error(`Keychain param "${key}" is an empty string`);
        }
    }
}