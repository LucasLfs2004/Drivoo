# API Logger Guide

## Overview

The API Logger provides detailed request/response logging for debugging API calls in development mode. It automatically logs all HTTP requests, responses, and errors with automatic sensitive data sanitization.

## Features

- **Request Logging**: Logs all outgoing API requests with method, URL, and request body
- **Response Logging**: Logs all successful responses with status code, duration, and response body
- **Error Logging**: Logs all API errors with error message and response data
- **Duration Tracking**: Automatically calculates request duration
- **Data Sanitization**: Automatically redacts sensitive fields (passwords, tokens, credit cards, etc.)
- **Log History**: Maintains up to 100 recent logs
- **Export**: Export logs as JSON for analysis
- **Development Only**: Logs only shown in development mode (`__DEV__`)

## Usage

### Automatic Logging

The logger is automatically integrated into the API client. All requests, responses, and errors are logged automatically:

```typescript
// In development mode, this will be logged automatically
const response = await apiClient.get('/api/users');
// Console output:
// → [API] GET /api/users
// ← [API] GET /api/users
//    Status: 200
//    Duration: 45ms
//    Response: { users: [...] }
```

### Manual Access

You can access the logger directly for advanced use cases:

```typescript
import { apiLogger } from '@/services/api/logger';

// Get all logs
const logs = apiLogger.getLogs();

// Clear logs
apiLogger.clearLogs();

// Export logs as JSON
const jsonLogs = apiLogger.exportLogs();

// Print summary
apiLogger.printSummary();
```

## Log Entry Structure

Each log entry contains:

```typescript
interface LogEntry {
  timestamp: string;           // ISO timestamp
  type: 'request' | 'response' | 'error';
  method: string;              // HTTP method (GET, POST, etc.)
  url: string;                 // Request URL
  status?: number;             // HTTP status code (response/error only)
  duration?: number;           // Request duration in ms (response/error only)
  requestBody?: any;           // Request payload (request only)
  responseBody?: any;          // Response data (response/error only)
  error?: string;              // Error message (error only)
}
```

## Examples

### Request Logging

```typescript
// Request is automatically logged
const response = await apiClient.post('/api/login', {
  email: 'user@example.com',
  password: 'secret123'
});

// Console output:
// → [API] POST /api/login
//    Request: { email: 'user@example.com', password: '[REDACTED]' }
```

### Response Logging

```typescript
// Response is automatically logged
const response = await apiClient.get('/api/users');

// Console output:
// ← [API] GET /api/users
//    Status: 200
//    Duration: 45ms
//    Response: { users: [...] }
```

### Error Logging

```typescript
// Error is automatically logged
try {
  await apiClient.get('/api/invalid');
} catch (error) {
  // Console output:
  // ✗ [API] GET /api/invalid
  //    Status: 404
  //    Duration: 23ms
  //    Error: Not Found
  //    Response: { error: 'Resource not found' }
}
```

## Sensitive Data Sanitization

The logger automatically redacts sensitive fields:

### Redacted Fields
- `password`
- `token`
- `accessToken`
- `refreshToken`
- `authorization`
- `creditCard`
- `cvv`
- `ssn`

### Example

```typescript
// Request with sensitive data
const response = await apiClient.post('/api/payment', {
  name: 'John Doe',
  creditCard: '4111111111111111',
  cvv: '123',
  amount: 99.99
});

// Console output:
// → [API] POST /api/payment
//    Request: {
//      name: 'John Doe',
//      creditCard: '[REDACTED]',
//      cvv: '[REDACTED]',
//      amount: 99.99
//    }
```

## Console Colors

The logger uses color-coded output for easy identification:

- **Purple** (→): Outgoing requests
- **Green** (←): Successful responses (2xx status)
- **Yellow** (←): Redirects (3xx status)
- **Orange** (←): Client errors (4xx status)
- **Red** (✗): Server errors (5xx status) or errors

## Log Management

### Get All Logs

```typescript
const logs = apiLogger.getLogs();
console.log(`Total logs: ${logs.length}`);
```

### Clear Logs

```typescript
apiLogger.clearLogs();
```

### Export Logs

