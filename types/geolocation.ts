// Types pour la géolocalisation et les places
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId?: string;
  provider: string;
}

export interface AddressResult {
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  provider: string;
}

export enum PlaceType {
  FUEL_STATION = 'FUEL_STATION',
  SERVICE_CENTER = 'SERVICE_CENTER',
  OFFICE = 'OFFICE',
  CLIENT_SITE = 'CLIENT_SITE',
  HOME = 'HOME',
  GENERAL = 'GENERAL'
}

export interface Place {
  id: string;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number;
  placeType: PlaceType;
  companyId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relations (optionnelles)
  _count?: {
    fuelEntries: number;
    serviceEntries: number;
    contacts: number;
  };
}

export interface PlaceSearchFilters {
  search?: string;
  type?: PlaceType;
  active?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number; // rayon en kilomètres
  page?: number;
  limit?: number;
}

export interface NearbyPlace extends Place {
  distance: number; // distance en kilomètres
}

export interface PlacesResponse {
  places: Place[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NearbyPlacesResponse {
  center: Coordinates;
  radius: number;
  totalFound: number;
  places: NearbyPlace[];
}

export interface GeofenceCheckResult {
  isInside: boolean;
  distance: number;
  place: Place;
}

export interface PlaceAnalytics {
  totalPlaces: number;
  placesByType: Record<PlaceType, number>;
  activePlaces: number;
  inactivePlaces: number;
  placesWithCoordinates: number;
  placesWithGeofence: number;
}

// Types pour les événements de géofencing
export interface GeofenceEvent {
  id: string;
  placeId: string;
  vehicleId?: string;
  eventType: 'ENTRY' | 'EXIT';
  timestamp: Date;
  coordinates: Coordinates;
}

// Types pour les alertes de géofencing
export interface GeofenceAlert {
  id: string;
  placeId: string;
  userId: string;
  alertType: 'ENTRY' | 'EXIT' | 'PROXIMITY';
  isActive: boolean;
  radius?: number; // rayon personnalisé pour l'alerte
  createdAt: Date;
}