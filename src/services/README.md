# Services

This directory contains service modules for external integrations and data management.

## SecureStorageService

Handles secure storage of authentication data using AsyncStorage with additional security measures.

### Features
- Secure token storage with automatic expiry checking
- Refresh token management
- Error handling with graceful degradation
- Multi-key atomic operations

### Usage
```typescript
import { SecureStorageService } from '../services/secureStorage';

// Store authentication data
await SecureStorageService.storeAuthData({
  token: 'access-token',
  refreshToken: 'refresh-token',
  user: userObject,
  expiresAt: Date.now() + 3600000
});

// Check if token is expired
const isExpired = await SecureStorageService.isTokenExpired();

// Clear all auth data
await SecureStorageService.clearAuthData();
```

## AuthApiService

Handles API calls related to authentication with automatic token refresh.

### Features
- Automatic token refresh on expiry
- Authenticated request wrapper
- Login/logout API integration
- Error handling for authentication failures

### Usage
```typescript
import { AuthApiService } from '../services/authApi';

// Login user
const loginResponse = await AuthApiService.login('email@example.com', 'password');

// Make authenticated request
const response = await AuthApiService.authenticatedRequest('/api/user/profile');

// Logout user
await AuthApiService.logout();
```

## AuthContext Integration

The AuthContext automatically uses these services to provide:

1. **Secure Session Management**: Tokens are stored securely and checked for expiry
2. **Automatic Token Refresh**: Expired tokens are refreshed automatically
3. **Session Restoration**: User sessions are restored on app restart
4. **Error Handling**: Authentication errors are handled gracefully

### Key Features
- Automatic token refresh 5 minutes before expiry
- Session restoration on app startup
- Secure token storage with AsyncStorage
- Error boundaries for authentication failures
- Logout with server-side token invalidation

### Usage in Components
```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login('email@example.com', 'password');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return isAuthenticated ? <AuthenticatedApp /> : <LoginScreen />;
};
```

## Security Considerations

1. **Token Storage**: Uses AsyncStorage which is secure on device but not encrypted
2. **Token Expiry**: Implements buffer time (5 minutes) before actual expiry
3. **Error Handling**: Fails securely - assumes expired on storage errors
4. **Logout**: Clears local data even if server logout fails
5. **Refresh Strategy**: Automatic refresh with fallback to re-authentication

## Environment Variables

Set the following environment variables for API integration:

```
API_BASE_URL=https://api.drivoo.com
```

## Testing

The services include comprehensive unit tests covering:
- Secure storage operations
- Token expiry checking
- Error handling scenarios
- Authentication flows

Run tests with:
```bash
npm test
```