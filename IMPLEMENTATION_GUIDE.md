# Guide d'implémentation - FleetMada

## 1. Architecture de l'application

### 1.1 Structure des dossiers

```
fleetmada/
├── app/
│   ├── (auth)/                    # Routes d'authentification
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── layout.tsx
│   ├── (main)/                    # Routes principales
│   │   ├── dashboard/page.tsx
│   │   ├── vehicles/
│   │   │   ├── page.tsx           # Liste
│   │   │   ├── [id]/page.tsx      # Détails
│   │   │   ├── add/page.tsx       # Création
│   │   │   └── [id]/edit/page.tsx # Modification
│   │   ├── service/
│   │   ├── inspections/
│   │   ├── issues/
│   │   ├── fuel/
│   │   ├── contacts/
│   │   ├── vendors/
│   │   ├── parts/
│   │   ├── places/
│   │   ├── documents/
│   │   ├── reports/
│   │   ├── reminders/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── check-blacklist/route.ts
│   │   ├── vehicles/
│   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   └── [id]/route.ts      # GET, PUT, DELETE
│   │   ├── service/
│   │   ├── inspections/
│   │   ├── issues/
│   │   ├── fuel/
│   │   ├── charging/
│   │   ├── contacts/
│   │   ├── vendors/
│   │   ├── parts/
│   │   ├── places/
│   │   ├── documents/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── dashboard/
│   │   ├── settings/
│   │   └── onboarding/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── forms/
│   │   │   ├── VehicleForm.tsx
│   │   │   ├── ServiceForm.tsx
│   │   │   ├── InspectionForm.tsx
│   │   │   └── ...
│   │   ├── tables/
│   │   │   ├── VehiclesTable.tsx
│   │   │   ├── ServicesTable.tsx
│   │   │   └── ...
│   │   ├── charts/
│   │   │   ├── CostChart.tsx
│   │   │   ├── ConsumptionChart.tsx
│   │   │   └── ...
│   │   ├── modals/
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── FilterModal.tsx
│   │   │   └── ...
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       └── ...
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx
├── lib/
│   ├── services/
│   │   ├── vehicles-api.ts
│   │   ├── service-api.ts
│   │   ├── inspections-api.ts
│   │   ├── issues-api.ts
│   │   ├── fuel-api.ts
│   │   ├── charging-api.ts
│   │   ├── contacts-api.ts
│   │   ├── vendors-api.ts
│   │   ├── parts-api.ts
│   │   ├── places-api.ts
│   │   ├── documents-api.ts
│   │   ├── geocoding-service.ts
│   │   ├── notification-service.ts
│   │   ├── report-generator.ts
│   │   ├── reminder-generator.ts
│   │   └── export-service.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useVehicles.ts
│   │   ├── useServices.ts
│   │   ├── useInspections.ts
│   │   ├── useIssues.ts
│   │   ├── useFuel.ts
│   │   ├── useContacts.ts
│   │   ├── useVendors.ts
│   │   ├── useParts.ts
│   │   ├── usePlaces.ts
│   │   ├── useDocuments.ts
│   │   ├── useReports.ts
│   │   ├── useNotifications.ts
│   │   └── useSettings.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── geolocation.ts
│   │   ├── reports.ts
│   │   └── ...
│   ├── validations/
│   │   ├── vehicle-validations.ts
│   │   ├── service-validations.ts
│   │   ├── inspection-validations.ts
│   │   └── ...
│   ├── auth-context.tsx
│   ├── auth-api.ts
│   ├── api-utils.ts
│   └── prisma.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed-setup.ts
│   └── seed-dev.ts
├── public/
│   ├── img/
│   │   └── logo.png
│   └── ...
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── vehicles.spec.ts
│   │   ├── services.spec.ts
│   │   └── ...
│   └── unit/
│       ├── services/
│       └── utils/
├── middleware.ts
├── types.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── playwright.config.ts
└── docker-compose.yml
```

### 1.2 Flux de données

```
User Input
    ↓
React Component
    ↓
API Service (lib/services/*)
    ↓
API Route (app/api/*/route.ts)
    ↓
Middleware (JWT validation)
    ↓
Business Logic
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Response → Component → UI Update
```

---

## 2. Patterns et conventions

### 2.1 Nommage des fichiers
- **Pages**: `page.tsx` (Next.js convention)
- **Routes API**: `route.ts` (Next.js convention)
- **Composants**: `PascalCase.tsx` (ex: `VehicleForm.tsx`)
- **Hooks**: `useXxx.ts` (ex: `useVehicles.ts`)
- **Services**: `xxx-api.ts` ou `xxx-service.ts`
- **Types**: `xxx.ts` ou `index.ts`
- **Validations**: `xxx-validations.ts`

