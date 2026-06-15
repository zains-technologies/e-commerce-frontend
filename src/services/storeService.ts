import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type SingleResponse } from "./api";
import type { StoreSettings } from "@/types/admin";

export const storeService = {
  async get() {
    const response = await apiRequest<SingleResponse<StoreSettings>>(API_ROUTES.STORE);
    return response.data;
  },
};
