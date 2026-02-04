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
    try {
      // In a real implementation, this would use react-native-permissions
      // For now, we'll simulate permission being granted
      return {
        granted: true,
        canAskAgain: true,
        status: 'granted',
      };
    } catch (_error) {
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  /**
   * Get current user location
   */
  async getCurrentLocation(): Promise<LocationServiceResult> {
    try {
      const permission = await this.requestLocationPermission();
      
      if (!permission.granted) {
        return {
          success: false,
          error: 'Permissão de localização negada',
        };
      }

      // In a real implementation, this would use Geolocation API
      // For now, we'll return a mock location in São Paulo
      const mockLocation: Coordenadas = {
        latitude: -23.5505,  // São Paulo center
        longitude: -46.6333,
      };

      return {
        success: true,
        coordenadas: mockLocation,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Erro ao obter localização',
      };
    }
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
  async getCoordinatesFromAddress(_address: string): Promise<LocationServiceResult> {
    try {
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
    } catch (_error) {
      return {
        success: false,
        error: 'Erro ao buscar coordenadas do endereço',
      };
    }
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const locationService = LocationService.getInstance();