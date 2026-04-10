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
}

export class LocationService {
  private static instance: LocationService;
  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permission from the user
   */
  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    return {
      granted: false,
      canAskAgain: true,
      status: 'undetermined',
    };
  }

  /**
   * Get current user location
   */
  async getCurrentLocation(): Promise<LocationServiceResult> {
    return {
      success: false,
      error:
        'A implementação de geolocalização deste branch foi removida. Use a nova integração de localização da main.',
    };
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
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async getAddressFromCoordinates(_coordenadas: Coordenadas): Promise<string> {
    try {
      // In a real implementation, this would use a geocoding service
      // For now, we'll return a mock address
      return 'São Paulo, SP';
    } catch (_error) {
      return 'Localização desconhecida';
    }
  }

  /**
   * Get coordinates from address (geocoding)
   */
  async getCoordinatesFromAddress(
    _address: string,
  ): Promise<LocationServiceResult> {
    return {
      success: false,
      error: 'Geocodificação por endereço ainda não está disponível.',
    };
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const locationService = LocationService.getInstance();
