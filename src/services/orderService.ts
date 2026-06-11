import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type SingleResponse } from "./api";
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
};

