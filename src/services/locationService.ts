import {
  Linking,
  Platform,
} from 'react-native';
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions';

import { Coordenadas } from '../types';

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'restricted' | 'undetermined';
}

export interface LocationServiceResult {
  success: boolean;
  coordenadas?: Coordenadas;
  error?: string;
  permissionStatus?: LocationPermissionStatus;
}

interface CurrentLocationOptions {
  requestPermission?: boolean;
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}

interface GeolocationCoordinatesShape {
  latitude: number;
  longitude: number;
}

interface GeolocationPositionShape {
  coords: GeolocationCoordinatesShape;
}

interface GeolocationPositionErrorShape {
  code: number;
  message: string;
}

interface GeolocationApiShape {
  getCurrentPosition: (
    success: (position: GeolocationPositionShape) => void,
    error?: (error: GeolocationPositionErrorShape) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    },
  ) => void;
}

const DEFAULT_PERMISSION_STATUS: LocationPermissionStatus = {
  granted: false,
  canAskAgain: true,
  status: 'undetermined',
};

export class LocationService {
  private static instance: LocationService;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check current location permission without prompting when possible.
   */
  async checkLocationPermission(): Promise<LocationPermissionStatus> {
    this.log('checkLocationPermission:start', { platform: Platform.OS });

    try {
      const permission = this.getLocationPermissionKey();

      if (!permission) {
        const unavailableStatus = {
          granted: false,
          canAskAgain: false,
          status: 'restricted',
        } satisfies LocationPermissionStatus;

        this.warn('checkLocationPermission:unsupported-platform', unavailableStatus);
        return unavailableStatus;
      }

      const nativeStatus = await check(permission);
      const mappedStatus = this.mapNativePermissionStatus(nativeStatus);

      this.log('checkLocationPermission:result', {
        permission,
        nativeStatus,
        mappedStatus,
      });
      return mappedStatus;
    } catch {
      const fallbackStatus = DEFAULT_PERMISSION_STATUS;

      this.warn('checkLocationPermission:error', fallbackStatus);
      return fallbackStatus;
    }
  }

  /**
   * Request location permission from the user.
   */
  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    this.log('requestLocationPermission:start', { platform: Platform.OS });

