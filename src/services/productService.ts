import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type PaginatedResponse, type SingleResponse } from "./api";
import type { Product } from "@/types/product";

export const productService = {
  async list() {
    const response = await apiRequest<PaginatedResponse<Product>>(API_ROUTES.PRODUCTS);
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await apiRequest<SingleResponse<Product>>(`${API_ROUTES.PRODUCTS}/${slug}`);
    return response.data;
  },
};

