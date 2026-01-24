import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Validation schema pour géocodage
const geocodeSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

// POST /api/places/geocode - Géocoder une adresse en coordonnées
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = geocodeSchema.parse(body);

    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(googleUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;

      const geocodeResult = {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        provider: 'Google'
      };

      return NextResponse.json(geocodeResult);
    } else {
      return NextResponse.json(
        { error: data.error_message || `Google Maps error: ${data.status}` },
        { status: data.status === 'ZERO_RESULTS' ? 404 : 500 }
      );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}

// GET /api/places/geocode?address=... - Géocodage via URL params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(googleUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;

      const geocodeResult = {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        provider: 'Google'
      };

      return NextResponse.json(geocodeResult);
    } else {
      return NextResponse.json(
        { error: data.error_message || `Google Maps error: ${data.status}` },
        { status: data.status === 'ZERO_RESULTS' ? 404 : 500 }
      );
    }

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}