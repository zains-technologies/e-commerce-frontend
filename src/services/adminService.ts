import { API_ROUTES } from "@/constants/apiRoutes";
import { getToken } from "@/lib/utils";
import { API_BASE_URL, apiRequest, type PaginatedResponse, type SingleResponse } from "./api";
import type { Category } from "@/types/category";
import type { CatalogBrand, CatalogTag, Product, ProductCollection, SizeGuide } from "@/types/product";
import type {
  Branch,
  Coupon,
  InventoryLog,
  Order,
  Payment,
  ProfitReport,
  SalesReport,
  StaffUser,
  StoreSettings,
} from "@/types/admin";

type AdminPayload = Record<string, unknown> | FormData;

function bodyFor(payload: AdminPayload) {
  return payload instanceof FormData ? payload : JSON.stringify(payload);
}

async function listWithFallback<T>(primaryPath: string, fallbackPath: string) {
  try {
    const response = await apiRequest<SingleResponse<T[]> | { success: boolean; data: T[] }>(primaryPath);
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.toLowerCase().includes("route") && !message.includes("404")) {
      throw error;
    }
    try {
      const response = await apiRequest<SingleResponse<T[]> | { success: boolean; data: T[] }>(fallbackPath, { auth: true });
      return response.data;
    } catch {
      return [];
    }
  }
}

