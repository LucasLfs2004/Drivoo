/**
 * API Request/Response Logger
 * Provides detailed logging for debugging API calls
 * Logs are only shown in development mode
 */

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface LogEntry {
    timestamp: string;
    type: 'request' | 'response' | 'error';
    method: string;
    url: string;
    status?: number;
    duration?: number;
    requestBody?: any;
    responseBody?: any;
    error?: string;
}

class ApiLogger {
    private logs: LogEntry[] = [];
    private maxLogs = 100;
    private requestTimestamps: Map<string, number> = new Map();

    /**
     * Log API request
     */
    logRequest(config: AxiosRequestConfig): void {
        if (!__DEV__) return;

        const key = `${config.method?.toUpperCase()} ${config.url}`;
        this.requestTimestamps.set(key, Date.now());

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            type: 'request',
            method: config.method?.toUpperCase() || 'GET',
            url: config.url || '',
            requestBody: this.sanitizeData(config.data),
        };

        this.addLog(entry);
        this.printLog(entry);
    }

    /**
     * Log API response
     */
    logResponse(response: AxiosResponse): void {
        if (!__DEV__) return;

        const key = `${response.config.method?.toUpperCase()} ${response.config.url}`;
        const startTime = this.requestTimestamps.get(key) || Date.now();
        const duration = Date.now() - startTime;

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            type: 'response',
            method: response.config.method?.toUpperCase() || 'GET',
            url: response.config.url || '',
            status: response.status,
            duration,
            responseBody: this.sanitizeData(response.data),
        };

        this.addLog(entry);
        this.printLog(entry);
        this.requestTimestamps.delete(key);
    }

    /**
     * Log API error
     */
    logError(error: AxiosError): void {
        if (!__DEV__) return;

        const key = `${error.config?.method?.toUpperCase()} ${error.config?.url}`;
        const startTime = this.requestTimestamps.get(key) || Date.now();
        const duration = Date.now() - startTime;

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            type: 'error',
            method: error.config?.method?.toUpperCase() || 'GET',
            url: error.config?.url || '',
            status: error.response?.status,
            duration,
            error: error.message,
            responseBody: this.sanitizeData(error.response?.data),
        };

        this.addLog(entry);
        this.printLog(entry);
        this.requestTimestamps.delete(key);
    }

    /**
     * Add log entry to history
     */
    private addLog(entry: LogEntry): void {
        this.logs.push(entry);

        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    /**
     * Print log to console
     */
    private printLog(entry: LogEntry): void {
        const icon = this.getIcon(entry);
        const color = this.getColor(entry);

        console.log(
            `%c${icon} [API] ${entry.method} ${entry.url}`,
            `color: ${color}; font-weight: bold;`
        );

        if (entry.status) {
            console.log(`   Status: ${entry.status}`);
        }

        if (entry.duration) {
            console.log(`   Duration: ${entry.duration}ms`);
        }

        if (entry.requestBody) {
            console.log('   Request:', entry.requestBody);
        }

        if (entry.responseBody) {
            console.log('   Response:', entry.responseBody);
        }

        if (entry.error) {
            console.log(`   Error: ${entry.error}`);
        }
    }

    /**
     * Get icon for log entry
     */
    private getIcon(entry: LogEntry): string {
        switch (entry.type) {
            case 'request':
                return '→';
            case 'response':
                return '←';
            case 'error':
                return '✗';
            default:
                return '•';
        }
    }

    /**
     * Get color for log entry
     */
    private getColor(entry: LogEntry): string {
        if (entry.type === 'error') {
            return '#FF6B6B'; // Red
        }

        if (entry.type === 'response') {
            if (!entry.status) return '#4ECDC4'; // Teal
            if (entry.status >= 200 && entry.status < 300) return '#51CF66'; // Green
            if (entry.status >= 300 && entry.status < 400) return '#FFD93D'; // Yellow
            if (entry.status >= 400 && entry.status < 500) return '#FF9F43'; // Orange
            return '#FF6B6B'; // Red
        }

        return '#6C5CE7'; // Purple
    }

    /**
     * Sanitize sensitive data from logs
     */
    private sanitizeData(data: any): any {
        if (!data) return data;

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch {
                return data;
            }
        }

        if (typeof data !== 'object') {
            return data;
        }

        const sanitized = { ...data };
        const sensitiveFields = [
            'password',
            'token',
            'accessToken',
            'refreshToken',
            'authorization',
            'creditCard',
            'cvv',
            'ssn',
        ];

        sensitiveFields.forEach(field => {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    /**
     * Get all logs
     */
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    /**
     * Clear logs
     */
    clearLogs(): void {
        this.logs = [];
        this.requestTimestamps.clear();
    }

    /**
     * Export logs as JSON
     */
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Print logs summary
     */
    printSummary(): void {
        if (!__DEV__) return;

        const requests = this.logs.filter(l => l.type === 'request').length;
        const responses = this.logs.filter(l => l.type === 'response').length;
        const errors = this.logs.filter(l => l.type === 'error').length;

        console.log('%c=== API Logger Summary ===', 'font-weight: bold; color: #6C5CE7;');
        console.log(`Requests: ${requests}`);
        console.log(`Responses: ${responses}`);
        console.log(`Errors: ${errors}`);
        console.log(`Total: ${this.logs.length}`);
    }
}

export const apiLogger = new ApiLogger();
