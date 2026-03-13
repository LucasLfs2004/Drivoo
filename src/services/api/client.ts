import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { SecureStorageService } from '../secureStorage';
import { AuthApiService } from '../authApi';
import { handleApiError } from './errorHandler';
import { apiLogger } from './logger';
import { getToken } from '../auth/tokenStorage';

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8000';
const API_TIMEOUT = 30000; // 30 seconds
const ACCESS_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Axios instance for API requests
 * Includes interceptors for authentication and error handling
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Flag to prevent infinite refresh loops
 */
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token || '');
        }
    });

    isRefreshing = false;
    failedQueue = [];
};

/**
 * Request Interceptor - Adds JWT token to requests
 */
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const accessToken =
                (await SecureStorageService.getAccessToken()) ??
                (await getToken());

            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            // Log the request
            apiLogger.logRequest(config);

            return config;
        } catch (error) {
            console.error('Error in request interceptor:', error);
            return config;
        }
    },
    error => Promise.reject(error)
);

/**
 * Response Interceptor - Handles errors and token refresh
 */
apiClient.interceptors.response.use(
    response => {
        // Log successful response
        apiLogger.logResponse(response);
        return response;
    },
    async (error: AxiosError) => {
        // Log error
        if (error instanceof AxiosError) {
            apiLogger.logError(error);
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue the request while token is being refreshed
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(apiClient(originalRequest));
                        },
                        reject: (err: any) => {
                            reject(err);
                        },
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token
                const refreshResponse = await AuthApiService.refreshToken();

                const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS;

                // Update stored tokens
                await SecureStorageService.updateTokens(
                    refreshResponse.accessToken,
                    refreshResponse.refreshToken,
                    expiresAt
                );

                // Update the authorization header
                const token = refreshResponse.accessToken;
                apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
                originalRequest.headers.Authorization = `Bearer ${token}`;

                // Process queued requests
                processQueue(null, token);

                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Token refresh failed - clear auth data and reject
                await SecureStorageService.clearAuthData();
                processQueue(refreshError, null);

                // Dispatch logout event or redirect to login
                // This should be handled by the app's auth context
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        const apiError = handleApiError(error);

        // Log error for debugging
        console.error('API Error:', {
            code: apiError.code,
            message: apiError.message,
            statusCode: apiError.statusCode,
            url: originalRequest?.url,
        });

        return Promise.reject(apiError);
    }
);

export default apiClient;
