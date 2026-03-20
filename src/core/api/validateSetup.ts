/**
 * API Setup Validation Script
 * Validates that all API components are properly configured
 * Run this to verify the API integration is working correctly
 */

import { API_BASE_URL, API_TIMEOUT, validateConfig } from './config';
import apiClient from './client';
import { handleApiError } from './error';

interface ValidationResult {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    details?: any;
}

const results: ValidationResult[] = [];

/**
 * Validate configuration is loaded
 */
function validateConfiguration(): void {
    try {
        validateConfig();
        results.push({
            name: 'Configuration Loading',
            status: 'pass',
            message: 'Configuration loaded successfully',
            details: {
                API_BASE_URL,
                API_TIMEOUT,
            },
        });
    } catch (error) {
        results.push({
            name: 'Configuration Loading',
            status: 'fail',
            message: `Configuration validation failed: ${error}`,
        });
    }
}

/**
 * Validate API base URL
 */
function validateApiUrl(): void {
    if (!API_BASE_URL) {
        results.push({
            name: 'API Base URL',
            status: 'fail',
            message: 'API_BASE_URL is not defined',
        });
        return;
    }

    if (!API_BASE_URL.match(/^https?:\/\//)) {
        results.push({
            name: 'API Base URL',
            status: 'fail',
            message: `Invalid API_BASE_URL format: ${API_BASE_URL}`,
        });
        return;
    }

    results.push({
        name: 'API Base URL',
        status: 'pass',
        message: `API Base URL is valid: ${API_BASE_URL}`,
    });
}

/**
 * Validate timeout configuration
 */
function validateTimeout(): void {
    if (!API_TIMEOUT || API_TIMEOUT <= 0) {
        results.push({
            name: 'API Timeout',
            status: 'fail',
            message: 'API_TIMEOUT is not properly configured',
        });
        return;
    }

    if (API_TIMEOUT < 5000) {
        results.push({
            name: 'API Timeout',
            status: 'warning',
            message: `API_TIMEOUT is very short: ${API_TIMEOUT}ms (recommended: >= 5000ms)`,
        });
        return;
    }

    results.push({
        name: 'API Timeout',
        status: 'pass',
        message: `API Timeout is configured: ${API_TIMEOUT}ms`,
    });
}

/**
 * Validate Axios client configuration
 */
function validateAxiosClient(): void {
    if (!apiClient) {
        results.push({
            name: 'Axios Client',
            status: 'fail',
            message: 'Axios client is not initialized',
        });
        return;
    }

    if (apiClient.defaults.baseURL !== API_BASE_URL) {
        results.push({
            name: 'Axios Client Base URL',
            status: 'fail',
            message: `Axios baseURL mismatch: ${apiClient.defaults.baseURL} !== ${API_BASE_URL}`,
        });
        return;
    }

    if (apiClient.defaults.timeout !== API_TIMEOUT) {
        results.push({
            name: 'Axios Client Timeout',
            status: 'fail',
            message: `Axios timeout mismatch: ${apiClient.defaults.timeout} !== ${API_TIMEOUT}`,
        });
        return;
    }

    results.push({
        name: 'Axios Client',
        status: 'pass',
        message: 'Axios client is properly configured',
        details: {
            baseURL: apiClient.defaults.baseURL,
            timeout: apiClient.defaults.timeout,
            headers: apiClient.defaults.headers,
        },
    });
}

/**
 * Validate interceptors are registered
 */
function validateInterceptors(): void {
    const requestHandlers = apiClient.interceptors.request.handlers?.length ?? 0;
    const responseHandlers = apiClient.interceptors.response.handlers?.length ?? 0;

    if (requestHandlers === 0) {
        results.push({
            name: 'Request Interceptor',
            status: 'fail',
            message: 'No request interceptors registered',
        });
    } else {
        results.push({
            name: 'Request Interceptor',
            status: 'pass',
            message: `Request interceptor registered (${requestHandlers} handler(s))`,
        });
    }

    if (responseHandlers === 0) {
        results.push({
            name: 'Response Interceptor',
            status: 'fail',
            message: 'No response interceptors registered',
        });
    } else {
        results.push({
            name: 'Response Interceptor',
            status: 'pass',
            message: `Response interceptor registered (${responseHandlers} handler(s))`,
        });
    }
}

/**
 * Validate error handler
 */
function validateErrorHandler(): void {
    try {
        const testError = new Error('Test error');
        const handled = handleApiError(testError);

        if (!handled.code || !handled.message) {
            results.push({
                name: 'Error Handler',
                status: 'fail',
                message: 'Error handler does not return proper structure',
            });
            return;
        }

        results.push({
            name: 'Error Handler',
            status: 'pass',
            message: 'Error handler is working correctly',
            details: {
                handledError: {
                    code: handled.code,
                    message: handled.message,
                    type: handled.type,
                },
            },
        });
    } catch (error) {
        results.push({
            name: 'Error Handler',
            status: 'fail',
            message: `Error handler validation failed: ${error}`,
        });
    }
}

/**
 * Run all validations
 */
export function runValidation(): ValidationResult[] {
    console.log('\n=== API Configuration Validation ===\n');

    validateConfiguration();
    validateApiUrl();
    validateTimeout();
    validateAxiosClient();
    validateInterceptors();
    validateErrorHandler();

    // Print results
    results.forEach(result => {
        const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠';
        console.log(`${icon} ${result.name}: ${result.message}`);
        if (result.details) {
            console.log(`  Details: ${JSON.stringify(result.details, null, 2)}`);
        }
    });

    // Summary
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    console.log(`\n=== Summary ===`);
    console.log(`Passed: ${passed}/${results.length}`);
    if (warnings > 0) console.log(`Warnings: ${warnings}`);
    if (failed > 0) console.log(`Failed: ${failed}`);

    if (failed === 0) {
        console.log('\n✓ API configuration is valid!\n');
    } else {
        console.log('\n✗ API configuration has issues. Please review above.\n');
    }

    return results;
}

// Export for testing
export type { ValidationResult };
