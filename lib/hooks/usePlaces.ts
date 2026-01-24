import { useState, useEffect, useCallback } from 'react';
import { Place, PlaceSearchFilters, PlacesResponse, NearbyPlace, NearbyPlacesResponse } from '@/types/geolocation';
import { PlacesApiService } from '@/lib/services/places-api';
import { GeocodingService } from '@/lib/services/geocoding-service';

// Hook principal pour la gestion des places
export function usePlaces(filters: PlaceSearchFilters = {}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // We use stringify to have a stable dependency for useCallback even if the object is recreated
  const filterKey = JSON.stringify(filters);

  const fetchPlaces = useCallback(async (newFilters?: PlaceSearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const currentFilters = newFilters || JSON.parse(filterKey);
      const response: PlacesResponse = await PlacesApiService.getPlaces(currentFilters);

      setPlaces(response.places);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const refresh = useCallback(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const updateFilters = useCallback((newFilters: PlaceSearchFilters) => {
    fetchPlaces(newFilters);
  }, [fetchPlaces]);

  return {
    places,
    loading,
    error,
    pagination,
    refresh,
    updateFilters
  };
}

// Hook pour récupérer un lieu spécifique
export function usePlace(id: string | null) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlace = useCallback(async () => {
    if (!id) {
      setPlace(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const placeData = await PlacesApiService.getPlace(id);
      setPlace(placeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch place');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlace();
  }, [fetchPlace]);

  const refresh = useCallback(() => {
    fetchPlace();
  }, [fetchPlace]);

  return { place, loading, error, refresh };
}

// Hook pour créer un nouveau lieu
export function useCreatePlace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlace = useCallback(async (placeData: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      const newPlace = await PlacesApiService.createPlace(placeData);
      return newPlace;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create place';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPlace, loading, error };
}

// Hook pour créer un lieu à partir d'une adresse (avec géocodage automatique)
export function useCreatePlaceFromAddress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlaceFromAddress = useCallback(async (placeData: {
    name: string;
    description?: string;
    address: string;
    geofenceRadius?: number;
    placeType?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const newPlace = await PlacesApiService.createPlaceFromAddress(placeData);
      return newPlace;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create place from address';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPlaceFromAddress, loading, error };
}

// Hook pour mettre à jour un lieu
export function useUpdatePlace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePlace = useCallback(async (id: string, placeData: Partial<Place>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedPlace = await PlacesApiService.updatePlace(id, placeData);
      return updatedPlace;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update place';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { updatePlace, loading, error };
}

// Hook pour supprimer un lieu
export function useDeletePlace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePlace = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await PlacesApiService.deletePlace(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete place';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { deletePlace, loading, error };
}

// Hook pour les sites opérationnels proches
export function useNearbyPlaces() {
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<{
    center?: { latitude: number; longitude: number };
    radius?: number;
    placeType?: string;
    totalFound?: number;
  }>({});

  const searchNearby = useCallback(async (
    latitude: number,
    longitude: number,
    radiusInKm: number = 10,
    placeType?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response: NearbyPlacesResponse = await PlacesApiService.getNearbyPlaces(
        latitude,
        longitude,
        radiusInKm,
        placeType
      );

      setNearbyPlaces(response.places);
      setSearchParams({
        center: { latitude, longitude },
        radius: radiusInKm,
        placeType,
        totalFound: response.totalFound
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search nearby places');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setNearbyPlaces([]);
    setSearchParams({});
  }, []);

  return {
    nearbyPlaces,
    loading,
    error,
    searchParams,
    searchNearby,
    clearResults
  };
}

// Hook pour le géocodage d'adresse
export function useGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await PlacesApiService.geocodeAddress(address);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to geocode address';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { geocodeAddress, loading, error };
}

// Hook pour le géocodage inverse
export function useReverseGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await PlacesApiService.reverseGeocode(latitude, longitude);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reverse geocode coordinates';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { reverseGeocode, loading, error };
}

// Hook pour la position actuelle
export function useCurrentPosition() {
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const coords = await GeocodingService.getCurrentPosition();
      setPosition(coords);
      return coords;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current position';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { position, loading, error, getCurrentPosition };
}

// Hook pour la recherche de sites opérationnels
export function usePlaceSearch() {
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (query: string, limit: number = 10) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const places = await PlacesApiService.searchPlaces(query, limit);
      setResults(places);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search places');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchPlaces,
    clearResults
  };
}