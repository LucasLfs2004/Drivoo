# Error Handling Components

This document describes the error handling components and hooks available in the Drivoo application.

## Components

### ErrorAlert

A component for displaying API errors with retry and dismiss actions.

#### Props

```typescript
interface ErrorAlertProps {
  message: string;           // Error message to display
  title?: string;            // Optional error title
  onDismiss?: () => void;    // Callback when dismiss button is pressed
  onRetry?: () => void;      // Callback when retry button is pressed
  retryLabel?: string;       // Custom retry button label (default: "Tentar Novamente")
  dismissLabel?: string;     // Custom dismiss button label (default: "Descartar")
  style?: ViewStyle;         // Custom container style
  showIcon?: boolean;        // Show error icon (default: true)
}
```

#### Usage

```typescript
import { ErrorAlert } from '@/components/common';

<ErrorAlert
  title="Erro de Conexão"
  message="Falha ao conectar com o servidor. Tente novamente."
  onRetry={() => refetchData()}
  onDismiss={() => setShowError(false)}
/>
```

#### Features

- Displays error message with optional title
- Shows error icon (AlertCircle from lucide-react-native)
- Supports retry and dismiss actions
- Customizable button labels
- Responsive design with proper spacing
- Left border accent in error color

---

### ErrorBoundary

A React error boundary component that catches errors in child components and displays a fallback UI.

#### Props

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: (error: Error, retry: () => void) => ReactElement;
}
```

#### Usage

```typescript
import { ErrorBoundary } from '@/components/common';

<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Error caught:', error);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

#### Features

- Catches errors in child components
- Displays default error UI or custom fallback
- Provides retry functionality
- Shows debug information in development mode
- Logs errors to console for debugging
- Prevents app crash from component errors

#### Default Error UI

The default error UI includes:
- Error title: "Algo deu errado"
- Error description with helpful message
- Retry button to recover from error
- Debug information (development mode only)

#### Custom Fallback

```typescript
<ErrorBoundary
  fallback={(error, retry) => (
    <View>
      <Text>Custom error: {error.message}</Text>
      <Button onPress={retry} title="Retry" />
    </View>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

---

## Hooks

### useApiError

A hook for managing API errors with automatic retry functionality.

#### Return Type

```typescript
interface UseApiErrorReturn {
  // State
  error: ApiError | null;
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;

  // Actions
  setError: (error: ApiError | null) => void;
  clearError: () => void;
  retry: (fn: () => Promise<void>) => Promise<void>;
  canRetry: () => boolean;
}
```

#### Usage

```typescript
import { useApiError } from '@/hooks';

const { error, isRetrying, canRetry, retry, clearError } = useApiError(3);

const fetchData = async () => {
  try {
    const response = await apiClient.get('/data');
    return response.data;
  } catch (err) {
    const apiError = handleApiError(err);
    setError(apiError);
  }
};

// Retry with exponential backoff
if (canRetry()) {
  await retry(fetchData);
}
```

#### Features

- Manages API error state
- Tracks retry count and max retries
- Implements exponential backoff (1s, 2s, 4s, etc.)
- Automatically clears error on successful retry
- Determines if error is retryable
- Supports custom max retries

#### Retryable Errors

The following errors are considered retryable:
- Network errors (type: 'network')
- Server errors (5xx status codes)
- Rate limit errors (429)
- Request timeout errors (408)

#### Non-Retryable Errors

The following errors are NOT retryable:
- Validation errors (422, 400)
- Authentication errors (401, 403)
- Not found errors (404)

---

## API Error Handler

The `handleApiError` function from `src/services/api/errorHandler.ts` provides consistent error mapping.

### Error Types

```typescript
type ApiErrorType = 'network' | 'server' | 'validation' | 'auth' | 'unknown';

interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  type: ApiErrorType;
  details?: Record<string, any>;
  originalError?: Error;
}
```

### Error Mapping

| Status Code | Type | Message |
|-------------|------|---------|
| 0 (no response) | network | Erro de conexão. Verifique sua internet e tente novamente. |
| 400 | validation | Dados de entrada inválidos. Verifique os campos. |
| 401 | auth | Sessão expirada. Faça login novamente. |
| 403 | auth | Você não tem permissão para acessar este recurso. |
| 404 | server | Recurso não encontrado. |
| 422 | validation | Dados de entrada inválidos. Verifique os campos. |
| 5xx | server | Erro no servidor. Tente novamente mais tarde. |

---

## Complete Example

```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import { ErrorAlert, ErrorBoundary } from '@/components/common';
import { Button, Typography } from '@/components/common';
import { useApiError } from '@/hooks';
import { handleApiError } from '@/services/api/errorHandler';
import apiClient from '@/services/api/client';

export const DataScreen: React.FC = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { error, isRetrying, canRetry, retry, setError, clearError } =
    useApiError(3);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/data');
      setData(response.data);
      clearError();
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    await retry(fetchData);
  };

  return (
    <ErrorBoundary>
      <View>
        {error && (
          <ErrorAlert
            title="Erro ao Carregar Dados"
            message={error.message}
            onRetry={canRetry() ? handleRetry : undefined}
            onDismiss={clearError}
          />
        )}

        {data && (
          <View>
            <Typography variant="body">{JSON.stringify(data)}</Typography>
          </View>
        )}

        <Button
          title="Carregar Dados"
          onPress={fetchData}
          loading={isLoading || isRetrying}
          disabled={isLoading || isRetrying}
        />
      </View>
    </ErrorBoundary>
  );
};
```

---

## Best Practices

1. **Always wrap API calls with error handling**
   - Use `handleApiError` to map errors consistently
   - Set error state for user feedback

2. **Use ErrorBoundary at screen level**
   - Wrap entire screens to catch unexpected errors
   - Prevents app crash from component errors

3. **Provide meaningful error messages**
   - Use user-friendly messages from `handleApiError`
   - Avoid technical jargon

4. **Implement retry for network errors**
   - Use `useApiError` hook for automatic retry
   - Show retry button to user

5. **Clear errors appropriately**
   - Clear error when user dismisses alert
   - Clear error on successful retry
   - Clear error when navigating away

6. **Log errors for debugging**
   - Use `onError` callback in ErrorBoundary
   - Send errors to error tracking service
   - Include error context for debugging

---

## Testing

### Testing ErrorAlert

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorAlert } from '@/components/common';

test('should call onRetry when retry button is pressed', () => {
  const onRetry = jest.fn();
  render(
    <ErrorAlert
      message="Error"
      onRetry={onRetry}
      retryLabel="Retry"
    />
  );

  fireEvent.press(screen.getByText('Retry'));
  expect(onRetry).toHaveBeenCalled();
});
```

### Testing ErrorBoundary

```typescript
import { render, screen } from '@testing-library/react-native';
import { ErrorBoundary } from '@/components/common';

test('should render error UI when error is thrown', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Algo deu errado')).toBeTruthy();
});
```

### Testing useApiError

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useApiError } from '@/hooks';

test('should retry with exponential backoff', async () => {
  const { result } = renderHook(() => useApiError());
  const mockFn = jest.fn().mockResolvedValue(undefined);

  act(() => {
    result.current.setError({
      code: 'NETWORK_ERROR',
      message: 'Network error',
      statusCode: 0,
      type: 'network',
    });
  });

  await act(async () => {
    await result.current.retry(mockFn);
  });

  expect(mockFn).toHaveBeenCalled();
});
```

---

## Troubleshooting

### ErrorBoundary not catching errors

- ErrorBoundary only catches errors in render methods
- Event handlers need try-catch blocks
- Async errors need to be caught separately

### Retry not working

- Check if error is retryable using `canRetry()`
- Verify error type is in retryable list
- Check max retries not exceeded

### Error message not displaying

- Verify error object has `message` property
- Check ErrorAlert is rendered conditionally
- Verify error state is being set correctly

---

## Related Files

- `src/services/api/errorHandler.ts` - Error mapping and utilities
- `src/services/api/client.ts` - Axios client with error interceptors
- `src/components/common/ErrorAlert.tsx` - Error alert component
- `src/components/common/ErrorBoundary.tsx` - Error boundary component
- `src/hooks/useApiError.ts` - Error management hook
