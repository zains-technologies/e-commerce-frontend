import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type PaginatedResponse, type SingleResponse } from "./api";
import type { CheckoutPayload } from "@/types/cart";

export interface OrderSummary {
  id: number;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
}

export const orderService = {
  async checkout(payload: CheckoutPayload) {
    const response = await apiRequest<SingleResponse<OrderSummary>>(API_ROUTES.CHECKOUT, {
      method: "POST",
      body: JSON.stringify(payload),
      cart: true,
    });
    return response.data;
  },

  async orders() {
    const response = await apiRequest<PaginatedResponse<OrderSummary>>(API_ROUTES.ORDERS, { auth: true });
    return response.data;
  },

  async reorder(orderId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ORDERS}/${orderId}/reorder`, {
      method: "POST",
      auth: true,
      cart: true,
    });
  },

  async track(payload: { order_number: string; email?: string; phone?: string }) {
    const response = await apiRequest<SingleResponse<OrderSummary>>(API_ROUTES.TRACK_ORDER, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },
};