```typescript
const jsonString = apiLogger.exportLogs();
// Save to file or send to server for analysis
```

### Print Summary

```typescript
apiLogger.printSummary();
// Output:
// === API Logger Summary ===
// Requests: 10
// Responses: 8
// Errors: 2
// Total: 20
```

## Development vs Production

### Development Mode

In development mode (`__DEV__ === true`), all logs are printed to console:

```typescript
// Development: Logs are printed
const response = await apiClient.get('/api/users');
// Console: → [API] GET /api/users
//          ← [API] GET /api/users
//             Status: 200
//             Duration: 45ms
```

### Production Mode

In production mode (`__DEV__ === false`), logging is disabled:

```typescript
// Production: No logs printed
const response = await apiClient.get('/api/users');
// Console: (no output)
```

## Performance Considerations

- **Memory**: Maintains up to 100 logs (configurable)
- **CPU**: Minimal overhead - only in development mode
- **Network**: No impact - logs are local only
- **Storage**: Logs are in-memory only (cleared on app restart)

## Debugging Tips

### Find Slow Requests

```typescript
const logs = apiLogger.getLogs();
const slowRequests = logs
  .filter(l => l.type === 'response' && l.duration > 1000)
  .sort((a, b) => (b.duration || 0) - (a.duration || 0));

console.log('Slow requests:', slowRequests);
```

### Find Failed Requests

```typescript
const logs = apiLogger.getLogs();
const errors = logs.filter(l => l.type === 'error');
console.log('Failed requests:', errors);
```

### Find Specific Endpoint

```typescript
const logs = apiLogger.getLogs();
const userLogs = logs.filter(l => l.url.includes('/users'));
console.log('User endpoint logs:', userLogs);
```

### Export for Analysis

```typescript
const logs = apiLogger.exportLogs();
// Copy to clipboard or save to file
console.log(logs);
```

## Troubleshooting

### Logs Not Appearing

1. Check if running in development mode (`__DEV__ === true`)
2. Check browser/device console settings
3. Verify API client is using the logger

### Sensitive Data Not Redacted

1. Check field name matches redaction list
2. Add custom field to sanitization list if needed
3. Verify data structure is correct

### Too Many Logs

1. Clear logs periodically: `apiLogger.clearLogs()`
2. Reduce log retention (modify `maxLogs` in logger.ts)
3. Filter logs before export

## API Reference

### `apiLogger.logRequest(config: AxiosRequestConfig)`

Logs an outgoing API request.

```typescript
apiLogger.logRequest({
  method: 'GET',
  url: '/api/users',
  headers: {}
});
```

### `apiLogger.logResponse(response: AxiosResponse)`

Logs a successful API response.

```typescript
apiLogger.logResponse(response);
```

### `apiLogger.logError(error: AxiosError)`

Logs an API error.

```typescript
apiLogger.logError(error);
```

### `apiLogger.getLogs(): LogEntry[]`

Returns all logged entries.

```typescript
const logs = apiLogger.getLogs();
```

### `apiLogger.clearLogs(): void`

Clears all logged entries.

```typescript
apiLogger.clearLogs();
```

### `apiLogger.exportLogs(): string`

Exports logs as JSON string.

```typescript
const json = apiLogger.exportLogs();
```

### `apiLogger.printSummary(): void`

Prints a summary of logs to console.

```typescript
apiLogger.printSummary();
```

## Best Practices

1. **Use in Development**: Only enable logging in development mode
2. **Monitor Performance**: Check for slow requests regularly
3. **Export Logs**: Export logs when debugging issues
4. **Clear Periodically**: Clear logs to prevent memory buildup
5. **Check Sanitization**: Verify sensitive data is redacted
6. **Use Filters**: Filter logs to find specific issues

## Integration with Error Tracking

You can integrate the logger with error tracking services:

```typescript
import { apiLogger } from '@/services/api/logger';
import * as Sentry from '@sentry/react-native';

// Export logs when error occurs
try {
  await apiClient.get('/api/data');
} catch (error) {
  const logs = apiLogger.exportLogs();
  Sentry.captureException(error, {
    contexts: {
      api: {
        logs: JSON.parse(logs)
      }
    }
  });
}
```

