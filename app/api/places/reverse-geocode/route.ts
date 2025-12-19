import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const MAPQUEST_API_KEY = process.env.MAPQUEST_API_KEY || 'YOUR_MAPQUEST_API_KEY';

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
    
    // Utilisation de l'API MapQuest pour le géocodage inverse
    const mapquestUrl = `https://www.mapquestapi.com/geocoding/v1/reverse?key=${MAPQUEST_API_KEY}&location=${longitude},${latitude}`;
    
    const response = await fetch(mapquestUrl);
    
    if (!response.ok) {
      throw new Error(`MapQuest API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0 && data.results[0].locations && data.results[0].locations.length > 0) {
      const location = data.results[0].locations[0];
      
      const addressResult = {
        formattedAddress: location.displayName || '',
        street: location.street || '',
        city: location.adminArea5 || '',
        state: location.adminArea3 || '',
        postalCode: location.postalCode || '',
        country: location.adminArea1 || '',
        latitude: latitude,
        longitude: longitude,
        provider: 'MapQuest'
      };
      
      return NextResponse.json(addressResult);
    } else {
      return NextResponse.json(
        { error: 'No address found for these coordinates' },
        { status: 404 }
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
    
    // Utilisation de l'API MapQuest pour le géocodage inverse
    const mapquestUrl = `https://www.mapquestapi.com/geocoding/v1/reverse?key=${MAPQUEST_API_KEY}&location=${longitude},${latitude}`;
    
    const response = await fetch(mapquestUrl);
    
    if (!response.ok) {
      throw new Error(`MapQuest API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0 && data.results[0].locations && data.results[0].locations.length > 0) {
      const location = data.results[0].locations[0];
      
      const addressResult = {
        formattedAddress: location.displayName || '',
        street: location.street || '',
        city: location.adminArea5 || '',
        state: location.adminArea3 || '',
        postalCode: location.postalCode || '',
        country: location.adminArea1 || '',
        latitude: latitude,
        longitude: longitude,
        provider: 'MapQuest'
      };
      
      return NextResponse.json(addressResult);
    } else {
      return NextResponse.json(
        { error: 'No address found for these coordinates' },
        { status: 404 }
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