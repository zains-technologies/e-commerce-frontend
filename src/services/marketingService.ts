import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type SingleResponse } from "./api";
import type { MarketingBanner, NewsletterSubscriber, ShippingMethod } from "@/types/marketing";

export const marketingService = {
  async banners(position?: string) {
    const path = position ? `${API_ROUTES.BANNERS}?position=${encodeURIComponent(position)}` : API_ROUTES.BANNERS;
    const response = await apiRequest<SingleResponse<MarketingBanner[]>>(path);
    return response.data;
  },

  async shippingMethods() {
    const response = await apiRequest<SingleResponse<ShippingMethod[]>>(API_ROUTES.SHIPPING_METHODS);
    return response.data;
  },

  async subscribe(payload: { email: string; name?: string }) {
    const response = await apiRequest<SingleResponse<NewsletterSubscriber>>(API_ROUTES.NEWSLETTER_SUBSCRIBE, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },
};
