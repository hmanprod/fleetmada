# Architecture et Diagrammes - FleetMada

## 1. Architecture générale

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Components (Next.js 14)                           │   │
│  │  - Pages (app/(auth), app/(main))                        │   │
│  │  - Components (Forms, Tables, Charts)                   │   │
│  │  - Hooks (useVehicles, useServices, etc.)               │   │
│  │  - Context (AuthContext)                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Services (lib/services/*)                           │   │
│  │  - VehiclesAPI, ServiceAPI, InspectionsAPI, etc.        │   │
│  │  - GeocodingService, NotificationService                │   │
│  │  - ReportGenerator, ReminderGenerator                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js Middleware (middleware.ts)                      │   │
│  │  - JWT Token Validation                                  │   │
│  │  - Route Protection                                      │   │
│  │  - Blacklist Checking                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js API Routes (app/api/*)                          │   │
│  │  - Authentication (login, register, logout)             │   │
│  │  - CRUD Operations (vehicles, services, etc.)           │   │
│  │  - Business Logic                                        │   │
│  │  - Data Validation (Zod)                                │   │
│  │  - Error Handling                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services (lib/services/*)                               │   │
│  │  - ReminderGenerator                                     │   │
│  │  - NotificationService                                   │   │
│  │  - ReportGenerator                                       │   │
│  │  - GeocodingService                                      │   │
│  │  - ExportService                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Prisma ORM (lib/prisma.ts)                              │   │
│  │  - Query Builder                                         │   │
│  │  - Migrations                                            │   │
│  │  - Type Safety                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                     │   │
│  │  - 20+ Tables                                            │   │
│  │  - Relationships & Constraints                           │   │
│  │  - Indexes & Performance                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Flux de données

```
User Action (Click, Submit)
    ↓
React Component State Update
    ↓
API Service Call (fetch)
    ↓
HTTP Request with JWT Token
    ↓
Middleware Validation
    ├─ Token Valid? → Continue
    └─ Token Invalid? → 401 Unauthorized
    ↓
API Route Handler
    ├─ Validate Input (Zod)
    ├─ Check Permissions
    ├─ Execute Business Logic
    └─ Call Prisma ORM
    ↓
Database Query
    ├─ SELECT, INSERT, UPDATE, DELETE
    └─ Return Results
    ↓
API Response (JSON)
    ↓
Component Receives Data
    ├─ Update State
    ├─ Re-render UI
    └─ Show Success/Error Message
```

---

## 3. Modèle de données (Entités principales)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
│  - id, name, email, password, role                              │
│  - companyId, avatar, createdAt, updatedAt                      │
│  ↓ Relations: Vehicles, Services, Inspections, Issues, etc.     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       VEHICLE                                    │
│  - id, name, vin, type, year, make, model, status              │
│  - meterReading, licensePlate, image, userId                   │
│  - Specs: Engine, Transmission, Dimensions, Weight, etc.       │
│  ↓ Relations: Services, Inspections, Issues, Fuel, Charging    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  SERVICE ENTRY   │ │  INSPECTION      │ │  ISSUE           │
│  - date, status  │ │  - status        │ │  - summary       │
│  - totalCost     │ │  - score         │ │  - priority      │
│  - vendor        │ │  - compliance    │ │  - status        │
│  ↓ Relations:    │ │  ↓ Relations:    │ │  ↓ Relations:    │
│  - Tasks         │ │  - Template      │ │  - Comments      │
│  - Parts         │ │  - Results       │ │  - Images        │
│  - Reminders     │ │  - Photos        │ │  - Watchers      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        ↓                   ↓                   ↓
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  FUEL ENTRY      │ │  CHARGING ENTRY  │ │  EXPENSE ENTRY   │
│  - volume        │ │  - energyKwh     │ │  - type          │
│  - cost          │ │  - cost          │ │  - amount        │
│  - mpg           │ │  - durationMin   │ │  - vendor        │
│  - vendor        │ │  - vendor        │ │  - source        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 4. Flux d'authentification

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                                    │
└─────────────────────────────────────────────────────────────────┘

User Input (email, password)
    ↓
POST /api/auth/login
    ↓
Validate Input (Zod)
    ├─ Email format valid?
    └─ Password not empty?
    ↓
Find User in Database
    ├─ User exists?
    └─ Password matches (bcrypt)?
    ↓
Generate JWT Token
    ├─ Payload: { userId, email, role }
    ├─ Secret: JWT_SECRET
    └─ Expiration: 24h
    ↓
Return Token to Client
    ↓
Store Token in localStorage
    ↓
Set Authorization Header
    ├─ Authorization: Bearer <token>
    └─ Used for all subsequent requests
    ↓
Redirect to Dashboard
    ↓
Middleware Validates Token
    ├─ Token present?
    ├─ Token valid?
    ├─ Token not blacklisted?
    └─ Continue or 401 Unauthorized
```

---

## 5. Flux de service et maintenance

```
┌─────────────────────────────────────────────────────────────────┐
│              SERVICE REGISTRATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

Technician Input
    ├─ Select Vehicle
    ├─ Enter Date
    ├─ Add Tasks
    ├─ Add Parts
    └─ Enter Costs
    ↓
POST /api/service/entries
    ↓
Validate Data
    ├─ Vehicle exists?
    ├─ Date valid?
    ├─ Tasks exist?
    └─ Costs positive?
    ↓
Create ServiceEntry
    ├─ Save to database
    ├─ Create ServiceTaskEntry records
    └─ Create ServiceEntryPart records
    ↓
Calculate Costs
    ├─ Labor cost
    ├─ Parts cost
    ├─ Apply taxes
    ├─ Apply discounts
    └─ Total cost
    ↓
Generate Reminder
    ├─ Get service task
    ├─ Calculate next due date
    ├─ Create ServiceReminder
    └─ Set status to ACTIVE
    ↓
Send Notification
    ├─ Create Notification record
    └─ Notify user
    ↓
Return Success Response
```

---

## 6. Flux de rappels et notifications

```
┌─────────────────────────────────────────────────────────────────┐
│           REMINDER & NOTIFICATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

Scheduled Job (Cron)
    ↓
ReminderGenerator.generateAllReminders()
    ├─ generateFromServicePrograms()
    ├─ generateFromLastServiceEntries()
    └─ generateVehicleRenewals()
    ↓
For Each Reminder
    ├─ Check if nextDue <= today
    ├─ Check if status = ACTIVE
    └─ Create ServiceReminder record
    ↓
NotificationService.checkOverdueReminders()
    ├─ Find reminders with nextDue < today
    ├─ Check if notification already sent (24h)
    └─ Create Notification record
    ↓
NotificationService.checkOverdueRenewals()
    ├─ Find renewals with dueDate < today
    ├─ Check if notification already sent (24h)
    └─ Create Notification record
    ↓
User Receives Notification
    ├─ In-app notification
    ├─ Email (optional)
    └─ Push notification (optional)
    ↓
User Actions
    ├─ Mark as read
    ├─ Snooze (report)
    ├─ Complete
    └─ Dismiss
```

---

## 7. Flux de génération de rapports

```
┌─────────────────────────────────────────────────────────────────┐
│            REPORT GENERATION FLOW                                │
└─────────────────────────────────────────────────────────────────┘

User Selects Template
    ├─ Vehicle Cost Comparison
    ├─ Service History
    ├─ Fuel Consumption
    ├─ Inspection Results
    └─ ... (30+ templates)
    ↓
Define Filters
    ├─ Date range
    ├─ Vehicles
    ├─ Categories
    └─ Other criteria
    ↓
POST /api/reports/generate
    ↓
ReportGeneratorService.generateReport()
    ├─ Validate config
    ├─ Find template
    ├─ Get data for template
    ├─ Transform data
    ├─ Generate charts
    ├─ Generate tables
    └─ Generate summary
    ↓
Query Database
    ├─ Vehicles
    ├─ Services
    ├─ Fuel entries
    ├─ Expenses
    └─ Other data
    ↓
Process Data
    ├─ Aggregate
    ├─ Calculate totals
    ├─ Calculate averages
    └─ Format for display
    ↓
Generate Visualizations
    ├─ Bar charts
    ├─ Line charts
    ├─ Pie charts
    └─ Tables
    ↓
Return Report Data
    ↓
Display in UI
    ├─ Charts
    ├─ Tables
    └─ Summary
    ↓
User Actions
    ├─ Export to PDF
    ├─ Export to Excel
    ├─ Share
    └─ Schedule
```

---

## 8. Intégrations externes

```
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL INTEGRATIONS                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  GOOGLE MAPS API                                             │
│  ├─ Geocoding (Address → Coordinates)                        │
│  ├─ Reverse Geocoding (Coordinates → Address)                │
│  ├─ Distance Calculation                                     │
│  ├─ Geofence Detection                                       │
│  └─ Map Display                                              │
│  Used in: Places, Fuel Entries, Service Locations            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  AUTHENTICATION (JWT)                                        │
│  ├─ Token Generation                                         │
│  ├─ Token Validation                                         │
│  ├─ Token Blacklist                                          │
│  └─ Session Management                                       │
│  Used in: All API Routes                                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  FUTURE INTEGRATIONS                                         │
│  ├─ Google Calendar (Inspection Scheduling)                  │
│  ├─ Slack (Notifications)                                    │
│  ├─ Microsoft Teams (Notifications)                          │
│  ├─ Email (Notifications, Reports)                           │
│  ├─ SMS (Alerts)                                             │
│  ├─ GPS Tracking (Real-time Location)                        │
│  ├─ Accounting Software (Expense Sync)                       │
│  └─ Fuel Card Systems (Fuel Data)                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Déploiement et infrastructure

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  DEVELOPMENT                                                 │
│  ├─ Local Machine                                            │
│  ├─ npm run dev                                              │
│  ├─ Docker Compose (PostgreSQL)                              │
│  └─ Hot Reload                                               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  VERSION CONTROL                                             │
│  ├─ Git Repository                                           │
│  ├─ GitHub/GitLab                                            │
│  └─ Branch Strategy (main, develop, feature/*)               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  CI/CD PIPELINE                                              │
│  ├─ GitHub Actions / GitLab CI                               │
│  ├─ Run Tests                                                │
│  ├─ Build Docker Image                                       │
│  ├─ Push to Registry                                         │
│  └─ Deploy to Staging                                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  STAGING ENVIRONMENT                                         │
│  ├─ Test Deployment                                          │
│  ├─ Run E2E Tests                                            │
│  ├─ Performance Testing                                      │
│  └─ Manual QA                                                │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  PRODUCTION DEPLOYMENT                                       │
│  ├─ Docker Container                                         │
│  ├─ Kubernetes / Docker Swarm                                │
│  ├─ Load Balancer                                            │
│  ├─ PostgreSQL Database                                      │
│  ├─ Redis Cache (optional)                                   │
│  ├─ CDN for Static Assets                                    │
│  └─ SSL/TLS Certificate                                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  MONITORING & LOGGING                                        │
│  ├─ Application Logs                                         │
│  ├─ Error Tracking (Sentry)                                  │
│  ├─ Performance Monitoring (DataDog)                         │
│  ├─ Uptime Monitoring                                        │
│  └─ Alerts & Notifications                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Sécurité

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  NETWORK SECURITY                                            │
│  ├─ HTTPS/TLS Encryption                                     │
│  ├─ SSL Certificate                                          │
│  ├─ Firewall Rules                                           │
│  └─ DDoS Protection                                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  APPLICATION SECURITY                                        │
│  ├─ JWT Token Validation                                     │
│  ├─ Input Validation (Zod)                                   │
│  ├─ SQL Injection Prevention (Prisma)                        │
│  ├─ CSRF Protection                                          │
│  ├─ XSS Prevention                                           │
│  └─ Rate Limiting                                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  DATA SECURITY                                               │
│  ├─ Password Hashing (bcryptjs)                              │
│  ├─ Data Encryption (optional)                               │
│  ├─ Secure Storage                                           │
│  ├─ Backup & Recovery                                        │
│  └─ Data Retention Policy                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ACCESS CONTROL                                              │
│  ├─ Authentication (JWT)                                     │
│  ├─ Authorization (Roles)                                    │
│  ├─ Token Blacklist                                          │
│  ├─ Session Management                                       │
│  └─ IP Whitelist (optional)                                  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  COMPLIANCE                                                  │
│  ├─ RGPD Compliance                                          │
│  ├─ Data Privacy                                             │
│  ├─ Audit Trail                                              │
│  └─ Legal Requirements                                       │
└──────────────────────────────────────────────────────────────┘
```

---

**Document généré le**: 2024
**Version**: 1.0
**Statut**: Complet
