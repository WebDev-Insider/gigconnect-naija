import { toast } from 'sonner';

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`Making request to: ${url}`);
      console.log('Request headers:', headers);
      console.log('Request body:', options.body);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 401) {
          // Don't redirect for auth endpoints
          if (endpoint.includes('/auth/login') || endpoint.includes('/auth/signup')) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
          }
          this.clearToken();
          window.location.href = '/login';
          throw new Error('Authentication required');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      // Don't show toast for auth errors to avoid confusion
      if (!endpoint.includes('/auth/')) {
        toast.error(message);
      }
      throw error;
    }
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Auth endpoints
  async signup(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'client' | 'freelancer';
    phone?: string;
  }): Promise<ApiResponse<{ user: any }>> {
    const { email, password, firstName, lastName, role } = userData;
    // Ensure phone is E.164-like: remove spaces and trim
    const normalizedPhone = userData.phone?.replace(/\s+/g, '').trim();

    const payload = {
      email,
      password,
      full_name: `${firstName} ${lastName}`.trim(),
      phone: normalizedPhone,
      role,
    } as any;

    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<
    ApiResponse<{
      user: any;
      session: {
        access_token: string;
        refresh_token: string;
        expires_at: number;
      };
    }>
  > {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.success && (response as any).data?.session?.access_token) {
      const session = (response as any).data.session;
      this.setToken(session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
    }
    return response as any;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/auth/me');
  }

  async refreshToken(): Promise<
    ApiResponse<{
      session: {
        access_token: string;
        refresh_token: string;
        expires_at: number;
      };
    }>
  > {
    const refresh_token = localStorage.getItem('refresh_token');
    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    });
    if (response.success && (response as any).data?.session?.access_token) {
      const session = (response as any).data.session;
      this.setToken(session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
    }
    return response as any;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // User management
  async updateProfile(userId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async submitKYC(userId: string, kycData: any): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}/kyc`, {
      method: 'POST',
      body: JSON.stringify(kycData),
    });
  }

  async getKYCStatus(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}/kyc`);
  }

  async updateFreelancerProfile(
    userId: string,
    data: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}/freelancer`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getWallet(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}/wallet`);
  }

  async getTransactions(
    userId: string,
    params?: any
  ): Promise<ApiResponse<any[]>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request(`/users/${userId}/transactions${queryString}`);
  }

  // Gig management
  async createGig(gigData: any): Promise<ApiResponse<any>> {
    return this.request('/gigs', {
      method: 'POST',
      body: JSON.stringify(gigData),
    });
  }

  async getGigs(params?: any): Promise<ApiResponse<any[]>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request(`/gigs${queryString}`);
  }

  async getGig(gigId: string): Promise<ApiResponse<any>> {
    return this.request(`/gigs/${gigId}`);
  }

  async updateGig(gigId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/gigs/${gigId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGig(gigId: string): Promise<ApiResponse> {
    return this.request(`/gigs/${gigId}`, {
      method: 'DELETE',
    });
  }

  // Order management
  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: any): Promise<ApiResponse<any[]>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request(`/orders${queryString}`);
  }

  async getOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}`);
  }

  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Payment management
  async initiatePayment(paymentData: any): Promise<ApiResponse<any>> {
    return this.request('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // File uploads (Cloudinary via backend)
  async uploadFile(base64Data: string, folder?: string): Promise<ApiResponse<{ url: string; public_id: string }>> {
    return this.request('/uploads', {
      method: 'POST',
      body: JSON.stringify({ file: base64Data, folder }),
    });
  }

  async verifyPayment(reference: string): Promise<ApiResponse<any>> {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  }

  async getPaymentStatus(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/payments/status/${orderId}`);
  }

  // Projects (client job posts)
  async createProject(projectData: {
    title: string;
    description: string;
    category: string;
    budget: number | string;
    deliveryTime: string;
    skills?: string[];
    attachments?: any[];
  }): Promise<ApiResponse<any>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProjects(params?: {
    clientId?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return this.request(`/projects${queryString}`);
  }

  async getProject(id: string): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`);
  }

  async updateProject(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Chat management
  async getChatRooms(): Promise<ApiResponse<any[]>> {
    return this.request('/chat/rooms');
  }

  async createChatRoom(participantId: string, orderId?: string): Promise<ApiResponse<any>> {
    return this.request('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify({ participantId, orderId }),
    });
  }

  async getChatMessages(
    chatId: string,
    params?: any
  ): Promise<ApiResponse<any[]>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request(`/chat/${chatId}/messages${queryString}`);
  }

  async sendMessage(
    chatId: string,
    messageData: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/chat/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Admin endpoints
  async getUsers(params?: any): Promise<ApiResponse<any[]>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request(`/admin/users${queryString}`);
  }

  async verifyUser(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}/verify`, {
      method: 'POST',
    });
  }

  async releaseOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/orders/${orderId}/release`, {
      method: 'POST',
    });
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/admin/analytics');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export commonly used types
export type { ApiResponse, PaginatedResponse };
