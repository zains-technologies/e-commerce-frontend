import { API_ROUTES } from "@/constants/apiRoutes";
import { clearToken, setToken } from "@/lib/utils";
import { apiRequest } from "./api";
import type { AuthResponse, User } from "@/types/user";

export const authService = {
  async login(payload: { email: string; password: string }) {
    const response = await apiRequest<AuthResponse>(API_ROUTES.LOGIN, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(response.data.token);
    return response.data;
  },

  async register(payload: { name: string; email: string; password: string }) {
    const response = await apiRequest<AuthResponse>(API_ROUTES.REGISTER, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(response.data.token);
    return response.data;
  },

  async me() {
    const response = await apiRequest<{ success: boolean; data: User }>(API_ROUTES.ME, { auth: true });
    return response.data;
  },

  async updateProfile(payload: { name: string; email: string; phone?: string; password?: string }) {
    const response = await apiRequest<{ success: boolean; data: User }>(API_ROUTES.ME, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async logout() {
    await apiRequest(API_ROUTES.LOGOUT, { method: "POST", auth: true }).catch(() => null);
    clearToken();
  },
};
