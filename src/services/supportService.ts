import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type SingleResponse } from "./api";
import type { SupportTicket } from "@/types/admin";

export const supportService = {
  create(payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<SupportTicket>>(API_ROUTES.SUPPORT_TICKETS, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((response) => response.data);
  },
};
