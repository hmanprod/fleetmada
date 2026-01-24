import { Place, PlaceSearchFilters, PlacesResponse, NearbyPlace, NearbyPlacesResponse } from '@/types/geolocation';
import { GeocodingService } from './geocoding-service';

// Fonction utilitaire pour récupérer le token d'authentification
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem('authToken') ||
    document.cookie.match(/authToken=([^;]*)/)?.[1] ||
    null
}

export class PlacesApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
      throw new Error(error.message || error.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Récupérer la liste des sites opérationnels avec filtres et pagination
   */
  static async getPlaces(filters: PlaceSearchFilters = {}): Promise<PlacesResponse> {
    const params = new URLSearchParams();

    // Ajouter les paramètres de recherche
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.latitude && filters.longitude && filters.radius) {
      params.append('latitude', filters.latitude.toString());
      params.append('longitude', filters.longitude.toString());
      params.append('radius', filters.radius.toString());
    }

    // Paramètres de pagination
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());

    return this.request<PlacesResponse>(`/api/places?${params}`);
  }

  /**
   * Récupérer un lieu par son ID
   */
  static async getPlace(id: string): Promise<Place> {
    return this.request<Place>(`/api/places/${id}`);
  }

  /**
   * Créer un nouveau lieu
   */
  static async createPlace(placeData: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> {
    return this.request<Place>('/api/places', {
      method: 'POST',
      body: JSON.stringify(placeData),
    });
  }

  /**
   * Mettre à jour un lieu
   */
  static async updatePlace(id: string, placeData: Partial<Place>): Promise<Place> {
    return this.request<Place>(`/api/places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(placeData),
    });
  }

  /**
   * Supprimer un lieu
   */
  static async deletePlace(id: string): Promise<void> {
    const token = getAuthToken();
    const response = await fetch(`/api/places/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
      throw new Error(error.message || error.error || `Delete failed with status ${response.status}`);
    }
  }

  /**
   * Géocoder une adresse et créer un lieu automatiquement
   */
  static async createPlaceFromAddress(placeData: {
    name: string;
    description?: string;
    address: string;
    geofenceRadius?: number;
    placeType?: string;
  }): Promise<Place> {
    try {
      // Géocoder l'adresse
      const geocodeResult = await GeocodingService.geocodeAddress(placeData.address);

      // Créer le lieu avec les coordonnées
      const fullPlaceData = {
        ...placeData,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        address: geocodeResult.formattedAddress,
        placeType: (placeData.placeType as any) || 'GENERAL',
        isActive: true,
      };

      return await this.createPlace(fullPlaceData);

    } catch (error) {
      throw new Error(`Failed to geocode address or create place: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rechercher des sites opérationnels proches
   */
  static async getNearbyPlaces(
    latitude: number,
    longitude: number,
    radiusInKm: number = 10,
    placeType?: string
  ): Promise<NearbyPlacesResponse> {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radiusInKm.toString(),
    });

    if (placeType) {
      params.append('type', placeType);
    }

    return this.request<NearbyPlacesResponse>(`/api/places/nearby?${params}`);
  }

  /**
   * Géocoder une adresse (sans créer de lieu)
   */
  static async geocodeAddress(address: string) {
    const params = new URLSearchParams({
      address: address,
    });

    return this.request(`/api/places/geocode?${params}`);
  }

  /**
   * Géocodage inverse (coordonnées → adresse)
   */
  static async reverseGeocode(latitude: number, longitude: number) {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
    });

    return this.request(`/api/places/reverse-geocode?${params}`);
  }

  /**
   * Vérifier si un point est dans le géofence d'un lieu
   */
  static async checkGeofence(placeId: string, latitude: number, longitude: number) {
    const place = await this.getPlace(placeId);

    if (!place.latitude || !place.longitude || !place.geofenceRadius) {
      throw new Error('Place does not have valid geofence configuration');
    }

    const distance = GeocodingService.calculateDistance(
      { latitude, longitude },
      { latitude: place.latitude, longitude: place.longitude }
    );

    return {
      isInside: distance <= (place.geofenceRadius / 1000), // Conversion mètres vers km
      distance: distance,
      place: place
    };
  }

  /**
   * Rechercher des sites opérationnels par nom ou adresse
   */
  static async searchPlaces(query: string, limit: number = 10): Promise<Place[]> {
    const response = await this.getPlaces({
      search: query,
      limit
    });

    return response.places;
  }

  /**
   * Obtenir des statistiques sur les sites opérationnels
   */
  static async getPlacesStats() {
    return this.request('/api/places/stats');
  }

  /**
   * Valider les données d'un lieu
   */
  static validatePlaceData(data: Partial<Place>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim() === '') {
      errors.push('Name is required');
    }

    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      errors.push('Longitude must be between -180 and 180');
    }

    if (data.geofenceRadius !== undefined && data.geofenceRadius <= 0) {
      errors.push('Geofence radius must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formater un lieu pour l'affichage
   */
  static formatPlaceForDisplay(place: Place): {
    title: string;
    subtitle?: string;
    coordinates?: string;
  } {
    const title = place.name;
    const subtitle = place.description || place.address;
    const coordinates = place.latitude && place.longitude
      ? `${place.latitude.toFixed(6)}, ${place.longitude.toFixed(6)}`
      : undefined;

    return { title, subtitle, coordinates };
  }
}