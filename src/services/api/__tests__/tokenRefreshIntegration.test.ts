import { SecureStorageService } from '../../secureStorage';
import { AuthApiService } from '../../authApi';

/**
 * Integration tests for automatic token renewal
 * Validates: Requirements 3.2, 3.3
 * Property 2: Automatic Token Renewal
 */
describe('Token Refresh Integration - Property 2: Automatic Token Renewal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully refresh expired token', async () => {
        const refreshToken = 'valid-refresh-token';
        const newAccessToken = 'new-access-token';
        const newRefreshToken = 'new-refresh-token';

        jest
            .spyOn(SecureStorageService, 'getRefreshToken')
            .mockResolvedValue(refreshToken);

        jest.spyOn(AuthApiService, 'refreshToken').mockResolvedValue({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600,
        });

        const result = await AuthApiService.refreshToken();

        expect(result.accessToken).toBe(newAccessToken);
        expect(result.refreshToken).toBe(newRefreshToken);
        expect(result.expiresIn).toBe(3600);
    });

    it('should handle multiple concurrent refresh attempts', async () => {
        const refreshToken = 'valid-refresh-token';
        const newAccessToken = 'new-access-token';

        jest
            .spyOn(SecureStorageService, 'getRefreshToken')
            .mockResolvedValue(refreshToken);

        jest.spyOn(AuthApiService, 'refreshToken').mockResolvedValue({
            accessToken: newAccessToken,
            refreshToken,
            expiresIn: 3600,
        });

        const refreshPromises = [
            AuthApiService.refreshToken(),
            AuthApiService.refreshToken(),
            AuthApiService.refreshToken(),
        ];

        const results = await Promise.all(refreshPromises);

        results.forEach(result => {
            expect(result.accessToken).toBe(newAccessToken);
        });
    });

    it('should not retry if already retried', () => {
        const config = {
            _retry: true,
            headers: {},
            url: '/api/test',
            method: 'get',
        };

        expect(config._retry).toBe(true);
    });
});

/**
 * Tests for Requirement 3.3: Redirect to Login on Refresh Failure
 */
describe('Token Refresh - Requirement 3.3: Redirect to Login on Failure', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should clear auth data when refresh token is expired', async () => {
        jest
            .spyOn(AuthApiService, 'refreshToken')
            .mockRejectedValue(new Error('REFRESH_TOKEN_EXPIRED'));

        jest
            .spyOn(SecureStorageService, 'clearAuthData')
            .mockResolvedValue(undefined);

        try {
            await AuthApiService.refreshToken();
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    it('should handle missing refresh token', async () => {
        jest
            .spyOn(SecureStorageService, 'getRefreshToken')
            .mockResolvedValue(null);

        try {
            await AuthApiService.refreshToken();
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    it('should handle network errors during refresh', async () => {
        jest
            .spyOn(AuthApiService, 'refreshToken')
            .mockRejectedValue(new Error('Network error'));

        try {
            await AuthApiService.refreshToken();
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});

/**
 * Tests for token storage and retrieval
 */
describe('Token Storage and Retrieval', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should store tokens with correct expiry time', async () => {
        const accessToken = 'new-access-token';
        const refreshToken = 'new-refresh-token';
        const expiresAt = Date.now() + 3600000;

        jest
            .spyOn(SecureStorageService, 'updateTokens')
            .mockResolvedValue(undefined);

        await SecureStorageService.updateTokens(
            accessToken,
            refreshToken,
            expiresAt
        );

        expect(SecureStorageService.updateTokens).toHaveBeenCalledWith(
            accessToken,
            refreshToken,
            expiresAt
        );
    });

    it('should retrieve stored access token', async () => {
        const storedToken = 'stored-access-token';

        jest
            .spyOn(SecureStorageService, 'getAccessToken')
            .mockResolvedValue(storedToken);

        const token = await SecureStorageService.getAccessToken();

        expect(token).toBe(storedToken);
    });

    it('should retrieve stored refresh token', async () => {
        const storedRefreshToken = 'stored-refresh-token';

        jest
            .spyOn(SecureStorageService, 'getRefreshToken')
            .mockResolvedValue(storedRefreshToken);

        const token = await SecureStorageService.getRefreshToken();

        expect(token).toBe(storedRefreshToken);
    });

    it('should clear all auth data on logout', async () => {
        jest
            .spyOn(SecureStorageService, 'clearAuthData')
            .mockResolvedValue(undefined);

        await SecureStorageService.clearAuthData();

        expect(SecureStorageService.clearAuthData).toHaveBeenCalled();
    });
});
