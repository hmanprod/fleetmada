import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Validation schema pour géocodage inverse
const reverseGeocodeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

// POST /api/places/reverse-geocode - Géocodage inverse (coordonnées → adresse)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude } = reverseGeocodeSchema.parse(body);

    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(googleUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];

      const getComponent = (type: string) => {
        const comp = result.address_components.find((c: any) => c.types.includes(type));
        return comp ? comp.long_name : '';
      };

      const addressResult = {
        formattedAddress: result.formatted_address,
        street: getComponent('route'),
        city: getComponent('locality') || getComponent('administrative_area_level_2'),
        state: getComponent('administrative_area_level_1'),
        postalCode: getComponent('postal_code'),
        country: getComponent('country'),
        latitude: latitude,
        longitude: longitude,
        provider: 'Google'
      };

      return NextResponse.json(addressResult);
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

    console.error('Reverse geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to reverse geocode coordinates' },
      { status: 500 }
    );
  }
}

// GET /api/places/reverse-geocode?lat=...&lng=... - Géocodage inverse via URL params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng parameters are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(googleUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];

      const getComponent = (type: string) => {
        const comp = result.address_components.find((c: any) => c.types.includes(type));
        return comp ? comp.long_name : '';
      };

      const addressResult = {
        formattedAddress: result.formatted_address,
        street: getComponent('route'),
        city: getComponent('locality') || getComponent('administrative_area_level_2'),
        state: getComponent('administrative_area_level_1'),
        postalCode: getComponent('postal_code'),
        country: getComponent('country'),
        latitude: latitude,
        longitude: longitude,
        provider: 'Google'
      };

      return NextResponse.json(addressResult);
    } else {
      return NextResponse.json(
        { error: data.error_message || `Google Maps error: ${data.status}` },
        { status: data.status === 'ZERO_RESULTS' ? 404 : 500 }
      );
    }

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to reverse geocode coordinates' },
      { status: 500 }
    );
  }
}