    try {
      const permission = this.getLocationPermissionKey();

      if (!permission) {
        const unavailableStatus = {
          granted: false,
          canAskAgain: false,
          status: 'restricted',
        } satisfies LocationPermissionStatus;

        this.warn('requestLocationPermission:unsupported-platform', unavailableStatus);
        return unavailableStatus;
      }

      const currentStatus = await this.checkLocationPermission();

      if (currentStatus.granted || !currentStatus.canAskAgain) {
        this.log('requestLocationPermission:short-circuit', currentStatus);
        return currentStatus;
      }

      const nativeStatus = await request(permission);
      const mappedStatus = this.mapNativePermissionStatus(nativeStatus);

      this.log('requestLocationPermission:result', {
        permission,
        nativeStatus,
        mappedStatus,
      });
      return mappedStatus;
    } catch {
      const errorStatus: LocationPermissionStatus = {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };

      this.warn('requestLocationPermission:error', errorStatus);
      return errorStatus;
    }
  }

  async ensureLocationPermission(): Promise<LocationPermissionStatus> {
    this.log('ensureLocationPermission:start');

    const currentStatus = await this.checkLocationPermission();

    if (currentStatus.granted) {
      this.log('ensureLocationPermission:already-granted', currentStatus);
      return currentStatus;
    }

    if (!currentStatus.canAskAgain) {
      this.warn('ensureLocationPermission:blocked', currentStatus);
      return currentStatus;
    }

    const requestedStatus = await this.requestLocationPermission();
    this.log('ensureLocationPermission:requested-result', requestedStatus);
    return requestedStatus;
  }

  /**
   * Get current user location.
   */
  async getCurrentLocation(
    options: CurrentLocationOptions = {},
  ): Promise<LocationServiceResult> {
    const {
      requestPermission = true,
      timeout = 15000,
      maximumAge = 300000,
      enableHighAccuracy = true,
    } = options;

    this.log('getCurrentLocation:start', {
      requestPermission,
      timeout,
      maximumAge,
      enableHighAccuracy,
      platform: Platform.OS,
    });

    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const permission = requestPermission
          ? await this.requestLocationPermission()
          : await this.checkLocationPermission();

        if (!permission.granted && permission.status !== 'undetermined') {
          const deniedResult = {
            success: false,
            error: permission.canAskAgain
              ? 'Permissão de localização não concedida.'
              : 'Permissão de localização negada permanentemente. Abra os ajustes do app para permitir.',
            permissionStatus: permission,
          };

          this.warn('getCurrentLocation:permission-denied', deniedResult);
          return deniedResult;
        }
      }

      const geolocation = this.getGeolocationApi();

      if (!geolocation) {
        const unavailableResult = {
          success: false,
          error: 'Geolocalização não está disponível neste dispositivo.',
        };

        this.warn('getCurrentLocation:geolocation-unavailable', unavailableResult);
        return unavailableResult;
      }

      const coordenadas = await new Promise<Coordenadas>((resolve, reject) => {
        geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy,
            timeout,
            maximumAge,
          },
        );
      });

      const successResult: LocationServiceResult = {
        success: true,
        coordenadas,
        permissionStatus: {
          granted: true,
          canAskAgain: true,
          status: 'granted',
        },
      };

      this.log('getCurrentLocation:success', successResult);
      return successResult;
    } catch (error) {
      const permissionStatus = this.getPermissionStatusFromError(error);
      const failureResult = {
        success: false,
        error: this.getLocationErrorMessage(error),
        permissionStatus,
      };

      this.warn('getCurrentLocation:error', {
        ...failureResult,
        rawError: this.serializeError(error),
      });
      return failureResult;
    }
  }

  async openAppSettings(): Promise<void> {
    this.log('openAppSettings:start');
    await Linking.openSettings();
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(coord1: Coordenadas, coord2: Coordenadas): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * 
      Math.cos(this.toRadians(coord2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async getAddressFromCoordinates(_coordenadas: Coordenadas): Promise<string> {
    // In a real implementation, this would use a geocoding service
    // For now, we'll return a mock address
    return 'São Paulo, SP';
  }

  /**
   * Get coordinates from address (geocoding)
   */
  async getCoordinatesFromAddress(_address: string): Promise<LocationServiceResult> {
    // In a real implementation, this would use a geocoding service
    // For now, we'll return mock coordinates for São Paulo
    const mockLocation: Coordenadas = {
      latitude: -23.5505,
      longitude: -46.6333,
    };

    return {
      success: true,
      coordenadas: mockLocation,
    };
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private getGeolocationApi(): GeolocationApiShape | null {
    const maybeNavigator = globalThis.navigator as
      | { geolocation?: GeolocationApiShape }
      | undefined;

    return maybeNavigator?.geolocation ?? null;
  }

  private getLocationPermissionKey(): Permission | null {
    if (Platform.OS === 'android') {
      return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }

    if (Platform.OS === 'ios') {
      return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    }

    return null;
  }

  private mapNativePermissionStatus(
    status: PermissionStatus,
  ): LocationPermissionStatus {
    switch (status) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        return {
          granted: true,
          canAskAgain: true,
          status: 'granted',
        };
      case RESULTS.DENIED:
        return {
          granted: false,
          canAskAgain: true,
          status: 'undetermined',
        };
      case RESULTS.BLOCKED:
        return {
          granted: false,
          canAskAgain: false,
          status: 'denied',
        };
      case RESULTS.UNAVAILABLE:
        return {
          granted: false,
          canAskAgain: false,
          status: 'restricted',
        };
      default:
        return DEFAULT_PERMISSION_STATUS;
    }
  }

  private getLocationErrorMessage(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'number'
    ) {
      switch (error.code) {
        case 1:
          return 'Permissão de localização negada.';
        case 2:
          return 'Não foi possível determinar sua localização atual.';
        case 3:
          return 'A localização demorou demais para ser obtida. Tente novamente.';
        default:
          break;
      }
    }

    return 'Erro ao obter localização atual.';
  }

  private getPermissionStatusFromError(
    error: unknown,
  ): LocationPermissionStatus | undefined {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'number' &&
      error.code === 1
    ) {
      return {
        granted: false,
        canAskAgain: Platform.OS !== 'ios',
        status: 'denied',
      };
    }

    return undefined;
  }

  private log(message: string, payload?: unknown): void {
    if (!__DEV__) {
      return;
    }

    console.log(`[LocationService] ${message}`, payload ?? '');
  }

  private warn(message: string, payload?: unknown): void {
    if (!__DEV__) {
      return;
    }

    console.warn(`[LocationService] ${message}`, payload ?? '');
  }

  private serializeError(error: unknown): unknown {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (typeof error === 'object' && error !== null) {
      return error;
    }

    return { value: error };
  }
}

export const locationService = LocationService.getInstance();
