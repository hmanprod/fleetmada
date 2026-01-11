// Service API pour les contacts
import { authenticatedFetch } from '@/lib/hooks/useAuthToken';

// Utilitaire pour récupérer le token d'authentification
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  const storedToken = localStorage.getItem('authToken') ||
    document.cookie.match(/authToken=([^;]*)/)?.[1];
  return storedToken || null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export interface Group {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contacts: number;
  };
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  groupId?: string;
  group?: Group;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  userType?: string;
  classifications: string[];
  image?: string;
  jobTitle?: string;
  company?: string;
  middleName?: string;
  phoneWork?: string;
  phoneOther?: string;
  address?: string;
  address2?: string;
  city?: string;
  zip?: string;
  country?: string;
  dateOfBirth?: string;
  employeeNumber?: string;
  startDate?: string;
  leaveDate?: string;
  licenseNumber?: string;
  licenseClass?: string[];
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
  associatedUserId?: string | null;
  assignments?: any[];
}

export interface ContactListResponse {
  success: boolean;
  data: {
    contacts: Contact[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ContactDetailResponse {
  success: boolean;
  data: Contact & {
    assignments: any[];
  };
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  groupId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  userType?: string;
  classifications?: string[];
  image?: string;
  jobTitle?: string;
  company?: string;
  middleName?: string;
  phoneWork?: string;
  phoneOther?: string;
  address?: string;
  address2?: string;
  city?: string;
  zip?: string;
  country?: string;
  dateOfBirth?: string;
  employeeNumber?: string;
  startDate?: string;
  leaveDate?: string;
  licenseNumber?: string;
  licenseClass?: string[];
  hourlyRate?: number;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> { }

export interface ContactFilters {
  page?: number;
  limit?: number;
  status?: string;
  group?: string;
  classification?: string;
  search?: string;
}

class ContactsAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }

    return response.json();
  }

  async getContacts(filters: ContactFilters = {}): Promise<ContactListResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    return this.request<ContactListResponse>(`/api/contacts${query ? `?${query}` : ''}`);
  }

  async getContact(id: string): Promise<ContactDetailResponse> {
    return this.request<ContactDetailResponse>(`/api/contacts/${id}`);
  }

  async createContact(data: CreateContactRequest): Promise<{ success: boolean; data: Contact; message: string }> {
    return this.request(`/api/contacts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContact(id: string, data: UpdateContactRequest): Promise<{ success: boolean; data: Contact; message: string }> {
    return this.request(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async searchContacts(query: string): Promise<ContactListResponse> {
    return this.getContacts({ search: query, limit: 20 });
  }

  async exportContacts(): Promise<Blob> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await fetch(`${API_BASE}/api/contacts/export`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'export');
    }

    return response.blob();
  }

  async importContacts(file: File): Promise<{ success: boolean; message: string; results?: any }> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/contacts/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const contactsAPI = new ContactsAPI();

export const groupsAPI = {
  async getGroups(): Promise<Group[]> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/groups`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    return result.data || [];
  },
  async createGroup(name: string, color?: string): Promise<{ success: boolean; data?: Group; error?: string }> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, color })
    });
    return response.json();
  },
  async updateGroup(id: string, name?: string, color?: string): Promise<{ success: boolean; data?: Group; error?: string }> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, color })
    });
    return response.json();
  },
  async deleteGroup(id: string): Promise<{ success: boolean; error?: string }> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/groups/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

export default contactsAPI;