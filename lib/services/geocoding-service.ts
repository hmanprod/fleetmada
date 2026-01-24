import { GeocodeResult, AddressResult, Coordinates } from '@/types/geolocation';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';

export class GeocodingService {
  /**
   * Géocoder une adresse en coordonnées (Google Maps)
   */
  static async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          provider: 'Google'
        };
      } else {
        throw new Error(data.error_message || `Google Maps error: ${data.status}`);
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
      if (!this.validateCoordinates(latitude, longitude)) {
        throw new Error('Invalid coordinates');
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];

        // Extraction des composants d'adresse
        const getComponent = (type: string) => {
          const comp = result.address_components.find((c: any) => c.types.includes(type));
          return comp ? comp.long_name : '';
        };

        return {
          formattedAddress: result.formatted_address,
          street: getComponent('route'),
          city: getComponent('locality') || getComponent('administrative_area_level_2'),
          state: getComponent('administrative_area_level_1'),
          postalCode: getComponent('postal_code'),
          country: getComponent('country'),
          latitude,
          longitude,
          provider: 'Google'
        };
      } else {
        throw new Error(data.error_message || `Google Maps error: ${data.status}`);
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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this environment'));
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
   * Rechercher des sites opérationnels proches (via API interne)
   */
  static async searchNearby(
    latitude: number,
    longitude: number,
    radiusInKm: number = 10,
    placeTypes?: string[]
  ): Promise<any[]> {
    try {
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
   * Générer une URL Google Maps
   */
  static generateMapUrl(coordinates: Coordinates, zoom: number = 15): string {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
  }

  /**
   * Générer une URL pour directions vers une destination (Google Maps)
   */
  static generateDirectionsUrl(from: Coordinates, to: Coordinates): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&travelmode=driving`;
  }
}