export const adminService = {
  products: () => apiRequest<PaginatedResponse<Product>>(API_ROUTES.PRODUCTS, { auth: true }).then((r) => r.data),
  categories: () => apiRequest<PaginatedResponse<Category>>(API_ROUTES.CATEGORIES, { auth: true }).then((r) => r.data),
  brands: () => listWithFallback<CatalogBrand>(API_ROUTES.BRANDS, API_ROUTES.ADMIN_BRANDS),
  tags: () => listWithFallback<CatalogTag>(API_ROUTES.TAGS, API_ROUTES.ADMIN_TAGS),
  collections: () => listWithFallback<ProductCollection>(API_ROUTES.COLLECTIONS, API_ROUTES.ADMIN_COLLECTIONS),
  sizeGuides: () => listWithFallback<SizeGuide>(API_ROUTES.SIZE_GUIDES, API_ROUTES.ADMIN_SIZE_GUIDES),
  orders: () => apiRequest<PaginatedResponse<Order>>(API_ROUTES.ORDERS, { auth: true }).then((r) => r.data),
  coupons: () => apiRequest<PaginatedResponse<Coupon>>(API_ROUTES.ADMIN_COUPONS, { auth: true }).then((r) => r.data),
  payments: () => apiRequest<PaginatedResponse<Payment>>(API_ROUTES.ADMIN_PAYMENTS, { auth: true }).then((r) => r.data),
  inventoryLogs: () => apiRequest<PaginatedResponse<InventoryLog>>(API_ROUTES.ADMIN_INVENTORY_LOGS, { auth: true }).then((r) => r.data),
  branches: () => apiRequest<PaginatedResponse<Branch>>(API_ROUTES.ADMIN_BRANCHES, { auth: true }).then((r) => r.data),
  staff: () => apiRequest<PaginatedResponse<StaffUser>>(API_ROUTES.ADMIN_STAFF, { auth: true }).then((r) => r.data),
  store: () => apiRequest<SingleResponse<StoreSettings>>(API_ROUTES.STORE, { auth: true }).then((r) => r.data),
  salesReport: () => apiRequest<SingleResponse<SalesReport>>(API_ROUTES.ADMIN_SALES_REPORT, { auth: true }).then((r) => r.data),
  profitReport: () => apiRequest<SingleResponse<ProfitReport>>(API_ROUTES.ADMIN_PROFIT_REPORT, { auth: true }).then((r) => r.data),

  updateStore(payload: AdminPayload) {
    return apiRequest<SingleResponse<StoreSettings>>(API_ROUTES.ADMIN_STORE, {
      method: payload instanceof FormData ? "POST" : "PUT",
      auth: true,
      body: payload instanceof FormData ? (() => {
        payload.append("_method", "PUT");
        return payload;
      })() : bodyFor(payload),
    }).then((r) => r.data);
  },

  createProduct(payload: AdminPayload) {
    return apiRequest<SingleResponse<Product>>(API_ROUTES.ADMIN_PRODUCTS, {
      method: "POST",
      auth: true,
      body: bodyFor(payload),
    }).then((r) => r.data);
  },

  updateProduct(productId: number, payload: AdminPayload) {
    if (payload instanceof FormData) {
      payload.append("_method", "PUT");
      return apiRequest<SingleResponse<Product>>(`${API_ROUTES.ADMIN_PRODUCTS}/${productId}`, {
        method: "POST",
        auth: true,
        body: payload,
      }).then((r) => r.data);
    }

    return apiRequest<SingleResponse<Product>>(`${API_ROUTES.ADMIN_PRODUCTS}/${productId}`, {
      method: "PUT",
      auth: true,
      body: bodyFor(payload),
    }).then((r) => r.data);
  },

  deleteProduct(productId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_PRODUCTS}/${productId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  restockProduct(productId: number, payload: { quantity: number; note?: string }) {
    return apiRequest<SingleResponse<Product>>(`${API_ROUTES.ADMIN_PRODUCTS}/${productId}/restock`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  deleteProductImage(imageId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_PRODUCT_IMAGES}/${imageId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  exportProductsUrl() {
    return `${API_BASE_URL}${API_ROUTES.ADMIN_PRODUCT_EXPORT}`;
  },

  async importProducts(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest<{ success: boolean; message: string; data: { imported: number } }>(API_ROUTES.ADMIN_PRODUCT_IMPORT, {
      method: "POST",
      auth: true,
      body: formData,
    });
  },

  createBrand(payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<CatalogBrand>>(API_ROUTES.ADMIN_BRANDS, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  deleteBrand(brandId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_BRANDS}/${brandId}`, { method: "DELETE", auth: true });
  },

  createTag(payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<CatalogTag>>(API_ROUTES.ADMIN_TAGS, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  deleteTag(tagId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_TAGS}/${tagId}`, { method: "DELETE", auth: true });
  },

  createCollection(payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<ProductCollection>>(API_ROUTES.ADMIN_COLLECTIONS, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  deleteCollection(collectionId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_COLLECTIONS}/${collectionId}`, { method: "DELETE", auth: true });
  },

  createSizeGuide(payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<SizeGuide>>(API_ROUTES.ADMIN_SIZE_GUIDES, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  deleteSizeGuide(sizeGuideId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_SIZE_GUIDES}/${sizeGuideId}`, { method: "DELETE", auth: true });
  },

  async downloadProductsCsv() {
    const response = await fetch(`${API_BASE_URL}${API_ROUTES.ADMIN_PRODUCT_EXPORT}`, {
      headers: { Authorization: `Bearer ${getToken() || ""}`, Accept: "text/csv" },
    });
    if (!response.ok) throw new Error("Product export failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "products.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  },

  createCategory(payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<Category>>(API_ROUTES.ADMIN_CATEGORIES, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  updateCategory(categoryId: number, payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<Category>>(`${API_ROUTES.ADMIN_CATEGORIES}/${categoryId}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  deleteCategory(categoryId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_CATEGORIES}/${categoryId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  createCoupon(payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<Coupon>>(API_ROUTES.ADMIN_COUPONS, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  updateCoupon(couponId: number, payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<Coupon>>(`${API_ROUTES.ADMIN_COUPONS}/${couponId}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  deleteCoupon(couponId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_COUPONS}/${couponId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  updateOrderStatus(orderId: number, payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<Order>>(`/admin/orders/${orderId}/status`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  createBranch(payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<Branch>>(API_ROUTES.ADMIN_BRANCHES, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  updateBranch(branchId: number, payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<Branch>>(`${API_ROUTES.ADMIN_BRANCHES}/${branchId}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  deleteBranch(branchId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_BRANCHES}/${branchId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  createStaff(payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<StaffUser>>(API_ROUTES.ADMIN_STAFF, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  updateStaff(staffId: number, payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<StaffUser>>(`${API_ROUTES.ADMIN_STAFF}/${staffId}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },

  deleteStaff(staffId: number) {
    return apiRequest<{ success: boolean; message: string }>(`${API_ROUTES.ADMIN_STAFF}/${staffId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  updatePayment(paymentId: number, payload: Record<string, unknown>) {
    return apiRequest<SingleResponse<Payment>>(`${API_ROUTES.ADMIN_PAYMENTS}/${paymentId}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }).then((r) => r.data);
  },
};
