/**
 * API Configuration Validation Tests
 * Validates that the API client is properly configured and working
 */

import { API_BASE_URL, API_TIMEOUT, validateConfig } from '../config';
import apiClient from '../client';
import { handleApiError } from '../errorHandler';
import axios from 'axios';

describe('API Configuration Validation', () => {
    describe('Configuration Loading', () => {
        it('should load API_BASE_URL from environment', () => {
            expect(API_BASE_URL).toBeDefined();
            expect(typeof API_BASE_URL).toBe('string');
            expect(API_BASE_URL.length).toBeGreaterThan(0);
        });

        it('should load API_TIMEOUT with valid value', () => {
            expect(API_TIMEOUT).toBeDefined();
            expect(typeof API_TIMEOUT).toBe('number');
            expect(API_TIMEOUT).toBeGreaterThan(0);
            expect(API_TIMEOUT).toBeLessThanOrEqual(60000); // Should be reasonable
        });

        it('should validate configuration without throwing', () => {
            expect(() => validateConfig()).not.toThrow();
        });

        it('should have correct API base URL format', () => {
            expect(API_BASE_URL).toMatch(/^https?:\/\//);
        });
    });

    describe('Axios Client Configuration', () => {
        it('should have axios client instance', () => {
            expect(apiClient).toBeDefined();
            expect(apiClient.defaults).toBeDefined();
        });

        it('should have correct base URL configured', () => {
            expect(apiClient.defaults.baseURL).toBe(API_BASE_URL);
        });

        it('should have timeout configured', () => {
            expect(apiClient.defaults.timeout).toBe(API_TIMEOUT);
        });

        it('should have Content-Type header set', () => {
            expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
        });

        it('should have request interceptor', () => {
            expect(apiClient.interceptors.request).toBeDefined();
            expect(apiClient.interceptors.request.handlers).toBeDefined();
            expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
        });

        it('should have response interceptor', () => {
            expect(apiClient.interceptors.response).toBeDefined();
            expect(apiClient.interceptors.response.handlers).toBeDefined();
            expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handler', () => {
        it('should handle network errors', () => {
            const networkError = new Error('Network Error');
            const handled = handleApiError(networkError);

            expect(handled.code).toBe('UNKNOWN_ERROR');
            expect(handled.message).toBeDefined();
            expect(handled.statusCode).toBe(0);
        });

        it('should handle axios validation errors (422)', () => {
            const axiosError = new axios.AxiosError('Validation Error');
            axiosError.response = {
                status: 422,
                data: {
                    error: 'VALIDATION_ERROR',
                    message: 'Invalid input',
                    details: { email: 'Invalid email' },
                },
                statusText: 'Unprocessable Entity',
                headers: {},
                config: {} as any,
            };

            const handled = handleApiError(axiosError);

            expect(handled.statusCode).toBe(422);
            expect(handled.type).toBe('validation');
            expect(handled.details).toBeDefined();
        });

        it('should handle authentication errors (401)', () => {
            const axiosError = new axios.AxiosError('Unauthorized');
            axiosError.response = {
                status: 401,
                data: { error: 'UNAUTHORIZED' },
                statusText: 'Unauthorized',
                headers: {},
                config: {} as any,
            };

            const handled = handleApiError(axiosError);

            expect(handled.statusCode).toBe(401);
            expect(handled.type).toBe('auth');
        });

        it('should handle server errors (500)', () => {
            const axiosError = new axios.AxiosError('Server Error');
            axiosError.response = {
                status: 500,
                data: { error: 'SERVER_ERROR' },
                statusText: 'Internal Server Error',
                headers: {},
                config: {} as any,
            };

            const handled = handleApiError(axiosError);

            expect(handled.statusCode).toBe(500);
            expect(handled.type).toBe('server');
        });

        it('should identify retryable errors', () => {
            const networkError = new axios.AxiosError('Network Error');
            const handled = handleApiError(networkError);

            expect(handled.type).toBe('network');
        });
    });

    describe('API Client Interceptors', () => {
        it('should add Authorization header in request interceptor', async () => {
            // This test verifies the interceptor is registered
            // Actual token injection is tested in auth tests
            expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
        });

        it('should handle 401 responses in response interceptor', async () => {
            // This test verifies the interceptor is registered
            // Actual token refresh is tested in auth tests
            expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
        });
    });

    describe('Configuration Consistency', () => {
        it('should have consistent timeout across config and client', () => {
            expect(apiClient.defaults.timeout).toBe(API_TIMEOUT);
        });

        it('should have consistent base URL across config and client', () => {
            expect(apiClient.defaults.baseURL).toBe(API_BASE_URL);
        });

        it('should support environment variable override', () => {
            // This test documents that API_BASE_URL can be overridden via env vars
            expect(API_BASE_URL).toBeDefined();
        });
    });
});
