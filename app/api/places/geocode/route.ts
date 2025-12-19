import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const MAPQUEST_API_KEY = process.env.MAPQUEST_API_KEY || 'YOUR_MAPQUEST_API_KEY';

// Validation schema pour géocodage
const geocodeSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

// POST /api/places/geocode - Géocoder une adresse en coordonnées
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = geocodeSchema.parse(body);
    
    // Utilisation de l'API MapQuest pour le géocodage
    const mapquestUrl = `https://www.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_API_KEY}&location=${encodeURIComponent(address)}`;
    
    const response = await fetch(mapquestUrl);
    
    if (!response.ok) {
      throw new Error(`MapQuest API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0 && data.results[0].locations && data.results[0].locations.length > 0) {
      const location = data.results[0].locations[0];
      
      const geocodeResult = {
        latitude: location.latLng.lat,
        longitude: location.latLng.lng,
        formattedAddress: location.displayName || address,
        placeId: location.placeId || null,
        provider: 'MapQuest'
      };
      
      return NextResponse.json(geocodeResult);
    } else {
      return NextResponse.json(
        { error: 'Address not found' },
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
    
    // Utilisation de l'API MapQuest pour le géocodage
    const mapquestUrl = `https://www.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_API_KEY}&location=${encodeURIComponent(address)}`;
    
    const response = await fetch(mapquestUrl);
    
    if (!response.ok) {
      throw new Error(`MapQuest API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0 && data.results[0].locations && data.results[0].locations.length > 0) {
      const location = data.results[0].locations[0];
      
      const geocodeResult = {
        latitude: location.latLng.lat,
        longitude: location.latLng.lng,
        formattedAddress: location.displayName || address,
        placeId: location.placeId || null,
        provider: 'MapQuest'
      };
      
      return NextResponse.json(geocodeResult);
    } else {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
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