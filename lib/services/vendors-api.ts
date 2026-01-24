// Service API pour les vendors
import { authenticatedFetch } from '@/lib/hooks/useAuthToken';

// Utilitaire pour récupérer le token d'authentification
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  const storedToken = localStorage.getItem('authToken') ||
    document.cookie.match(/authToken=([^;]*)/)?.[1];
  return storedToken || null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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

export interface VendorListResponse {
  success: boolean;
  data: {
    vendors: Vendor[];
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

export interface VendorDetailResponse {
  success: boolean;
  data: Vendor & {
    transactions: {
      serviceEntries: any[];
      fuelEntries: any[];
      expenseEntries: any[];
      chargingEntries: any[];
    };
    stats: {
      totalServices: number;
      totalFuelEntries: number;
      totalExpenses: number;
      totalChargingEntries: number;
      totalServiceCost: number;
      totalFuelCost: number;
      totalExpenseAmount: number;
      totalChargingCost: number;
      totalValue: number;
    };
  };
}

export interface CreateVendorRequest {
  name: string;
  phone?: string;
  website?: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  labels?: string[];
  classification?: string[];
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> { }

export interface VendorFilters {
  page?: number;
  limit?: number;
  classification?: string;
  label?: string;
  search?: string;
}

class VendorsAPI {
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

  async getVendors(filters: VendorFilters = {}): Promise<VendorListResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    return this.request<VendorListResponse>(`/api/vendors${query ? `?${query}` : ''}`);
  }

  async getVendor(id: string): Promise<VendorDetailResponse> {
    return this.request<VendorDetailResponse>(`/api/vendors/${id}`);
  }

  async createVendor(data: CreateVendorRequest): Promise<{ success: boolean; data: Vendor; message: string }> {
    return this.request(`/api/vendors`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(id: string, data: UpdateVendorRequest): Promise<{ success: boolean; data: Vendor; message: string }> {
    return this.request(`/api/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/vendors/${id}`, {
      method: 'DELETE',
    });
  }

  async searchVendors(query: string): Promise<VendorListResponse> {
    return this.getVendors({ search: query, limit: 20 });
  }

  async getVendorTransactions(id: string): Promise<{
    success: boolean;
    data: {
      serviceEntries: any[];
      fuelEntries: any[];
      expenseEntries: any[];
      totalCosts: {
        services: number;
        fuel: number;
        expenses: number;
        total: number;
      };
    };
  }> {
    return this.request(`/api/vendors/${id}/transactions`);
  }

  async exportVendors(): Promise<Blob> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await fetch(`${API_BASE}/api/vendors/export`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'export');
    }

    return response.blob();
  }

  async importVendors(file: File): Promise<{ success: boolean; message: string; results?: any }> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/vendors/import`, {
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

  async getVendorStats(): Promise<{
    success: boolean;
    data: {
      totalVendors: number;
      vendorsByClassification: Record<string, number>;
      topVendorsByCost: Array<{
        vendorId: string;
        vendorName: string;
        totalCost: number;
        transactionCount: number;
      }>;
      recentActivity: Array<{
        vendorId: string;
        vendorName: string;
        lastTransaction: string;
        amount: number;
      }>;
    };
  }> {
    return this.request('/api/vendors/stats');
  }
}

export const vendorsAPI = new VendorsAPI();
export default vendorsAPI;