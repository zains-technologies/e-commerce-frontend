export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role?: "admin" | "manager" | "staff" | "customer";
  store_id?: number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}
