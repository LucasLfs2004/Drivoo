import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorageService, StoredAuthData } from '../src/services/secureStorage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  multiRemove: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('SecureStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAuthData: StoredAuthData = {
    token: 'access-token-123',
    refreshToken: 'refresh-token-456',
    sessionEmail: 'test@example.com',
    user: {
      id: '1',
      email: 'test@example.com',
      telefone: '(11) 99999-9999',
      papel: 'aluno',
      perfil: {
        primeiroNome: 'João',
        ultimoNome: 'Silva',
        dataNascimento: new Date('1990-01-01'),
        endereco: {
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000',
          pais: 'BR',
        },
        cnh: {
          categoria: 'B',
          status: 'nenhuma',
        },
        preferencias: {
          localizacao: { latitude: -23.5505, longitude: -46.6333 },
          raio: 10,
        },
      },
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    expiresAt: Date.now() + 3600000, // 1 hour from now
  };

  describe('storeAuthData', () => {
    it('should store all auth data correctly', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await SecureStorageService.storeAuthData(mockAuthData);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(4);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_token', mockAuthData.token);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('refresh_token', mockAuthData.refreshToken);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify({
          user: mockAuthData.user,
          sessionEmail: mockAuthData.sessionEmail,
        })
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('token_expiry', mockAuthData.expiresAt.toString());
    });

    it('should throw error when storage fails', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(SecureStorageService.storeAuthData(mockAuthData)).rejects.toThrow('Failed to store authentication data');
    });
  });

  describe('getAuthData', () => {
    it('should retrieve and parse auth data correctly', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(mockAuthData.token)
        .mockResolvedValueOnce(mockAuthData.refreshToken)
        .mockResolvedValueOnce(
          JSON.stringify({
            user: mockAuthData.user,
            sessionEmail: mockAuthData.sessionEmail,
          })
        )
        .mockResolvedValueOnce(mockAuthData.expiresAt.toString());

      const result = await SecureStorageService.getAuthData();

      expect(result).toMatchObject({
        token: mockAuthData.token,
        refreshToken: mockAuthData.refreshToken,
        sessionEmail: mockAuthData.sessionEmail,
        expiresAt: mockAuthData.expiresAt,
        user: expect.objectContaining({
          id: mockAuthData.user?.id,
          email: mockAuthData.user?.email,
          telefone: mockAuthData.user?.telefone,
          papel: mockAuthData.user?.papel,
        }),
      });
    });

    it('should return null when any required data is missing', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // token missing
        .mockResolvedValueOnce(mockAuthData.refreshToken)
        .mockResolvedValueOnce(
          JSON.stringify({
            user: mockAuthData.user,
            sessionEmail: mockAuthData.sessionEmail,
          })
        )
        .mockResolvedValueOnce(mockAuthData.expiresAt.toString());

      const result = await SecureStorageService.getAuthData();

      expect(result).toBeNull();
    });

    it('should return null when storage access fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await SecureStorageService.getAuthData();

      expect(result).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', async () => {
      const futureExpiry = Date.now() + 3600000; // 1 hour from now
      mockAsyncStorage.getItem.mockResolvedValue(futureExpiry.toString());

      const result = await SecureStorageService.isTokenExpired();

      expect(result).toBe(false);
    });

    it('should return true for expired token', async () => {
      const pastExpiry = Date.now() - 3600000; // 1 hour ago
      mockAsyncStorage.getItem.mockResolvedValue(pastExpiry.toString());

      const result = await SecureStorageService.isTokenExpired();

      expect(result).toBe(true);
    });

    it('should return true when expiry data is missing', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await SecureStorageService.isTokenExpired();

      expect(result).toBe(true);
    });

    it('should return true when storage access fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await SecureStorageService.isTokenExpired();

      expect(result).toBe(true);
    });
  });

  describe('clearAuthData', () => {
    it('should remove all auth-related keys', async () => {
      mockAsyncStorage.multiRemove.mockResolvedValue();

      await SecureStorageService.clearAuthData();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'auth_token',
        'refresh_token',
        'user_data',
        'token_expiry',
      ]);
    });

    it('should not throw when storage removal fails', async () => {
      mockAsyncStorage.multiRemove.mockRejectedValue(new Error('Storage error'));

      await expect(SecureStorageService.clearAuthData()).resolves.not.toThrow();
    });
  });

  describe('updateTokens', () => {
    it('should update tokens and expiry', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();
      const newToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';
      const newExpiry = Date.now() + 7200000; // 2 hours from now

      await SecureStorageService.updateTokens(newToken, newRefreshToken, newExpiry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(3);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_token', newToken);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('refresh_token', newRefreshToken);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('token_expiry', newExpiry.toString());
    });

    it('should throw error when update fails', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(SecureStorageService.updateTokens('token', 'refresh', 123456)).rejects.toThrow('Failed to update tokens');
    });
  });
});
