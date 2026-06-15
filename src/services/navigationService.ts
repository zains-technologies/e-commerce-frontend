import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type SingleResponse } from "./api";
import type { NavigationPayload } from "@/types/navigation";

export const navigationService = {
  async get() {
    const response = await apiRequest<SingleResponse<NavigationPayload>>(API_ROUTES.NAVIGATION);
    return response.data.navigation;
  },
};
