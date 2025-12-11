// API Base URL
export const API_BASE_URL =
   process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Token management
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const getToken = () => {
   if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
   }
   return null;
};

export const setToken = (token: string) => {
   if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
   }
};

export const getRefreshToken = () => {
   if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
   }
   return null;
};

export const setRefreshToken = (token: string) => {
   if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
   }
};

export const clearTokens = () => {
   if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
   }
};

// API Client
class ApiClient {
   private baseUrl: string;

   constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
   }

   private async request<T>(
      endpoint: string,
      options: RequestInit = {}
   ): Promise<T> {
      const token = getToken();
      const headers: HeadersInit = {
         ...options.headers,
      };

      // Add authorization header if token exists
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      // Add Content-Type for JSON requests
      if (options.body && typeof options.body === "string") {
         headers["Content-Type"] = "application/json";
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
         ...options,
         headers,
      });

      // Handle 401 - try to refresh token
      if (response.status === 401) {
         const refreshed = await this.refreshAccessToken();
         if (refreshed) {
            // Retry the request with new token
            return this.request(endpoint, options);
         } else {
            clearTokens();
            if (typeof window !== "undefined") {
               window.location.href = "/login";
            }
            throw new Error("Unauthorized");
         }
      }

      if (!response.ok) {
         // Try to read response body (may be JSON or text) and include it in the thrown Error
         const text = await response.text().catch(() => "");
         let parsed: any = null;
         try {
            parsed = text ? JSON.parse(text) : null;
         } catch (e) {
            parsed = text;
         }

         const message =
            (parsed && (parsed.error || parsed.message)) ||
            (typeof parsed === "string" && parsed) ||
            `HTTP ${response.status}`;

         const err: any = new Error(message);
         err.status = response.status;
         err.body = parsed;
         throw err;
      }

      return await response.json();
   }

   private async refreshAccessToken(): Promise<boolean> {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      try {
         const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
            method: "POST",
            headers: {
               Authorization: `Bearer ${refreshToken}`,
            },
         });

         if (response.ok) {
            const data = await response.json();
            setToken(data.access_token);
            return true;
         }
      } catch (error) {
         console.error("Token refresh failed:", error);
      }

      return false;
   }

   // Auth endpoints
   async login(email: string, password: string) {
      const data = await this.request<{
         access_token: string;
         refresh_token: string;
         user: any;
      }>("/api/auth/login", {
         method: "POST",
         body: JSON.stringify({ email, password }),
      });

      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      return data;
   }

   async logout() {
      try {
         await this.request("/api/auth/logout", { method: "POST" });
      } finally {
         clearTokens();
      }
   }

   async getCurrentUser() {
      return this.request<{ user: any }>("/api/auth/me");
   }

   // Products
   async getProducts(params?: Record<string, any>) {
      const query = new URLSearchParams(params).toString();
      return this.request<any>(`/api/admin/products?${query}`);
   }

   async getProduct(id: number) {
      return this.request<any>(`/api/admin/products/${id}`);
   }

   async createProduct(formData: FormData) {
      const token = getToken();
      const response = await fetch(`${this.baseUrl}/api/admin/products`, {
         method: "POST",
         headers: {
            Authorization: `Bearer ${token}`,
         },
         body: formData,
      });

      if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error || "Failed to create product");
      }

      return response.json();
   }

   async updateProduct(id: number, formData: FormData) {
      const token = getToken();
      const response = await fetch(`${this.baseUrl}/api/admin/products/${id}`, {
         method: "PUT",
         headers: {
            Authorization: `Bearer ${token}`,
         },
         body: formData,
      });

      if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error || "Failed to update product");
      }

      return response.json();
   }

   async deleteProduct(id: number) {
      return this.request(`/api/admin/products/${id}`, { method: "DELETE" });
   }

   async bulkDeleteProducts(productIds: number[]) {
      return this.request("/api/admin/products/bulk-delete", {
         method: "POST",
         body: JSON.stringify({ product_ids: productIds }),
      });
   }

   // Categories
   async getCategories(params?: Record<string, any>) {
      const query = new URLSearchParams(params).toString();
      return this.request<any>(`/api/admin/categories?${query}`);
   }

   async getCategory(id: number) {
      return this.request<any>(`/api/admin/categories/${id}`);
   }

   async createCategory(formData: FormData) {
      const token = getToken();
      const response = await fetch(`${this.baseUrl}/api/admin/categories`, {
         method: "POST",
         headers: {
            Authorization: `Bearer ${token}`,
         },
         body: formData,
      });

      if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error || "Failed to create category");
      }

      return response.json();
   }

   async updateCategory(id: number, formData: FormData) {
      const token = getToken();
      const response = await fetch(
         `${this.baseUrl}/api/admin/categories/${id}`,
         {
            method: "PUT",
            headers: {
               Authorization: `Bearer ${token}`,
            },
            body: formData,
         }
      );

      if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error || "Failed to update category");
      }

      return response.json();
   }

   async deleteCategory(id: number) {
      return this.request(`/api/admin/categories/${id}`, { method: "DELETE" });
   }

   // Orders
   async getOrders(params?: Record<string, any>) {
      const query = new URLSearchParams(params).toString();
      return this.request<any>(`/api/admin/orders?${query}`);
   }

   async getOrder(id: number) {
      return this.request<any>(`/api/admin/orders/${id}`);
   }

   async updateOrderStatus(id: number, status: string) {
      return this.request(`/api/admin/orders/${id}/status`, {
         method: "PUT",
         body: JSON.stringify({ status }),
      });
   }

   async updateOrderShipping(id: number, data: any) {
      return this.request(`/api/admin/orders/${id}/shipping`, {
         method: "PUT",
         body: JSON.stringify(data),
      });
   }

   async getOrderStats() {
      return this.request<any>("/api/admin/orders/stats");
   }

   // Users
   async getUsers(params?: Record<string, any>) {
      const query = new URLSearchParams(params).toString();
      return this.request<any>(`/api/admin/users?${query}`);
   }

   async getUser(id: number) {
      return this.request<any>(`/api/admin/users/${id}`);
   }

   async updateUser(id: number, data: any) {
      return this.request(`/api/admin/users/${id}`, {
         method: "PUT",
         body: JSON.stringify(data),
      });
   }

   async toggleUserAdmin(id: number) {
      return this.request(`/api/admin/users/${id}/toggle-admin`, {
         method: "POST",
      });
   }

   async toggleUserActive(id: number) {
      return this.request(`/api/admin/users/${id}/toggle-active`, {
         method: "POST",
      });
   }

   async deleteUser(id: number) {
      return this.request(`/api/admin/users/${id}`, { method: "DELETE" });
   }

   // Analytics
   async getDashboard(days: number = 30) {
      return this.request<any>(`/api/admin/analytics/dashboard?days=${days}`);
   }

   async getSalesAnalytics(days: number = 30) {
      return this.request<any>(`/api/admin/analytics/sales?days=${days}`);
   }

   async getProductPerformance() {
      return this.request<any>("/api/admin/analytics/products/performance");
   }

   async getCategoryPerformance() {
      return this.request<any>("/api/admin/analytics/categories/performance");
   }

   async getUserActivity() {
      return this.request<any>("/api/admin/analytics/users/activity");
   }
}

export const api = new ApiClient(API_BASE_URL);
