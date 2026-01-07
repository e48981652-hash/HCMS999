const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Log API base URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
}

interface RequestOptions extends RequestInit {
  retry?: RetryOptions;
  cache?: boolean | number; // true = default TTL (5min), number = custom TTL in ms
  signal?: AbortSignal;
  onUploadProgress?: (progress: number) => void;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private cache: Map<string, CacheEntry> = new Map();
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes
  private defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  };

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
    // Clean up expired cache entries periodically
    setInterval(() => this.cleanCache(), 60000); // Every minute
  }

  private loadToken() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        this.token = parsed.token || null;
      } catch (e) {
        console.error('Failed to parse user token');
      }
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Cache management
  private getCacheKey(endpoint: string, options: RequestInit = {}): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultCacheTTL,
    });
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Retry logic
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async requestWithRetry<T>(
    url: string,
    options: RequestInit,
    retryOptions: RetryOptions
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryOptions.maxRetries!; attempt++) {
      try {
        const response = await fetch(url, options);

        // If response is ok or not retryable, return it
        if (response.ok || !retryOptions.retryableStatuses?.includes(response.status)) {
          return response;
        }

        // If this is the last attempt, throw
        if (attempt === retryOptions.maxRetries) {
          throw new Error(`Request failed after ${retryOptions.maxRetries} retries`);
        }

        // Wait before retrying
        await this.sleep(retryOptions.retryDelay! * (attempt + 1));
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error: any) {
        lastError = error;

        // Don't retry on AbortError
        if (error.name === 'AbortError') {
          throw error;
        }

        // If this is the last attempt, throw
        if (attempt === retryOptions.maxRetries!) {
          throw error;
        }

        // Wait before retrying
        await this.sleep(retryOptions.retryDelay! * (attempt + 1));
      }
    }

    throw lastError || new Error('Request failed');
  }

  // Pagination helper
  static parsePagination<T>(response: ApiResponse<PaginatedResponse<T>>): PaginatedResponse<T> | null {
    if (response.data && 'data' in response.data && 'current_page' in response.data) {
      return response.data as PaginatedResponse<T>;
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check cache for GET requests
    const isGet = !options.method || options.method === 'GET';
    const cacheKey = this.getCacheKey(endpoint, options);
    const useCache = options.cache !== false && isGet;
    
    if (useCache) {
      const cached = this.getCached<ApiResponse<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Prepare retry options
    const retryOptions: RetryOptions = {
      ...this.defaultRetryOptions,
      ...options.retry,
    };

    try {
      const response = await this.requestWithRetry(url, {
        ...options,
        headers,
        credentials: 'include',
      }, retryOptions);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Try to parse JSON, but handle empty responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          // Empty or invalid JSON response
          data = { success: true, message: 'Request completed successfully' };
        }
      } else {
        // Non-JSON response
        data = { success: true, message: 'Request completed successfully' };
      }

      // Cache successful GET responses
      if (useCache && data) {
        const ttl = typeof options.cache === 'number' ? options.cache : undefined;
        this.setCache(cacheKey, data, ttl);
      }

      return data;
    } catch (error: any) {
      // Handle abort errors
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError = new Error(
          `Cannot connect to API server at ${this.baseURL}. Please make sure the backend server is running.`
        );
        console.error('Network Error:', networkError.message);
        throw networkError;
      }
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    const response = await this.request<{ user: any; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Business endpoints
  async getBusinesses() {
    return this.request('/businesses');
  }

  async getBusiness(id: string) {
    return this.request(`/businesses/${id}`);
  }

  async createBusiness(businessData: {
    name: string;
    industry?: string;
    description?: string;
    social_links?: Record<string, string>;
  }) {
    return this.request('/businesses', {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  async updateBusiness(id: string, businessData: {
    name?: string;
    industry?: string;
    description?: string;
    social_links?: Record<string, string>;
    status?: string;
  }) {
    return this.request(`/businesses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(businessData),
    });
  }

  // Request Type endpoints
  async getRequestTypes() {
    return this.request('/request-types');
  }

  async getAdminRequestTypes() {
    return this.request('/admin/request-types');
  }

  async createRequestType(data: {
    name: string;
    description?: string;
    is_published?: boolean;
    default_team_id?: number;
    sla_hours?: number;
    fields?: any[];
  }) {
    return this.request('/admin/request-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRequestType(id: string, data: {
    name?: string;
    description?: string;
    is_published?: boolean;
    default_team_id?: number;
    sla_hours?: number;
    fields?: any[];
  }) {
    return this.request(`/admin/request-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Request endpoints
  async getRequests(params?: { business_id?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/requests${query ? `?${query}` : ''}`);
  }

  async getRequest(id: string) {
    return this.request(`/requests/${id}`);
  }

  async createRequest(
    requestData: {
      request_type_id: number;
      business_id: number;
      fields: Record<string, any>;
    },
    options?: { onProgress?: (progress: number) => void; signal?: AbortSignal }
  ) {
    // Handle FormData for file uploads
    const hasFiles = Object.values(requestData.fields).some(value => 
      value instanceof FileList || value instanceof File
    );

    if (hasFiles) {
      const formData = new FormData();
      formData.append('request_type_id', requestData.request_type_id.toString());
      formData.append('business_id', requestData.business_id.toString());
      
      // Handle image fields separately
      Object.keys(requestData.fields).forEach(key => {
        const value = requestData.fields[key];
        if (value instanceof FileList || value instanceof File) {
          if (value instanceof FileList) {
            Array.from(value).forEach(file => {
              formData.append(`${key}[]`, file);
            });
          } else {
            formData.append(`${key}[]`, value);
          }
        } else if (value !== null && value !== undefined) {
          formData.append(`fields[${key}]`, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });

      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      // Use XMLHttpRequest for upload progress tracking
      if (options?.onProgress) {
        return new Promise<ApiResponse>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Handle abort
          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              xhr.abort();
              reject(new Error('Request creation was cancelled'));
            });
          }

          // Upload progress
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = (e.loaded / e.total) * 100;
              options.onProgress!(progress);
            }
          });

          // Load complete
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (e) {
                resolve({ success: true, message: 'Request created successfully' } as ApiResponse);
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(new Error(errorData.message || 'Request creation failed'));
              } catch (e) {
                reject(new Error(`Request creation failed: ${xhr.statusText}`));
              }
            }
          });

          // Error handling
          xhr.addEventListener('error', () => {
            reject(new Error('Network error during request creation'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Request creation was cancelled'));
          });

          xhr.open('POST', `${this.baseURL}/requests`);
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
          xhr.withCredentials = true;
          xhr.send(formData);
        });
      }

      // Fallback to fetch
      const response = await fetch(`${this.baseURL}/requests`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
        signal: options?.signal,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } else {
      return this.request('/requests', {
        method: 'POST',
        body: JSON.stringify({
          request_type_id: requestData.request_type_id,
          business_id: requestData.business_id,
          fields: requestData.fields,
        }),
        signal: options?.signal,
      });
    }
  }

  async updateRequest(id: string, data: {
    status?: string;
    assigned_user_id?: number;
    assigned_team_id?: number;
    priority?: string;
  }) {
    return this.request(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // MCP endpoints
  async getMcps(businessId: string, month?: string) {
    const query = month ? `?month=${month}` : '';
    return this.request(`/businesses/${businessId}/mcps${query}`);
  }

  async createMcp(businessId: string, data: { month: string }) {
    return this.request(`/businesses/${businessId}/mcps`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMcpPost(id: string, data: {
    title?: string;
    caption?: string;
    status?: string;
    scheduled_at?: string;
    metadata?: Record<string, any>;
  }) {
    return this.request(`/mcp-posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // OPMP endpoints
  async getOpmp(businessId: string) {
    return this.request(`/businesses/${businessId}/opmp`);
  }

  async updateOpmp(businessId: string, data: { data: Record<string, any> }) {
    return this.request(`/businesses/${businessId}/opmp`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Dashboard endpoints
  async getClientDashboard() {
    return this.request('/client/dashboard');
  }

  async getStaffDashboard() {
    return this.request('/staff/dashboard');
  }

  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  // Admin endpoints
  async getAdminClients() {
    return this.request('/admin/clients');
  }

  async suspendClient(id: string) {
    return this.request(`/admin/clients/${id}/suspend`, {
      method: 'PATCH',
    });
  }

  async activateClient(id: string) {
    return this.request(`/admin/clients/${id}/activate`, {
      method: 'PATCH',
    });
  }

  // Team endpoints
  async getTeams() {
    return this.request('/admin/teams');
  }

  async getTeam(id: string) {
    return this.request(`/admin/teams/${id}`);
  }

  async createTeam(data: { name: string; description?: string }) {
    return this.request('/admin/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeam(id: string, data: { name?: string; description?: string }) {
    return this.request(`/admin/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async assignUsersToTeam(teamId: string, userIds: number[]) {
    return this.request(`/admin/teams/${teamId}/assign-users`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/admin/settings');
  }

  async getSetting(key: string) {
    return this.request(`/admin/settings/${key}`);
  }

  async updateSetting(key: string, value: any) {
    return this.request(`/admin/settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    });
  }

  // Feedback endpoint
  async submitFeedback(data: {
    subject: string;
    category: string;
    message: string;
    rating?: number;
  }) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Comments endpoints
  async getRequestComments(requestId: string) {
    return this.request(`/requests/${requestId}/comments`);
  }

  async createComment(requestId: string, content: string) {
    return this.request(`/requests/${requestId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async updateComment(commentId: string, content: string) {
    return this.request(`/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: string) {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Attachments endpoints
  async getRequestAttachments(requestId: string) {
    return this.request(`/requests/${requestId}/attachments`);
  }

  async uploadAttachment(
    requestId: string,
    file: File,
    options?: { onProgress?: (progress: number) => void; signal?: AbortSignal }
  ) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Use XMLHttpRequest for upload progress tracking
    if (options?.onProgress) {
      return new Promise<ApiResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Handle abort
        if (options.signal) {
          options.signal.addEventListener('abort', () => {
            xhr.abort();
            reject(new Error('Upload was cancelled'));
          });
        }

        // Upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            options.onProgress!(progress);
          }
        });

        // Load complete
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              resolve({ success: true, message: 'Upload completed successfully' } as ApiResponse);
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || 'Upload failed'));
            } catch (e) {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          }
        });

        // Error handling
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });

        xhr.open('POST', `${this.baseURL}/requests/${requestId}/attachments`);
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    }

    // Fallback to fetch if no progress tracking needed
    const response = await fetch(`${this.baseURL}/requests/${requestId}/attachments`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
      signal: options?.signal,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  }

  async deleteAttachment(attachmentId: string) {
    return this.request(`/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/attachments/${attachmentId}/download`, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Download failed');
    }

    return response.blob();
  }

  // Notifications endpoints
  async getNotifications(params?: { read?: 'true' | 'false'; type?: string; page?: number }) {
    const query = new URLSearchParams();
    if (params?.read) query.append('read', params.read);
    if (params?.type) query.append('type', params.type);
    if (params?.page) query.append('page', params.page.toString());
    
    const queryString = query.toString();
    return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async getUnreadNotificationsCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Reports endpoints
  async getRequestsReport(params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    business_id?: number;
    team_id?: number;
    per_page?: number;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value.toString());
      }
    });
    const queryString = query.toString();
    return this.request(`/reports/requests${queryString ? `?${queryString}` : ''}`);
  }

  async getClientsReport(params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    per_page?: number;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value.toString());
      }
    });
    const queryString = query.toString();
    return this.request(`/reports/clients${queryString ? `?${queryString}` : ''}`);
  }

  async getTeamsReport(params?: { team_id?: number }) {
    const query = new URLSearchParams();
    if (params?.team_id) query.append('team_id', params.team_id.toString());
    const queryString = query.toString();
    return this.request(`/reports/teams${queryString ? `?${queryString}` : ''}`);
  }

  // Analytics endpoints
  async getAnalyticsDashboard(params?: { period?: '7d' | '30d' | '90d' | '1y' }) {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    const queryString = query.toString();
    return this.request(`/analytics/dashboard${queryString ? `?${queryString}` : ''}`);
  }

  async getAnalyticsRequests(params?: {
    start_date?: string;
    end_date?: string;
    business_id?: number;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value.toString());
      }
    });
    const queryString = query.toString();
    return this.request(`/analytics/requests${queryString ? `?${queryString}` : ''}`);
  }

  async getAnalyticsTeams(params?: {
    start_date?: string;
    end_date?: string;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value.toString());
      }
    });
    const queryString = query.toString();
    return this.request(`/analytics/teams${queryString ? `?${queryString}` : ''}`);
  }

  // Export endpoints
  async exportRequests(params: {
    format?: 'csv' | 'excel';
    start_date?: string;
    end_date?: string;
    status?: string;
    business_id?: number;
  }): Promise<Blob> {
    const headers: HeadersInit = {
      'Accept': '*/*',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/export/requests`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Export failed');
    }

    return response.blob();
  }

  async exportClients(params: {
    format?: 'csv' | 'excel';
    status?: string;
  }): Promise<Blob> {
    const headers: HeadersInit = {
      'Accept': '*/*',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/export/clients`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Export failed');
    }

    return response.blob();
  }

  // Audit Logs endpoints
  async getAuditLogs(params?: {
    actor_id?: number;
    action?: string;
    entity_type?: string;
    entity_id?: number;
    start_date?: string;
    end_date?: string;
    per_page?: number;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value.toString());
      }
    });
    const queryString = query.toString();
    return this.request(`/audit-logs${queryString ? `?${queryString}` : ''}`);
  }

  async getAuditLog(id: string) {
    return this.request(`/audit-logs/${id}`);
  }

  // Search endpoint
  async search(query: string, type?: 'all' | 'requests' | 'businesses' | 'clients') {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return this.request(`/search?${params.toString()}`);
  }

  // Activity Feed endpoint
  async getActivityFeed(params?: {
    type?: 'all' | 'requests' | 'users' | 'businesses';
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString();
    return this.request(`/activity/feed${queryString ? `?${queryString}` : ''}`);
  }

  // Bulk Operations
  async bulkUpdateRequests(ids: number[], data: Record<string, any>) {
    return this.request('/requests/bulk', {
      method: 'POST',
      body: JSON.stringify({ action: 'update', ids, data }),
    });
  }

  async bulkDeleteRequests(ids: number[]) {
    return this.request('/requests/bulk', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', ids }),
    });
  }

  async bulkClientAction(ids: number[], action: 'activate' | 'suspend' | 'delete') {
    return this.request('/admin/clients/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, ids }),
    });
  }

  // Admin Client endpoints (missing methods)
  async createClient(data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    return this.request('/admin/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getClient(id: string) {
    return this.request(`/admin/clients/${id}`);
  }

  async getRequestActivityLog(requestId: string) {
    // This will use audit logs filtered by entity_type and entity_id
    return this.getAuditLogs({
      entity_type: 'request',
      entity_id: parseInt(requestId),
    });
  }

  async getOpmpVersionHistory(businessId: string) {
    // Placeholder - would need backend endpoint
    return this.request(`/businesses/${businessId}/opmp/versions`);
  }

  // User Management endpoints (Admin)
  async getUsers(params?: { role?: 'all' | 'admin' | 'staff'; search?: string }) {
    const query = new URLSearchParams();
    if (params?.role && params.role !== 'all') query.append('role', params.role);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString();
    return this.request(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  async createUser(data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'staff';
  }) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUser(id: string) {
    return this.request(`/admin/users/${id}`);
  }

  async updateUser(id: string, data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    role?: 'admin' | 'staff';
    status?: 'active' | 'suspended';
  }) {
    return this.request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getStaffUsers() {
    return this.getUsers({ role: 'staff' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

