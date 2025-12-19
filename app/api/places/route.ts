import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema pour création de place
const createPlaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  geofenceRadius: z.number().positive().optional(),
  placeType: z.enum(['FUEL_STATION', 'SERVICE_CENTER', 'OFFICE', 'CLIENT_SITE', 'HOME', 'GENERAL']).default('GENERAL'),
  companyId: z.string().optional(),
  isActive: z.boolean().default(true)
});

// GET /api/places - Liste paginée avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Filtres de recherche
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius'); // en kilomètres
    
    // Construire les filtres WHERE
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (type) {
      where.placeType = type;
    }
    
    if (active !== null && active !== undefined) {
      where.isActive = active === 'true';
    }
    
    // Filtre par proximité géographique
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusInKm = parseFloat(radius);
      
      // Calculer la distance approximative (formule haversine simplifiée)
      where.AND = [
        ...(where.AND || []),
        {
          latitude: {
            gte: lat - (radiusInKm / 111), // 1 degré ≈ 111 km
            lte: lat + (radiusInKm / 111)
          }
        },
        {
          longitude: {
            gte: lng - (radiusInKm / (111 * Math.cos(lat * Math.PI / 180))),
            lte: lng + (radiusInKm / (111 * Math.cos(lat * Math.PI / 180)))
          }
        }
      ];
    }
    
    // Récupérer les places avec pagination
    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },

      }),
      prisma.place.count({ where })
    ]);
    
    return NextResponse.json({
      places,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}

// POST /api/places - Création d'un nouveau lieu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = createPlaceSchema.parse(body);
    
    // Création du lieu
    const place = await prisma.place.create({
      data: validatedData,

    });
    
    return NextResponse.json(place, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'Failed to create place' },
      { status: 500 }
    );
  }
}