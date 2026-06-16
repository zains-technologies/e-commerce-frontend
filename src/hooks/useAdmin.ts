"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { authService } from "@/services/authService";
import type { AdminDashboardData } from "@/types/admin";
import type { User } from "@/types/user";

export type AdminSection = "overview" | "store" | "products" | "categories" | "orders" | "coupons" | "reviews" | "questions" | "reports" | "payments" | "shipping" | "marketing" | "newsletter" | "inventory" | "branches" | "staff" | "audit";

const emptyData: AdminDashboardData = {
  products: [],
  categories: [],
  orders: [],
  coupons: [],
  payments: [],
  inventoryLogs: [],
  branches: [],
  staff: [],
  brands: [],
  tags: [],
  collections: [],
  sizeGuides: [],
  reviews: [],
  notifications: [],
  shippingMethods: [],
  marketingBanners: [],
  newsletterSubscribers: [],
  questions: [],
  auditLogs: [],
};

let cachedAdminUser: User | null = null;

export function useAdmin(section: AdminSection = "overview") {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AdminDashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const currentUser = cachedAdminUser || await authService.me();
      if (!["admin", "manager", "staff"].includes(currentUser.role || "")) {
        throw new Error("This account does not have admin access.");
      }
      cachedAdminUser = currentUser;

      const nextData: AdminDashboardData = { ...emptyData };
      let loadedProducts = nextData.products;
      let loadedOrders = nextData.orders;
      let loadedPayments = nextData.payments;

      if (section === "overview") {
        const [salesReport, profitReport] = await Promise.all([
          adminService.salesReport().catch(() => undefined),
          adminService.profitReport().catch(() => undefined),
        ]);
        Object.assign(nextData, { salesReport, profitReport });
      }

      if (section === "store") {
        nextData.store = await adminService.store().catch(() => undefined);
      }

      if (section === "products") {
        const [products, categories, brands, tags, collections, sizeGuides] = await Promise.all([
          adminService.products(),
          adminService.categories(),
          adminService.brands().catch(() => []),
          adminService.tags().catch(() => []),
          adminService.collections().catch(() => []),
          adminService.sizeGuides().catch(() => []),
        ]);
        Object.assign(nextData, { products, categories, brands, tags, collections, sizeGuides });
        loadedProducts = products;
      }

      if (section === "categories") {
        nextData.categories = await adminService.categories();
      }

      if (section === "orders") {
        const orders = await adminService.orders();
        nextData.orders = orders;
        loadedOrders = orders;
      }

      if (section === "coupons") {
        nextData.coupons = await adminService.coupons().catch(() => []);
      }

      if (section === "reviews") {
        nextData.reviews = await adminService.reviews().catch(() => []);
      }

      if (section === "questions") {
        nextData.questions = await adminService.questions().catch(() => []);
      }

      if (section === "reports") {
        const [salesReport, profitReport] = await Promise.all([
          adminService.salesReport().catch(() => undefined),
          adminService.profitReport().catch(() => undefined),
        ]);
        Object.assign(nextData, { salesReport, profitReport });
      }

      if (section === "payments") {
        const payments = await adminService.payments().catch(() => []);
        nextData.payments = payments;
        loadedPayments = payments;
      }

      if (section === "shipping") {
        nextData.shippingMethods = await adminService.shippingMethods().catch(() => []);
      }

      if (section === "marketing") {
        nextData.marketingBanners = await adminService.marketingBanners().catch(() => []);
      }

      if (section === "newsletter") {
        nextData.newsletterSubscribers = await adminService.newsletterSubscribers().catch(() => []);
      }

      if (section === "inventory") {
        const [products, inventoryLogs] = await Promise.all([
          adminService.products(),
          adminService.inventoryLogs().catch(() => []),
        ]);
        Object.assign(nextData, { products, inventoryLogs });
        loadedProducts = products;
      }

      if (section === "branches") {
        nextData.branches = await adminService.branches().catch(() => []);
      }

      if (section === "staff") {
        nextData.staff = await adminService.staff().catch(() => []);
      }

      if (section === "audit") {
        nextData.auditLogs = await adminService.auditLogs().catch(() => []);
      }

      const [notificationProducts, notificationOrders, notificationPayments, notifications] = await Promise.all([
        loadedProducts.length ? Promise.resolve(loadedProducts) : adminService.products().catch(() => []),
        loadedOrders.length ? Promise.resolve(loadedOrders) : adminService.orders().catch(() => []),
        loadedPayments.length ? Promise.resolve(loadedPayments) : adminService.payments().catch(() => []),
        adminService.notifications().catch(() => []),
      ]);
      if (section === "overview") {
        nextData.products = notificationProducts;
        nextData.orders = notificationOrders;
      }
      nextData.notificationProducts = notificationProducts;
      nextData.notificationOrders = notificationOrders;
      nextData.notificationPayments = notificationPayments;
      nextData.notifications = notifications;

      setUser(currentUser);
      setData(nextData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin data failed to load");
    } finally {
      setLoading(false);
    }
  }, [section]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  return { user, data, loading, refreshing, error, refresh };
}
