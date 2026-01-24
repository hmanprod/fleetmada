import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema pour recherche de proximité
const nearbyPlacesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().default(10), // rayon en kilomètres
  placeType: z.enum(['FUEL_STATION', 'SERVICE_CENTER', 'OFFICE', 'CLIENT_SITE', 'HOME', 'GENERAL']).optional(),
  limit: z.number().positive().max(50).default(20)
});

// Fonction pour calculer la distance entre deux points (formule haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// POST /api/places/nearby - Trouver les sites opérationnels proches
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, radius, placeType, limit } = nearbyPlacesSchema.parse(body);

    // Récupérer tous les sites opérationnels avec coordonnées
    const places = await prisma.place.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        isActive: true,
        ...(placeType && { placeType })
      }
    });

    // Calculer les distances et filtrer
    const nearbyPlaces = places
      .map(place => ({
        ...place,
        distance: calculateDistance(latitude, longitude, place.latitude!, place.longitude!)
      }))
      .filter(place => place.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json({
      center: { latitude, longitude },
      radius,
      totalFound: nearbyPlaces.length,
      places: nearbyPlaces
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error finding nearby places:', error);
    return NextResponse.json(
      { error: 'Failed to find nearby places' },
      { status: 500 }
    );
  }
}

// GET /api/places/nearby?lat=...&lng=...&radius=... - Recherche de proximité via URL params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') || '20';

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng parameters are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = parseFloat(radius || '10');
    const limitNum = parseInt(limit);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInKm) || isNaN(limitNum)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Récupérer tous les sites opérationnels avec coordonnées
    const places = await prisma.place.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        isActive: true,
        ...(type && { placeType: type as any })
      }
    });

    // Calculer les distances et filtrer
    const nearbyPlaces = places
      .map(place => ({
        ...place,
        distance: calculateDistance(latitude, longitude, place.latitude!, place.longitude!)
      }))
      .filter(place => place.distance <= radiusInKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limitNum);

    return NextResponse.json({
      center: { latitude, longitude },
      radius: radiusInKm,
      totalFound: nearbyPlaces.length,
      places: nearbyPlaces
    });

  } catch (error) {
    console.error('Error finding nearby places:', error);
    return NextResponse.json(
      { error: 'Failed to find nearby places' },
      { status: 500 }
    );
  }
}