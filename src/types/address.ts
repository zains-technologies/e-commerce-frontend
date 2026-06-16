export interface CustomerAddress {
  id: number;
  label: string;
  recipient_name: string;
  phone?: string | null;
  address: string;
  city?: string | null;
  postal_code?: string | null;
  is_default: boolean;
}

export type CustomerAddressPayload = Omit<CustomerAddress, "id">;
