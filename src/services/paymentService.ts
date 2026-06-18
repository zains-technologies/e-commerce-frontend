import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest, type SingleResponse } from "./api";

export interface Payment {
  id: number;
  order_id: number;
  method: string;
  status: string;
  amount: number;
  transaction_id?: string | null;
}

export interface PayHerePayload {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address: string;
  city: string;
  country: string;
  hash: string;
  sandbox: boolean;
}

type OrderVerification = {
  order_number: string;
  customer_email?: string;
  customer_phone?: string;
};

export const paymentService = {
  async confirmCod(payload: OrderVerification) {
    const response = await apiRequest<SingleResponse<Payment>>(API_ROUTES.PAYMENT_COD, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async createBankTransfer(payload: OrderVerification & { reference?: string; receipt?: File | null }) {
    const body = new FormData();
    body.append("order_number", payload.order_number);
    if (payload.customer_email) body.append("customer_email", payload.customer_email);
    if (payload.customer_phone) body.append("customer_phone", payload.customer_phone);
    if (payload.reference) body.append("reference", payload.reference);
    if (payload.receipt) body.append("receipt", payload.receipt);

    const response = await apiRequest<SingleResponse<Payment>>(API_ROUTES.PAYMENT_BANK_TRANSFER, {
      method: "POST",
      body,
    });
    return response.data;
  },

  async initiatePayHere(payload: OrderVerification) {
    const response = await apiRequest<SingleResponse<PayHerePayload>>(API_ROUTES.PAYMENT_PAYHERE_INITIATE, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  submitPayHere(payload: PayHerePayload) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = payload.sandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout";
    form.style.display = "none";

    Object.entries(payload).forEach(([key, value]) => {
      if (key === "sandbox" || value === undefined || value === null) return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  },
};
