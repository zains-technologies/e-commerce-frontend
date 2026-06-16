import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type SingleResponse } from "./api";
import type { AddToCartPayload, Cart } from "@/types/cart";

export const emptyCart: Cart = {
  items: [],
  totals: {
    subtotal: 0,
    discount: 0,
    delivery_fee: 0,
    total: 0,
  },
};

export const cartService = {
  async get() {
    const response = await apiRequest<SingleResponse<Cart>>(API_ROUTES.CART, { cart: true });
    return response.data;
  },

  async add(payload: AddToCartPayload) {
    const response = await apiRequest<SingleResponse<Cart>>(API_ROUTES.ADD_TO_CART, {
      method: "POST",
      body: JSON.stringify(payload),
      cart: true,
    });
    return response.data;
  },

  async updateItem(itemId: number, quantity: number) {
    const response = await apiRequest<SingleResponse<Cart>>(`${API_ROUTES.CART}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
      cart: true,
    });
    return response.data;
  },

  async removeItem(itemId: number) {
    const response = await apiRequest<SingleResponse<Cart>>(`${API_ROUTES.CART}/items/${itemId}`, {
      method: "DELETE",
      cart: true,
    });
    return response.data;
  },

  async clear() {
    const response = await apiRequest<SingleResponse<Cart>>(`${API_ROUTES.CART}/clear`, {
      method: "DELETE",
      cart: true,
    });
    return response.data;
  },

  async applyCoupon(code: string) {
    const response = await apiRequest<SingleResponse<Cart>>(API_ROUTES.CART_COUPON, {
      method: "POST",
      body: JSON.stringify({ code }),
      cart: true,
    });
    return response.data;
  },

  async removeCoupon() {
    const response = await apiRequest<SingleResponse<Cart>>(API_ROUTES.CART_COUPON, {
      method: "DELETE",
      cart: true,
    });
    return response.data;
  },
};
