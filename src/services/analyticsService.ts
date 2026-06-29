import { API_ROUTES } from "@/constants/apiRoutes";
import { getCartSession } from "@/lib/utils";
import { apiRequest } from "./api";

type AnalyticsPayload = {
  event: string;
  product_id?: number;
  order_id?: number;
  source?: string;
  payload?: Record<string, unknown>;
};

export const analyticsService = {
  track(payload: AnalyticsPayload) {
    return apiRequest<{ success: boolean }>(API_ROUTES.ANALYTICS_EVENTS, {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        session_id: getCartSession(),
        source: payload.source || "storefront",
      }),
    }).catch(() => undefined);
  },
};
