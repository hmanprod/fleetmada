import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema pour mise à jour de place
const updatePlaceSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  geofenceRadius: z.number().positive().optional(),
  placeType: z.enum(['FUEL_STATION', 'SERVICE_CENTER', 'OFFICE', 'CLIENT_SITE', 'HOME', 'GENERAL']).optional(),
  companyId: z.string().optional(),
  isActive: z.boolean().optional()
});

// GET /api/places/[id] - Récupérer un lieu spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const place = await prisma.place.findUnique({
      where: { id }
    });
    
    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(place);
    
  } catch (error) {
    console.error('Error fetching place:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place' },
      { status: 500 }
    );
  }
}

// PUT /api/places/[id] - Modifier un lieu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validation des données
    const validatedData = updatePlaceSchema.parse(body);
    
    // Vérifier si le lieu existe
    const existingPlace = await prisma.place.findUnique({
      where: { id }
    });
    
    if (!existingPlace) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }
    
    // Mise à jour du lieu
    const place = await prisma.place.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(place);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating place:', error);
    return NextResponse.json(
      { error: 'Failed to update place' },
      { status: 500 }
    );
  }
}

// DELETE /api/places/[id] - Supprimer un lieu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Vérifier si le lieu existe
    const existingPlace = await prisma.place.findUnique({
      where: { id }
    });
    
    if (!existingPlace) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }
    
    // Suppression du lieu
    await prisma.place.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Place deleted successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { error: 'Failed to delete place' },
      { status: 500 }
    );
  }
}