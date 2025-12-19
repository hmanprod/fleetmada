import { Place, PlaceSearchFilters, PlacesResponse, NearbyPlace, NearbyPlacesResponse } from '@/types/geolocation';
import { GeocodingService } from './geocoding-service';

export class PlacesApiService {
  /**
   * Récupérer la liste des lieux avec filtres et pagination
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
    
    const response = await fetch(`/api/places?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch places: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Récupérer un lieu par son ID
   */
  static async getPlace(id: string): Promise<Place> {
    const response = await fetch(`/api/places/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Place not found');
      }
      throw new Error(`Failed to fetch place: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Créer un nouveau lieu
   */
  static async createPlace(placeData: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> {
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(placeData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create place: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Mettre à jour un lieu
   */
  static async updatePlace(id: string, placeData: Partial<Place>): Promise<Place> {
    const response = await fetch(`/api/places/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(placeData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update place: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Supprimer un lieu
   */
  static async deletePlace(id: string): Promise<void> {
    const response = await fetch(`/api/places/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete place: ${response.status}`);
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
   * Rechercher des lieux proches
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
    
    const response = await fetch(`/api/places/nearby?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch nearby places: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Géocoder une adresse (sans créer de lieu)
   */
  static async geocodeAddress(address: string) {
    const params = new URLSearchParams({
      address: address,
    });
    
    const response = await fetch(`/api/places/geocode?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to geocode address: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Géocodage inverse (coordonnées → adresse)
   */
  static async reverseGeocode(latitude: number, longitude: number) {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
    });
    
    const response = await fetch(`/api/places/reverse-geocode?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to reverse geocode coordinates: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Vérifier si un point est dans le géofence d'un lieu
   */
  static async checkGeofence(placeId: string, latitude: number, longitude: number) {
    // Pour l'instant, cette fonctionnalité sera implémentée côté serveur
    // On peut utiliser la formule haversine pour calculer la distance
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
   * Rechercher des lieux par nom ou adresse
   */
  static async searchPlaces(query: string, limit: number = 10): Promise<Place[]> {
    const response = await this.getPlaces({
      search: query,
      limit
    });
    
    return response.places;
  }

  /**
   * Obtenir des statistiques sur les lieux
   */
  static async getPlacesStats() {
    const response = await fetch('/api/places/stats');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch places stats: ${response.status}`);
    }
    
    return await response.json();
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