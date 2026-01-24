import { User, LoginCredentials, RegisterData, OnboardingData } from '../types/auth';

const API_BASE_URL = '/api';

class AuthAPI {
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
      throw new Error(error.message || `Erreur HTTP: ${response.status}`);
    }
    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await this.handleResponse<any>(response);
    return { token: data.token, user: data.user };
  }

  async register(data: RegisterData): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await this.handleResponse<any>(response);
    return { token: result.token, user: result.user };
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    this.handleResponse(response);
    // Supprimer le token même en cas d'erreur côté serveur
    this.removeToken();
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse<{ success: boolean; user: User }>(response);
    return data.user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await this.handleResponse<{ success: boolean, user: User }>(response);
    return result.user;
  }

  async completeOnboarding(data: OnboardingData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/onboarding/company`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      // Optionnel: aussi le mettre dans un cookie pour la compatibilité SSR si nécessaire
      document.cookie = `authToken=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  async verifyToken(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      return await this.getProfile();
    } catch (error) {
      // Token invalide, le supprimer
      this.removeToken();
      return null;
    }
  }
}

export const authAPI = new AuthAPI();