import { GeocodeResult, AddressResult, Coordinates } from '@/types/geolocation';

const MAPQUEST_API_KEY = process.env.MAPQUEST_API_KEY || 'YOUR_MAPQUEST_API_KEY';
const MAPQUEST_BASE_URL = 'https://www.mapquestapi.com/geocoding/v1';

export class GeocodingService {
  /**
   * Géocoder une adresse en coordonnées
   */
  static async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      const url = `${MAPQUEST_BASE_URL}/address?key=${MAPQUEST_API_KEY}&location=${encodeURIComponent(address)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`MapQuest API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0 && data.results[0].locations && data.results[0].locations.length > 0) {
        const location = data.results[0].locations[0];
        
        return {
          latitude: location.latLng.lat,
          longitude: location.latLng.lng,
          formattedAddress: location.displayName || address,
          placeId: location.placeId || undefined,
          provider: 'MapQuest'
        };
      } else {
        throw new Error('Address not found');
      }
      
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Géocodage inverse (coordonnées → adresse)
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<AddressResult> {
    try {
      // Validation des coordonnées
      if (latitude < -90 || latitude > 90) {
        throw new Error('Invalid latitude. Must be between -90 and 90');
      }
      if (longitude < -180 || longitude > 180) {
        throw new Error('Invalid longitude. Must be between -180 and 180');
      }

      const url = `${MAPQUEST_BASE_URL}/reverse?key=${MAPQUEST_API_KEY}&location=${longitude},${latitude}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`MapQuest API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0 && data.results[0].locations && data.results[0].locations.length > 0) {
        const location = data.results[0].locations[0];
        
        return {
          formattedAddress: location.displayName || '',
          street: location.street || '',
          city: location.adminArea5 || '',
          state: location.adminArea3 || '',
          postalCode: location.postalCode || '',
          country: location.adminArea1 || '',
          latitude,
          longitude,
          provider: 'MapQuest'
        };
      } else {
        throw new Error('No address found for these coordinates');
      }
      
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error(`Failed to reverse geocode coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Valider des coordonnées
   */
  static validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Calculer la distance entre deux points (formule haversine)
   */
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Vérifier si un point est dans un rayon donné
   */
  static isWithinRadius(point: Coordinates, center: Coordinates, radiusInKm: number): boolean {
    const distance = this.calculateDistance(point, center);
    return distance <= radiusInKm;
  }

  /**
   * Obtenir la position actuelle de l'utilisateur (si autorisée)
   */
  static async getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let errorMessage = 'Failed to get current position';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for Geolocation';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Rechercher des lieux proches (pour utilisation côté client)
   */
  static async searchNearby(
    latitude: number, 
    longitude: number, 
    radiusInKm: number = 10,
    placeTypes?: string[]
  ): Promise<any[]> {
    try {
      // Cette fonction sera utilisée côté client pour appeler l'API /api/places/nearby
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: radiusInKm.toString(),
        ...(placeTypes && { type: placeTypes.join(',') })
      });

      const response = await fetch(`/api/places/nearby?${params}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Nearby search error:', error);
      throw new Error(`Failed to search nearby places: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Formatage d'adresse pour affichage
   */
  static formatAddress(address: AddressResult): string {
    const parts = [address.street, address.city, address.state, address.postalCode, address.country];
    return parts.filter(part => part && part.trim()).join(', ');
  }

  /**
   * Générer une URL pour afficher une localisation sur une carte
   */
  static generateMapUrl(coordinates: Coordinates, zoom: number = 14): string {
    return `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=${zoom}/${coordinates.latitude}/${coordinates.longitude}`;
  }

  /**
   * Générer une URL pour directions vers une destination
   */
  static generateDirectionsUrl(from: Coordinates, to: Coordinates): string {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${from.latitude}%2C${from.longitude}%3B${to.latitude}%2C${to.longitude}`;
  }
}