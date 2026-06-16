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

  async submitReview(productId: number, payload: { customer_name: string; customer_email?: string; rating: number; comment?: string }) {
    const response = await apiRequest<SingleResponse<unknown>>(`${API_ROUTES.PRODUCTS}/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async submitQuestion(productId: number, payload: { customer_name: string; customer_email?: string; question: string }) {
    const response = await apiRequest<SingleResponse<unknown>>(`${API_ROUTES.PRODUCTS}/${productId}/questions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },
};
