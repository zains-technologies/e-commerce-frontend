import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type PaginatedResponse } from "./api";
import type { Product } from "@/types/product";

export const wishlistService = {
  async list() {
    const response = await apiRequest<PaginatedResponse<Product>>(API_ROUTES.WISHLIST, { auth: true });
    return response.data;
  },

  async add(productId: number) {
    return apiRequest<{ success: boolean; message: string }>(API_ROUTES.WISHLIST, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ product_id: productId }),
    });
  },

  async remove(productId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.WISHLIST}/${productId}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