### 2.2 Structure des composants

```typescript
// Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

// Types
interface Props {
  id?: string
  onSuccess?: () => void
}

// Component
export default function VehicleForm({ id, onSuccess }: Props) {
  // State
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hooks
  const router = useRouter()
  const { user } = useAuth()

  // Effects
  useEffect(() => {
    if (id) {
      loadVehicle()
    }
  }, [id])

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Logic
  }

  // Render
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### 2.3 Structure des services API

```typescript
// lib/services/vehicles-api.ts
import { Vehicle } from '@/types'

export class VehiclesAPI {
  static async getAll(filters?: any): Promise<Vehicle[]> {
    const response = await fetch('/api/vehicles', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch vehicles')
    return response.json()
  }

  static async getById(id: string): Promise<Vehicle> {
    const response = await fetch(`/api/vehicles/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch vehicle')
    return response.json()
  }

  static async create(data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await fetch('/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create vehicle')
    return response.json()
  }

  static async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await fetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update vehicle')
    return response.json()
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`/api/vehicles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to delete vehicle')
  }
}
```

### 2.4 Structure des routes API

```typescript
// app/api/vehicles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-api'

// GET /api/vehicles
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { userId: user.id }
    })

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/vehicles
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const data = await request.json()

    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        userId: user.id
      }
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2.5 Structure des hooks

```typescript
// lib/hooks/useVehicles.ts
import { useState, useEffect } from 'react'
import { VehiclesAPI } from '@/lib/services/vehicles-api'
import { Vehicle } from '@/types'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const data = await VehiclesAPI.getAll()
      setVehicles(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createVehicle = async (data: Partial<Vehicle>) => {
    try {
      const vehicle = await VehiclesAPI.create(data)
      setVehicles([...vehicles, vehicle])
      return vehicle
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    try {
      const vehicle = await VehiclesAPI.update(id, data)
      setVehicles(vehicles.map(v => v.id === id ? vehicle : v))
      return vehicle
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const deleteVehicle = async (id: string) => {
    try {
      await VehiclesAPI.delete(id)
      setVehicles(vehicles.filter(v => v.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  return {
    vehicles,
    loading,
    error,
    loadVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
}
```

---

## 3. Checklist de développement

### 3.1 Authentification
- [ ] Implémentation du login
- [ ] Implémentation du register
- [ ] Génération et validation JWT
- [ ] Blacklist de tokens
- [ ] Middleware de protection
- [ ] Contexte d'authentification React

### 3.2 Gestion des véhicules
- [ ] CRUD complet
- [ ] Validation des données
- [ ] Historique des compteurs
- [ ] Assignation d'opérateurs
- [ ] Filtrage et recherche
- [ ] Export de liste

### 3.3 Gestion des services
- [ ] CRUD des entrées de service
- [ ] Gestion des tâches
- [ ] Gestion des pièces
- [ ] Calcul des coûts
- [ ] Génération de rappels
- [ ] Historique par véhicule

### 3.4 Gestion des inspections
- [ ] CRUD des templates
- [ ] Programmation automatique
- [ ] Exécution des inspections
- [ ] Calcul de conformité
- [ ] Génération de rapports
- [ ] Attachement de photos

### 3.5 Gestion des problèmes
- [ ] CRUD des problèmes
- [ ] Assignation et suivi
- [ ] Commentaires et discussions
- [ ] Attachement d'images
- [ ] Notifications aux watchers

### 3.6 Notifications et rappels
- [ ] Génération automatique
- [ ] Envoi de notifications
- [ ] Marquage comme lues
- [ ] Nettoyage automatique

### 3.7 Rapports
- [ ] Implémentation des templates
- [ ] Génération de rapports
- [ ] Export en PDF
- [ ] Partage de rapports
- [ ] Programmation récurrente

### 3.8 Paramètres
- [ ] Préférences utilisateur
- [ ] Paramètres d'entreprise
- [ ] Paramètres de sécurité
- [ ] Gestion des intégrations

### 3.9 Tests
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests E2E
- [ ] Tests de performance

### 3.10 Déploiement
- [ ] Configuration Docker
- [ ] Configuration CI/CD
- [ ] Monitoring et logging
- [ ] Backup et récupération

---

## 4. Commandes utiles

```bash
# Installation
npm install

# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Base de données
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:reset

# Docker
npm run docker:up
npm run docker:down
npm run docker:restart

# Tests
npm run test:e2e
npm run test:build

# Linting
npm run lint
npm run type-check
```

---

## 5. Variables d'environnement

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/fleetmada

# Authentification
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=24h

# Google Maps
GOOGLE_MAPS_API_KEY=your_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_public_api_key

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

**Document généré le**: 2024
**Version**: 1.0
**Statut**: Complet
