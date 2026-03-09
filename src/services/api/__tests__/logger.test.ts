/**
 * Tests for API Logger
 * Validates request/response logging functionality
 */

import { apiLogger, LogEntry } from '../logger';

describe('API Logger', () => {
    beforeEach(() => {
        apiLogger.clearLogs();
        jest.clearAllMocks();
    });

    describe('Request Logging', () => {
        it('should log API requests', () => {
            const config = {
                method: 'GET',
                url: '/api/users',
                headers: {},
            };

            apiLogger.logRequest(config);
            const logs = apiLogger.getLogs();

            expect(logs.length).toBe(1);
            expect(logs[0].type).toBe('request');
            expect(logs[0].method).toBe('GET');
            expect(logs[0].url).toBe('/api/users');
        });

        it('should include request body in logs', () => {
            const config = {
                method: 'POST',
                url: '/api/login',
                data: { email: 'test@example.com', password: 'password123' },
                headers: {},
            };

            apiLogger.logRequest(config);
            const logs = apiLogger.getLogs();

            expect(logs[0].requestBody).toBeDefined();
            expect(logs[0].requestBody.email).toBe('test@example.com');
        });

        it('should sanitize sensitive data in request logs', () => {
            const config = {
                method: 'POST',
                url: '/api/login',
                data: {
                    email: 'test@example.com',
                    password: 'secret123',
                    token: 'sensitive-token',
                },
                headers: {},
            };

            apiLogger.logRequest(config);
            const logs = apiLogger.getLogs();

            expect(logs[0].requestBody.password).toBe('[REDACTED]');
            expect(logs[0].requestBody.token).toBe('[REDACTED]');
            expect(logs[0].requestBody.email).toBe('test@example.com');
        });
    });

    describe('Response Logging', () => {
        it('should log API responses', () => {
            const response = {
                status: 200,
                statusText: 'OK',
                data: { id: 1, name: 'John' },
                config: {
                    method: 'GET',
                    url: '/api/users/1',
                    headers: {},
                },
                headers: {},
            };

            apiLogger.logResponse(response as any);
            const logs = apiLogger.getLogs();

            expect(logs.length).toBe(1);
            expect(logs[0].type).toBe('response');
            expect(logs[0].status).toBe(200);
            expect(logs[0].responseBody).toBeDefined();
        });

        it('should calculate request duration', () => {
            const config = {
                method: 'GET',
                url: '/api/users',
                headers: {},
            };

            apiLogger.logRequest(config);

            // Simulate delay
            jest.useFakeTimers();
            jest.advanceTimersByTime(100);

            const response = {
                status: 200,
                statusText: 'OK',
                data: { users: [] },
                config,
                headers: {},
            };

            apiLogger.logResponse(response as any);
            jest.useRealTimers();

            const logs = apiLogger.getLogs();
            expect(logs[1].duration).toBeGreaterThanOrEqual(100);
        });
    });

    describe('Error Logging', () => {
        it('should log API errors', () => {
            const error = {
                message: 'Network Error',
                config: {
                    method: 'GET',
                    url: '/api/users',
                    headers: {},
                },
                response: {
                    status: 500,
                    data: { error: 'Internal Server Error' },
                },
            };

            apiLogger.logError(error as any);
            const logs = apiLogger.getLogs();

            expect(logs.length).toBe(1);
            expect(logs[0].type).toBe('error');
            expect(logs[0].error).toBe('Network Error');
            expect(logs[0].status).toBe(500);
        });

        it('should sanitize sensitive data in error responses', () => {
            const error = {
                message: 'Unauthorized',
                config: {
                    method: 'GET',
                    url: '/api/profile',
                    headers: {},
                },
                response: {
                    status: 401,
                    data: {
                        error: 'Invalid token',
                        token: 'expired-token',
                    },
                },
            };

            apiLogger.logError(error as any);
            const logs = apiLogger.getLogs();

            expect(logs[0].responseBody.token).toBe('[REDACTED]');
        });
    });

    describe('Log Management', () => {
        it('should maintain maximum log limit', () => {
            // Add more logs than the max
            for (let i = 0; i < 150; i++) {
                const config = {
                    method: 'GET',
                    url: `/api/endpoint${i}`,
                    headers: {},
                };
                apiLogger.logRequest(config);
            }

            const logs = apiLogger.getLogs();
            expect(logs.length).toBeLessThanOrEqual(100);
        });

        it('should clear all logs', () => {
            const config = {
                method: 'GET',
                url: '/api/users',
                headers: {},
            };

            apiLogger.logRequest(config);
            expect(apiLogger.getLogs().length).toBe(1);

            apiLogger.clearLogs();
            expect(apiLogger.getLogs().length).toBe(0);
        });

        it('should export logs as JSON', () => {
            const config = {
                method: 'GET',
                url: '/api/users',
                headers: {},
            };

            apiLogger.logRequest(config);
            const exported = apiLogger.exportLogs();

            expect(typeof exported).toBe('string');
            const parsed = JSON.parse(exported);
            expect(Array.isArray(parsed)).toBe(true);
            expect(parsed.length).toBe(1);
        });
    });

    describe('Log Entry Structure', () => {
        it('should have correct structure for request logs', () => {
            const config = {
                method: 'POST',
                url: '/api/data',
                data: { test: 'data' },
                headers: {},
            };

            apiLogger.logRequest(config);
            const logs = apiLogger.getLogs();
            const log = logs[0];

            expect(log).toHaveProperty('timestamp');
            expect(log).toHaveProperty('type');
            expect(log).toHaveProperty('method');
            expect(log).toHaveProperty('url');
            expect(log.type).toBe('request');
        });

        it('should have correct structure for response logs', () => {
            const response = {
                status: 200,
                statusText: 'OK',
                data: { result: 'success' },
                config: {
                    method: 'GET',
                    url: '/api/data',
                    headers: {},
                },
                headers: {},
            };

            apiLogger.logResponse(response as any);
            const logs = apiLogger.getLogs();
            const log = logs[0];

            expect(log).toHaveProperty('timestamp');
            expect(log).toHaveProperty('type');
            expect(log).toHaveProperty('status');
            expect(log).toHaveProperty('duration');
            expect(log.type).toBe('response');
        });

        it('should have correct structure for error logs', () => {
            const error = {
                message: 'Request failed',
                config: {
                    method: 'GET',
                    url: '/api/data',
                    headers: {},
                },
                response: {
                    status: 404,
                    data: { error: 'Not found' },
                },
            };

            apiLogger.logError(error as any);
            const logs = apiLogger.getLogs();
            const log = logs[0];

            expect(log).toHaveProperty('timestamp');
            expect(log).toHaveProperty('type');
            expect(log).toHaveProperty('error');
            expect(log.type).toBe('error');
        });
    });

    describe('Data Sanitization', () => {
        it('should sanitize password field', () => {
            const config = {
                method: 'POST',
                url: '/api/login',
                data: { email: 'user@example.com', password: 'secret' },
                headers: {},
            };

            apiLogger.logRequest(config);
            const logs = apiLogger.getLogs();

            expect(logs[0].requestBody.password).toBe('[REDACTED]');
        });

        it('should sanitize token fields', () => {
            const config = {
                method: 'POST',
                url: '/api/auth',
                data: {
                    accessToken: 'token123',
                    refreshToken: 'refresh123',
                },
                headers: {},
            };

            apiLogger.logRequest(config);
            const logs = apiLogger.getLogs();

            expect(logs[0].requestBody.accessToken).toBe('[REDACTED]');
            expect(logs[0].requestBody.refreshToken).toBe('[REDACTED]');
        });

        it('should sanitize credit card data', () => {
            const config = {
                method: 'POST',
                url: '/api/payment',
                data: {
                    creditCard: '4111111111111111',
                    cvv: '123',
                },
                headers: {},
            };

            apiLogger.logRequest(config);
            const logs = apiLogger.getLogs();

            expect(logs[0].requestBody.creditCard).toBe('[REDACTED]');
            expect(logs[0].requestBody.cvv).toBe('[REDACTED]');
        });

        it('should preserve non-sensitive data', () => {
            const config = {
                method: 'POST',
                url: '/api/users',
                data: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    age: 30,
                },
                headers: {},
            };

            apiLogger.logRequest(config);
            const logs = apiLogger.getLogs();

            expect(logs[0].requestBody.name).toBe('John Doe');
            expect(logs[0].requestBody.email).toBe('john@example.com');
            expect(logs[0].requestBody.age).toBe(30);
        });
    });
});
