export interface Vehicle {
  id: string;
  name: string;
  vin: string;
  type: string;
  year: number;
  make: string;
  model: string;
  status: 'Active' | 'Inactive' | 'In Shop';
  image?: string;
  meterReading?: number;
}

export interface InspectionItem {
  id: string;
  label: string;
  type: 'pass_fail' | 'text' | 'number' | 'meter' | 'dropdown' | 'photo';
  required: boolean;
  description?: string;
}

export interface InspectionForm {
  id: string;
  title: string;
  items: InspectionItem[];
  vehicleCount: number;
}

export enum ViewState {
  LOGIN,
  REGISTER,
  ONBOARDING,
  DASHBOARD,
  VEHICLES_LIST,
  ADD_VEHICLE,
  VEHICLE_ASSIGNMENTS,
  METER_HISTORY,
  REPLACEMENT_ANALYSIS,
  INSPECTIONS_LIST,
  INSPECTION_BUILDER,
  ISSUES_LIST,
  ADD_ISSUE,
  ISSUE_DETAILS,
  // Service
  SERVICE_HISTORY,
  ADD_SERVICE_ENTRY,
  WORK_ORDERS,
  ADD_WORK_ORDER,
  SERVICE_TASKS,
  ADD_SERVICE_TASK,
  SERVICE_PROGRAMS,
  ADD_SERVICE_PROGRAM,
  SERVICE_PROGRAM_DETAIL,
  // Reminders
  SERVICE_REMINDERS,
  ADD_SERVICE_REMINDER,
  VEHICLE_RENEWALS,
  ADD_VEHICLE_RENEWAL,
  CONTACT_RENEWALS,
  // Contacts
  CONTACTS_LIST,
  ADD_CONTACT,
  CONTACT_DETAILS,
  // Vendors
  VENDORS_LIST,
  ADD_VENDOR,
  VENDOR_DETAILS,
  // Fuel & Energy
  FUEL_HISTORY,
  ADD_FUEL_ENTRY,
  FUEL_ENTRY_DETAILS,
  CHARGING_HISTORY,
  ADD_CHARGING_ENTRY,
  // Parts
  PARTS_LIST,
  ADD_PART,
  // Documents
  DOCUMENTS_LIST,
  UPLOAD_DOCUMENT,
  // Places
  PLACES_LIST,
  ADD_PLACE,
  // Reports
  REPORTS_LIST,
  REPORT_DETAIL,
  // Settings
  SETTINGS_GENERAL,
  SETTINGS_USER_PROFILE,
  SETTINGS_LOGIN
}

export interface User {
  name: string;
  email: string;
  companyName: string;
  avatar: string;
}

export interface Issue {
  id: number;
  vehicle: string;
  vehicleImage?: string;
  summary: string;
  status: 'Open' | 'Resolved' | 'Closed' | 'Overdue';
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'No Priority';
  reportedDate: string;
  assignedTo?: string;
  labels?: string[];
  watchers: number;
  comments: number;
  images: number;
}

export interface ServiceEntry {
  id: number;
  vehicle: string;
  date: string;
  status: 'Completed' | 'Scheduled' | 'In Progress';
  tasks: string[];
  totalCost: number;
  meter?: number;
  vendor?: string;
}

export interface ServiceReminder {
  id: number;
  vehicle: string;
  task: string;
  status: 'Overdue' | 'Due Soon' | 'Upcoming';
  nextDue: string;
  compliance: number;
}

export interface VehicleRenewal {
  id: number;
  vehicle: string;
  type: string;
  status: 'Overdue' | 'Due Soon' | 'Upcoming';
  dueDate: string;
}

export interface ServiceTask {
  id: number;
  name: string;
  description?: string;
  entryCount: number;
  reminderCount: number;
  programCount: number;
  woCount: number;
  categoryCode?: string;
  systemCode?: string;
  assemblyCode?: string;
}

export interface ServiceProgram {
  id: number;
  name: string;
  vehicleCount: number;
  scheduleCount: number;
  primaryMeter: 'Miles' | 'Kilometers' | 'Hours';
  secondaryMeter?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  group?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  userType?: string;
  classifications: string[];
  image?: string;
  jobTitle?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone?: string;
  website?: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  labels: string[];
  classification: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FuelEntry {
  id: number;
  vehicle: string;
  date: string;
  vendor?: string;
  usage?: number;
  volume: number;
  cost: number;
  mpg?: number;
}

export interface Part {
  id: number;
  number: string;
  description: string;
  category?: string;
  manufacturer?: string;
  cost?: number;
  quantity?: number;
}

export interface Document {
  id: number;
  fileName: string;
  fileSize: string;
  location?: string;
  autoDelete?: boolean;
  attachedTo?: string;
  labels?: string[];
}

export interface Place {
  id: number;
  name: string;
  description?: string;
  address?: string;
  geofenceRadius?: number;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: 'Vehicles' | 'Issues' | 'Fuel' | 'Inspections' | 'Service' | 'Contacts' | 'Parts' | 'Work Orders' | 'Vehicle Assignments';
  isFavorite?: boolean;
}

export interface VehicleAssignment {
  id: number;
  vehicle: string;
  vehicleImage?: string;
  operator: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Future' | 'Ended';
}

export interface MeterEntry {
  id: number;
  vehicle: string;
  date: string;
  value: number;
  type: 'Primary' | 'Secondary';
  void?: boolean;
  source?: string;
}