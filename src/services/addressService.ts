import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type PaginatedResponse, type SingleResponse } from "./api";
import type { CustomerAddress, CustomerAddressPayload } from "@/types/address";

export const addressService = {
  async list() {
    const response = await apiRequest<PaginatedResponse<CustomerAddress>>(API_ROUTES.ADDRESSES, { auth: true });
    return response.data;
  },

  async create(payload: CustomerAddressPayload) {
    const response = await apiRequest<SingleResponse<CustomerAddress>>(API_ROUTES.ADDRESSES, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async remove(id: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADDRESSES}/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
