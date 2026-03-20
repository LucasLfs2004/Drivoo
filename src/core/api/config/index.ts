/**
 * API Configuration
 * Defines URL base, timeout, and environment-specific settings
 */

// Environment configuration
const ENV = {
    dev: {
        API_BASE_URL: 'http://127.0.0.1:8000',
        API_TIMEOUT: 30000,
        LOG_REQUESTS: true,
    },
    staging: {
        API_BASE_URL: 'https://api-staging.drivoo.com',
        API_TIMEOUT: 30000,
        LOG_REQUESTS: false,
    },
    prod: {
        API_BASE_URL: 'https://api.drivoo.com',
        API_TIMEOUT: 30000,
        LOG_REQUESTS: false,
    },
};

/**
 * Get environment configuration
 * Uses __DEV__ flag to determine environment
 */
const getEnvVars = () => {
    // Check for environment variable override
    const apiBaseUrl = process.env.API_BASE_URL;
    if (apiBaseUrl) {
        return {
            API_BASE_URL: apiBaseUrl,
            API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),
            LOG_REQUESTS: process.env.LOG_REQUESTS === 'true',
        };
    }

    // Use __DEV__ flag for development vs production
    if (__DEV__) {
        return ENV.dev;
    }

    return ENV.prod;
};

// Export configuration
export const config = getEnvVars();

export const API_BASE_URL = config.API_BASE_URL;
export const API_TIMEOUT = config.API_TIMEOUT;
export const LOG_REQUESTS = config.LOG_REQUESTS;

/**
 * Validate that required configuration is present
 */
export function validateConfig(): void {
    if (!API_BASE_URL) {
        console.warn(
            'Warning: API_BASE_URL is not configured. ' +
            'Please set it in environment variables or update config.ts'
        );
    }

    if (!API_TIMEOUT || API_TIMEOUT <= 0) {
        console.warn(
            'Warning: API_TIMEOUT is not properly configured. ' +
            'Using default value of 30000ms'
        );
    }
}

// Validate configuration on module load
validateConfig();
