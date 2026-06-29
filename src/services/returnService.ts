import { apiRequest, type SingleResponse } from "./api";
import type { ReturnRequest } from "@/types/admin";

export const returnService = {
  create(orderId: number, payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<ReturnRequest>>(`/orders/${orderId}/returns`, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((response) => response.data);
  },
};
