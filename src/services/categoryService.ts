import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type PaginatedResponse } from "./api";
import type { Category } from "@/types/category";

export const categoryService = {
  async list() {
    const response = await apiRequest<PaginatedResponse<Category>>(API_ROUTES.CATEGORIES);
    return response.data;
  },
};

