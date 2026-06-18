"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, ComponentType, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FolderTree,
  Gauge,
  Home,
  Layers3,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Package,
  Percent,
  ScrollText,
  Truck,
  RefreshCw,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { AdminCard, AdminTable, ConfirmDialog, Drawer, MetricCard, ToastMessage } from "@/components/admin/AdminPrimitives";
import { Button } from "@/components/common/Button";
import { Dropdown } from "@/components/common/Dropdown";
import { Input } from "@/components/common/Input";
import { EmptyState, ErrorState } from "@/components/common/StateBlock";
import { useAdmin, type AdminSection } from "@/hooks/useAdmin";
import { cn, formatCurrency, getPrimaryImage } from "@/lib/utils";
import { adminService } from "@/services/adminService";
import { authService } from "@/services/authService";
import type { Branch, Coupon, Order, Payment, StaffUser, StoreSettings } from "@/types/admin";
import type { Category } from "@/types/category";
import type { CatalogBrand, CatalogTag, Product, ProductCollection, ProductColor, ProductQuestion, ProductVariant, SizeGuide } from "@/types/product";
import type { MarketingBanner, NewsletterSubscriber, ShippingMethod } from "@/types/marketing";
import rawMenuItems from "./menu.json";

type Tab = AdminSection;
type IconName = "Building2" | "ChartNoAxesCombined" | "CreditCard" | "FolderTree" | "Gauge" | "Layers3" | "Mail" | "Megaphone" | "MessageSquare" | "Package" | "Percent" | "ScrollText" | "ShoppingBag" | "Store" | "Truck" | "Users";
type MenuItem = { key: Tab; name: string; path: string; icon: IconName; description: string };

const menuItems = rawMenuItems as MenuItem[];
const tabs = menuItems.map((item) => item.key);
const tabLabels = Object.fromEntries(menuItems.map((item) => [item.key, item.name])) as Record<Tab, string>;
const tabHref = Object.fromEntries(menuItems.map((item) => [item.key, item.path])) as Record<Tab, string>;
const tabDescriptions = Object.fromEntries(menuItems.map((item) => [item.key, item.description])) as Record<Tab, string>;
const iconMap: Record<IconName, ComponentType<{ className?: string }>> = {
  Building2,
  ChartNoAxesCombined,
  CreditCard,
  FolderTree,
  Gauge,
  Layers3,
  Mail,
  Megaphone,
  MessageSquare,
  Package,
  Percent,
  ScrollText,
  ShoppingBag,
  Store,
  Truck,
  Users,
};

function MenuIcon({ item, className }: { item: Tab; className?: string }) {
  const menuItem = menuItems.find((menuEntry) => menuEntry.key === item);
  const Icon = menuItem ? iconMap[menuItem.icon] : Gauge;

  return <Icon className={className} />;
}

type ProductDraft = {
  id?: number;
  category_id: string;
  brand_id: string;
  size_guide_id: string;
  name: string;
  slug: string;
  description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  price: string;
  cost_price: string;
  sku: string;
  stock_quantity: string;
  status: string;
  is_featured: boolean;
  tag_ids: number[];
  collection_ids: number[];
  color_ids: number[];
  related_product_ids: number[];
  specifications_text: string;
  variant_rows: ProductVariantDraft[];
};

type ProductVariantDraft = {
  id: string;
  size: string;
  color_id: string;
  sku: string;
  price_adjustment: string;
  stock_quantity: string;
};

type CategoryDraft = {
  id?: number;
  is_parent: boolean;
  parent_id: string;
  sort_order: string;
  name: string;
  slug: string;
  description: string;
  image_path: string;
  banner_path: string;
  is_active: boolean;
};

type CouponDraft = {
  id?: number;
  code: string;
  type: "percentage" | "fixed";
  value: string;
  starts_at: string;
  ends_at: string;
  usage_limit: string;
  is_active: boolean;
};

type BranchDraft = {
  id?: number;
  name: string;
  phone: string;
  address: string;
  is_active: boolean;
};

type StaffDraft = {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "staff";
  permissions: string[];
  password: string;
};

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  tone: "warning" | "info" | "success";
  tab: Tab;
};

type StoreDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  domain: string;
  custom_domain: string;
  plan: "simple" | "mid" | "pro";
  primary: string;
  secondary: string;
  accent: string;
  delivery_fee: string;
  notice_enabled: boolean;
  notice_message: string;
  notice_coupon_code: string;
  notice_href: string;
};

type RestockDraft = {
  product?: Product;
  variant_id: string;
  quantity: string;
  type: "restock" | "adjustment" | "damage" | "return";
  note: string;
};

type CatalogQuickDraft = {
  brand: string;
  tag: string;
  collection: string;
  color: string;
  colorHex: string;
  sizeGuide: string;
};

type ShippingDraft = {
  id?: number;
  name: string;
  code: string;
  description: string;
  fee: string;
  min_order_total: string;
  sort_order: string;
  is_active: boolean;
};

type BannerDraft = {
  id?: number;
  title: string;
  subtitle: string;
  current_image_url: string;
  link_url: string;
  position: string;
  starts_at: string;
  ends_at: string;
  sort_order: string;
  is_active: boolean;
};

const emptyProduct: ProductDraft = {
  category_id: "1",
  brand_id: "",
  size_guide_id: "",
  name: "",
  slug: "",
  description: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  price: "",
  cost_price: "",
  sku: "",
  stock_quantity: "",
  status: "active",
  is_featured: false,
  tag_ids: [],
  collection_ids: [],
  color_ids: [],
  related_product_ids: [],
  specifications_text: "",
  variant_rows: [],
};
const emptyCategory: CategoryDraft = { is_parent: true, parent_id: "", sort_order: "0", name: "", slug: "", description: "", image_path: "", banner_path: "", is_active: true };
const emptyCoupon: CouponDraft = { code: "", type: "percentage", value: "10", starts_at: "", ends_at: "", usage_limit: "50", is_active: true };
const emptyBranch: BranchDraft = { name: "", phone: "", address: "", is_active: true };
const emptyStaff: StaffDraft = { name: "", email: "", phone: "", role: "staff", permissions: ["products.view", "orders.view"], password: "password" };
const emptyStore: StoreDraft = { name: "", email: "", phone: "", address: "", currency: "LKR", domain: "localhost", custom_domain: "", plan: "simple", primary: "#111111", secondary: "#d8dfcc", accent: "#ef4444", delivery_fee: "0", notice_enabled: false, notice_message: "", notice_coupon_code: "", notice_href: "/products" };
const emptyRestock: RestockDraft = { variant_id: "", quantity: "10", type: "restock", note: "Manual restock from admin panel" };
const emptyCatalogQuick: CatalogQuickDraft = { brand: "", tag: "", collection: "", color: "", colorHex: "#111111", sizeGuide: "" };
const emptyShipping: ShippingDraft = { name: "", code: "", description: "", fee: "0", min_order_total: "", sort_order: "0", is_active: true };
const emptyBanner: BannerDraft = { title: "", subtitle: "", current_image_url: "", link_url: "/products", position: "home_hero", starts_at: "", ends_at: "", sort_order: "0", is_active: true };
const planOptions = [{ label: "Simple", value: "simple" }, { label: "Mid", value: "mid" }, { label: "Pro", value: "pro" }];
const productStatusOptions = [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }, { label: "Draft", value: "draft" }];
const couponTypeOptions = [{ label: "Percentage", value: "percentage" }, { label: "Fixed", value: "fixed" }];
const orderStatusOptions = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"].map((status) => ({ label: titleCase(status), value: status }));
const paymentStatusOptions = ["pending", "paid", "failed", "refunded"].map((status) => ({ label: titleCase(status), value: status }));
const staffRoleOptions = [{ label: "Admin", value: "admin" }, { label: "Manager", value: "manager" }, { label: "Staff", value: "staff" }];
const inventoryTypeOptions = ["restock", "adjustment", "damage", "return"].map((value) => ({ label: titleCase(value), value }));
const staffPermissionOptions = ["products.view", "products.update", "orders.view", "orders.update", "reports.view", "inventory.update"].map((value) => ({ label: value, value }));
const pageSizeOptions = [12, 24, 48].map((size) => ({ label: String(size), value: String(size) }));
const bannerPositionOptions = ["home_hero", "promo", "notice", "category", "product"].map((value) => ({ label: titleCase(value), value }));
const subscriberStatusOptions = ["subscribed", "unsubscribed", "bounced"].map((value) => ({ label: titleCase(value), value }));
const variantSizeValues = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One size"];
const sizeVariantOptions = ["", ...variantSizeValues].map((value) => ({ label: value || "Choose size", value }));

export default function AdminPage() {
  return <AdminShell initialTab="overview" />;
}

export function AdminShell({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const tab = initialTab;
  const { user, data, loading, refreshing, error, refresh } = useAdmin(tab);
  const [message, setMessage] = useState<{ text: string; tone: "success" | "error" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const revenue = data.salesReport?.total_revenue || data.orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = data.orders.filter((order) => order.status === "pending").length;
  const lowStock = data.products.filter((product) => product.low_stock || product.stock_quantity <= 10).length;
  const notifications = useMemo(() => buildAdminNotifications(data), [data]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.products.filter((product) => !query || [product.name, product.sku, product.category?.name].some((value) => value?.toLowerCase().includes(query)));
  }, [data.products, search]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await action();
      setMessage({ text: success, tone: "success" });
      await refresh();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Admin action failed", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await authService.logout();
    window.location.href = "/login";
  }

  if (error) {
    return (
      <main className="container-shell grid min-h-screen place-items-center py-10">
        <div className="w-full max-w-lg">
          <ErrorState message={error} />
          <Link href="/login"><Button className="mt-5">Login as admin</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-black">
      <div className={cn("grid min-h-screen transition-[grid-template-columns] duration-300 ease-out", sidebarCollapsed ? "lg:grid-cols-[96px_1fr]" : "lg:grid-cols-[280px_1fr]")}>
        <aside className="relative hidden border-r border-neutral-200 bg-white lg:flex lg:flex-col">
          <button
            type="button"
            className="absolute -right-4 top-24 z-50 grid size-8 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:border-black hover:text-black"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
          <div className={cn("border-b border-neutral-100 py-5 transition-all duration-300", sidebarCollapsed ? "px-0" : "px-6")}>
            <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
              <Link href="/admin" className={cn("grid shrink-0 place-items-center bg-black text-white transition-all duration-300", sidebarCollapsed ? "size-14 rounded-[22px]" : "size-11 rounded-2xl")}>
                <ShoppingBag className="size-5" />
              </Link>
              <Link href="/admin" className={cn("min-w-0 overflow-hidden transition-all duration-300", sidebarCollapsed ? "w-0 opacity-0" : "w-44 opacity-100")}>
                <span className="block text-sm font-black uppercase tracking-wide">ECOMMERCE</span>
                <span className="text-xs text-neutral-500">Commerce control panel</span>
              </Link>
            </div>
          </div>
          <nav className={cn("flex-1 overflow-y-auto py-5 transition-all duration-300", sidebarCollapsed ? "space-y-3 px-0" : "space-y-1 px-4")}>
            {tabs.map((item) => (
              <Link
                key={item}
                href={tabHref[item]}
                className={cn(
                  "flex items-center gap-3 rounded-2xl text-sm font-bold text-neutral-600 transition-all duration-200 hover:bg-neutral-100 hover:text-black",
                  sidebarCollapsed ? "mx-auto size-14 justify-center p-0" : "px-4 py-3",
                  tab === item && "bg-black text-white hover:bg-black hover:text-white",
                )}
                title={sidebarCollapsed ? tabLabels[item] : undefined}
              >
                <MenuIcon item={item} className={cn("shrink-0", sidebarCollapsed ? "size-5" : "size-4")} />
                <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", sidebarCollapsed ? "w-0 opacity-0" : "w-40 opacity-100")}>{tabLabels[item]}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-neutral-100 p-4">
            <div className={cn("overflow-hidden rounded-[24px] bg-[#d8dfcc] transition-all duration-300", sidebarCollapsed ? "max-h-0 p-0 opacity-0" : "max-h-40 p-4 opacity-100")}>
              <p className="text-xs font-bold uppercase text-black/60">Active workspace</p>
              <p className="mt-2 text-lg font-black">{data.store?.name || "Platform Admin"}</p>
              <p className="mt-1 text-xs text-black/60">Plan-based ecommerce backend</p>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
            <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/admin" className="grid size-10 place-items-center rounded-2xl bg-black text-white lg:hidden">
                  <ShoppingBag className="size-5" />
                </Link>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase text-neutral-500">Admin workspace</p>
                  <h1 className="truncate text-2xl font-medium tracking-[-0.05em]">{tabLabels[tab]}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-neutral-500 md:inline">{user ? `${user.name} · ${user.role}` : "Platform Admin"}</span>
                <NotificationBell
                  open={notificationsOpen}
                  notifications={notifications}
                  onToggle={() => setNotificationsOpen((value) => !value)}
                  onSelect={(nextTab) => {
                    router.push(tabHref[nextTab]);
                    setNotificationsOpen(false);
                  }}
                />
                <Link href="/products" className="hidden h-10 items-center rounded-full border border-neutral-200 bg-white px-4 text-xs font-bold uppercase hover:border-black md:inline-flex">
                  <Home className="mr-2 size-4" />
                  Storefront
                </Link>
                <Button variant="outline" className="h-10 px-4" onClick={logout}>
                  <LogOut className="mr-2 size-4" />
                  Logout
                </Button>
              </div>
            </div>
            <nav className="hide-scrollbar flex gap-2 overflow-x-auto border-t border-neutral-100 px-4 py-2 lg:hidden">
              {tabs.map((item) => (
                <Link key={item} href={tabHref[item]} className={cn("flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase", tab === item ? "bg-black text-white" : "bg-neutral-100 text-neutral-600")}>
                  <MenuIcon item={item} className="size-4" />
                  {tabLabels[item]}
                </Link>
              ))}
            </nav>
          </header>

          <div className="flex-1 space-y-6 px-4 py-6 md:px-6 xl:px-8">
            <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-neutral-200 bg-white p-5 md:flex-row md:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase text-neutral-500">{tab === "overview" ? "Command center" : "Management"}</p>
                <h2 className="mt-2 text-4xl font-medium tracking-[-0.07em]">{tabLabels[tab]}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">{tabDescriptions[tab]}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button variant="outline" className="h-10 px-5" onClick={() => exportAdminCsv(tab, data)}>Export CSV</Button>
                <Button variant="outline" className="h-10 px-5" onClick={() => exportAdminExcel(tab, data)}>Excel</Button>
                <Button variant="outline" className="h-10 px-5" onClick={() => exportAdminPdf(tab, data)}>PDF</Button>
                <Button variant="outline" className="h-10 px-5" disabled={refreshing} onClick={refresh}>
                  <RefreshCw className={cn("mr-2 size-4", refreshing && "animate-spin")} />
                  {refreshing ? "Refreshing" : "Refresh"}
                </Button>
              </div>
            </div>

          {message && <ToastMessage message={message.text} tone={message.tone} onClose={() => setMessage(null)} />}

          {loading ? (
            <AdminContentLoader title={tabLabels[tab]} />
          ) : (
            <>
              {tab === "overview" && (
                <OverviewPanel revenue={revenue} pendingOrders={pendingOrders} lowStock={lowStock} data={data} />
              )}

              {tab === "store" && (
                <StorePanel store={data.store} busy={busy} run={run} />
              )}

              {tab === "products" && (
                <ProductPanel
                  products={filteredProducts}
                  categories={data.categories}
                  brands={data.brands || []}
                  tags={data.tags || []}
                  collections={data.collections || []}
                  colors={data.colors || []}
                  sizeGuides={data.sizeGuides || []}
                  allProducts={data.products}
                  busy={busy}
                  search={search}
                  setSearch={setSearch}
                  run={run}
                />
              )}

              {tab === "categories" && (
                <CategoryPanel categories={data.categories} busy={busy} run={run} />
              )}

              {tab === "orders" && (
                <OrderPanel orders={data.orders} busy={busy} run={run} />
              )}

              {tab === "coupons" && (
                <CouponPanel coupons={data.coupons} busy={busy} run={run} />
              )}

              {tab === "reviews" && (
                <ReviewsPanel reviews={data.reviews || []} busy={busy} run={run} />
              )}

              {tab === "questions" && (
                <QuestionsPanel questions={data.questions || []} busy={busy} run={run} />
              )}

              {tab === "reports" && (
                <ReportsPanel data={data} />
              )}

              {tab === "payments" && (
                <PaymentsPanel payments={data.payments} busy={busy} run={run} />
              )}

              {tab === "shipping" && (
                <ShippingPanel methods={data.shippingMethods || []} busy={busy} run={run} />
              )}

              {tab === "marketing" && (
                <MarketingPanel banners={data.marketingBanners || []} busy={busy} run={run} />
              )}

              {tab === "newsletter" && (
                <NewsletterPanel subscribers={data.newsletterSubscribers || []} busy={busy} run={run} />
              )}

              {tab === "inventory" && (
                <InventoryPanel products={data.products} logs={data.inventoryLogs} busy={busy} run={run} />
              )}

              {tab === "branches" && (
                <BranchPanel branches={data.branches} busy={busy} run={run} />
              )}

              {tab === "staff" && (
                <StaffPanel staff={data.staff} busy={busy} run={run} />
              )}

              {tab === "audit" && (
                <AuditPanel logs={data.auditLogs || []} />
              )}
            </>
          )}
          </div>

          <footer className="border-t border-neutral-200 bg-white px-4 py-5 md:px-6 xl:px-8">
            <div className="flex flex-col justify-between gap-2 text-xs text-neutral-500 md:flex-row md:items-center">
              <p>© {new Date().getFullYear()} All rights reserved.</p>
              <p>
                Built by{" "}
                <a className="font-bold text-black hover:text-neutral-600" href="https://www.mintboxstudio.com/" target="_blank" rel="noreferrer">
                  MintBox.Studio
                </a>
              </p>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}

function OverviewPanel({ revenue, pendingOrders, lowStock, data }: { revenue: number; pendingOrders: number; lowStock: number; data: ReturnType<typeof useAdmin>["data"] }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Revenue" value={formatCurrency(revenue)} helper="Sales report total" />
        <MetricCard label="Orders" value={data.orders.length} helper={`${pendingOrders} pending`} />
        <MetricCard label="Products" value={data.products.length} helper={`${lowStock} low stock`} />
        <MetricCard label="Profit" value={formatCurrency(data.profitReport?.total_profit || 0)} helper="Pro plan report" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <AdminCard>
          <PanelTitle title="Sales trend" subtitle="Revenue by date from the Laravel reports endpoint." />
          <SalesAreaChart rows={(data.salesReport?.sales_by_date || []).map((row) => ({ label: row.date, revenue: Number(row.revenue), orders: Number(row.orders) }))} />
        </AdminCard>
        <AdminCard>
          <PanelTitle title="Best sellers" subtitle="Top products by quantity sold." />
          <BestSellerChart rows={(data.salesReport?.best_selling_products || []).map((item) => ({ label: item.product_name, quantity: Number(item.quantity_sold), revenue: Number(item.revenue) }))} />
        </AdminCard>
      </div>
      <AdminCard>
        <h2 className="mb-4 text-2xl font-medium tracking-[-0.04em]">Recent orders</h2>
        <OrderTable orders={data.orders.slice(0, 6)} />
      </AdminCard>
    </>
  );
}

function AdminContentLoader({ title }: { title: string }) {
  return (
    <div className="grid gap-4">
      <AdminCard>
        <div className="flex items-center gap-3">
          <span className="size-3 animate-pulse rounded-full bg-black" />
          <p className="text-sm font-bold text-neutral-600">Loading {title.toLowerCase()}...</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-[24px] bg-neutral-100" />
          ))}
        </div>
      </AdminCard>
      <AdminCard>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

function NotificationBell({
  open,
  notifications,
  onToggle,
  onSelect,
}: {
  open: boolean;
  notifications: AdminNotification[];
  onToggle: () => void;
  onSelect: (tab: Tab) => void;
}) {
  const count = notifications.length;

  return (
    <div className="relative">
      <button
        type="button"
        className="relative grid size-11 place-items-center rounded-full border border-neutral-200 bg-white text-black hover:border-black hover:bg-neutral-50"
        onClick={onToggle}
        aria-label="Open notifications"
      >
        <BellIcon />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      {open && (
        <div className="animate-pop-in absolute right-0 top-13 z-50 w-[min(92vw,390px)] overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase text-neutral-500">Notifications</p>
              <h2 className="mt-1 text-2xl font-medium tracking-[-0.05em]">{count ? `${count} needs attention` : "All clear"}</h2>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold uppercase text-neutral-500">Live</span>
          </div>
          <div className="max-h-[430px] overflow-y-auto p-2">
            {count === 0 ? (
              <div className="p-6 text-sm text-neutral-500">No low stock, order, or payment alerts right now.</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className="flex w-full gap-3 rounded-[22px] p-3 text-left hover:bg-neutral-50"
                  onClick={() => onSelect(notification.tab)}
                >
                  <span className={`mt-1 grid size-9 shrink-0 place-items-center rounded-full ${notification.tone === "warning" ? "bg-red-50 text-red-600" : notification.tone === "success" ? "bg-green-50 text-green-700" : "bg-neutral-100 text-black"}`}>
                    {notification.tone === "warning" ? <AlertIcon /> : notification.tone === "success" ? <CheckIcon /> : <BellIcon />}
                  </span>
                  <span>
                    <span className="block text-sm font-black">{notification.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-neutral-500">{notification.message}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StorePanel({ store, busy, run }: { store?: StoreSettings; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<StoreDraft>(emptyStore);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateStoreDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await run(() => adminService.updateStore(storePayload(draft)), "Store settings updated.");
    setDrawerOpen(false);
  }

  if (!store) {
    return (
      <AdminCard>
        <EmptyState message="Store settings were not returned by the API yet." />
      </AdminCard>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Tenant" value={store.name} helper="Reusable store identity" />
        <MetricCard label="Plan" value={store.plan.toUpperCase()} helper="Feature toggle source" />
        <MetricCard label="Currency" value={store.currency} helper="Storefront pricing" />
        <MetricCard label="Domain" value={store.custom_domain || store.domain || "Not set"} helper="Current tenant domain" />
      </div>
      <AdminCard>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <PanelTitle title="Tenant settings" subtitle="Brand-independent store profile, plan, domain, contact, and theme settings." />
          <Button type="button" onClick={() => { setDraft(storeDraftFromStore(store)); setDrawerOpen(true); }}>Edit store</Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoBlock label="Contact" value={[store.contact?.email, store.contact?.phone, store.contact?.address].filter(Boolean).join(" · ") || "-"} />
          <InfoBlock label="Theme" value={`${store.theme?.primary || "#111111"} / ${store.theme?.secondary || "#d8dfcc"} / ${store.theme?.accent || "#ef4444"}`} />
          <InfoBlock label="Delivery Fee" value={formatCurrency(Number(store.settings?.delivery_fee || 0))} />
        </div>
      </AdminCard>
      <Drawer open={drawerOpen} title="Edit store settings" subtitle="These settings identify the current tenant and control plan-based features." onClose={() => setDrawerOpen(false)}>
        <form onSubmit={submit} className="grid gap-3">
          <Input required placeholder="Store name" value={draft.name} error={errors.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Email" type="email" value={draft.email} error={errors.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <Input placeholder="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </div>
          <Input placeholder="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input required placeholder="Currency" value={draft.currency} error={errors.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value.toUpperCase() })} />
            <Dropdown value={draft.plan} options={planOptions} onChange={(value) => setDraft({ ...draft, plan: value as StoreDraft["plan"] })} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Default domain" value={draft.domain} error={errors.domain} onChange={(e) => setDraft({ ...draft, domain: e.target.value })} />
            <Input placeholder="Custom domain" value={draft.custom_domain} error={errors.custom_domain} onChange={(e) => setDraft({ ...draft, custom_domain: e.target.value })} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <ColorInput label="Primary" value={draft.primary} onChange={(value) => setDraft({ ...draft, primary: value })} />
            <ColorInput label="Secondary" value={draft.secondary} onChange={(value) => setDraft({ ...draft, secondary: value })} />
            <ColorInput label="Accent" value={draft.accent} onChange={(value) => setDraft({ ...draft, accent: value })} />
          </div>
          <Input placeholder="Delivery fee" type="number" value={draft.delivery_fee} error={errors.delivery_fee} onChange={(e) => setDraft({ ...draft, delivery_fee: e.target.value })} />
          <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4">
            <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm">
              <input type="checkbox" checked={draft.notice_enabled} onChange={(e) => setDraft({ ...draft, notice_enabled: e.target.checked })} />
              Enable customer website notice
            </label>
            <div className="mt-3 grid gap-3">
              <Input placeholder="Notice message, e.g. Use coupon 000102 for 5% discount for jewellery" value={draft.notice_message} onChange={(e) => setDraft({ ...draft, notice_message: e.target.value })} />
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Coupon code" value={draft.notice_coupon_code} onChange={(e) => setDraft({ ...draft, notice_coupon_code: e.target.value.toUpperCase() })} />
                <Input placeholder="Notice link, e.g. /products" value={draft.notice_href} onChange={(e) => setDraft({ ...draft, notice_href: e.target.value })} />
              </div>
            </div>
            {draft.notice_enabled && draft.notice_message && (
              <div className="mt-4 overflow-hidden rounded-2xl bg-black py-3 text-white">
                <div className="flex min-w-max animate-notice-marquee gap-8 text-xl font-black uppercase tracking-wide">
                  {[1, 2, 3].map((item) => (
                    <span key={item} className="whitespace-nowrap">
                      {draft.notice_message}{draft.notice_coupon_code ? ` · Code ${draft.notice_coupon_code}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button disabled={busy}>{busy ? "Saving..." : "Save store"}</Button>
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

function ProductPanel({ products, categories, brands, tags, collections, colors, sizeGuides, allProducts, busy, search, setSearch, run }: {
  products: Product[];
  categories: Category[];
  brands: CatalogBrand[];
  tags: CatalogTag[];
  collections: ProductCollection[];
  colors: ProductColor[];
  sizeGuides: SizeGuide[];
  allProducts: Product[];
  busy: boolean;
  search: string;
  setSearch: (value: string) => void;
  run: (action: () => Promise<unknown>, success: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewer, setViewer] = useState<{ src: string; label: string } | null>(null);
  const [pendingImageDelete, setPendingImageDelete] = useState<{ id: number; label: string } | null>(null);
  const [catalogDraft, setCatalogDraft] = useState<CatalogQuickDraft>(emptyCatalogQuick);
  const [pendingCatalogDelete, setPendingCatalogDelete] = useState<{ type: "brand" | "tag" | "collection" | "color" | "sizeGuide"; id: number; label: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const editing = Boolean(draft.id);
  const editingProduct = products.find((product) => product.id === draft.id);
  const imagePreviews = useMemo(() => imageFiles.map((file) => URL.createObjectURL(file)), [imageFiles]);
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paginatedProducts = useMemo(() => products.slice((safePage - 1) * pageSize, safePage * pageSize), [products, safePage, pageSize]);

  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  function edit(product: Product) {
    setImageFiles([]);
    setImageError("");
    setErrors({});
    setDraft({
      id: product.id,
      category_id: String(product.category?.id || categories[0]?.id || 1),
      brand_id: product.brand?.id ? String(product.brand.id) : "",
      size_guide_id: product.size_guide?.id ? String(product.size_guide.id) : "",
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      seo_title: product.seo?.title || "",
      seo_description: product.seo?.description || "",
      seo_keywords: product.seo?.keywords || "",
      price: String(product.price),
      cost_price: String(product.cost_price || 0),
      sku: product.sku || "",
      stock_quantity: String(product.stock_quantity),
      status: product.status || "active",
      is_featured: Boolean(product.is_featured),
      tag_ids: (product.tags || []).map((tag) => tag.id),
      collection_ids: (product.collections || []).map((collection) => collection.id),
      color_ids: (product.colors || []).map((color) => color.id),
      related_product_ids: (product.related_products || []).map((related) => related.id),
      specifications_text: (product.specifications || []).map((specification) => `${specification.name}: ${specification.value || ""}`).join("\n"),
      variant_rows: (product.variants || []).map((item) => variantToDraft(item, colors)),
    });
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing && imageFiles.length < 3) {
      setImageError("Please upload at least 3 product images.");
      return;
    }
    if (imageFiles.length > 0 && imageFiles.length < 3) {
      setImageError("Image updates need 3 to 5 images.");
      return;
    }
    if (imageFiles.length > 5) {
      setImageError("You can upload a maximum of 5 images.");
      return;
    }
    const nextErrors = validateProductDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await run(
      async () => {
        const payload = imageFiles.length ? productFormData(draft, imageFiles, colors) : productPayload(draft, colors);
        if (editing && draft.id) {
          const oldImages = imageFiles.length ? editingProduct?.images || [] : [];
          const updatedProduct = await adminService.updateProduct(draft.id, payload);
          if (oldImages.length) {
            await Promise.all(oldImages.map((image) => adminService.deleteProductImage(image.id).catch(() => null)));
          }
          return updatedProduct;
        }
        return adminService.createProduct(payload);
      },
      editing ? "Product updated." : "Product created.",
    );
    setDraft(emptyProduct);
    setImageFiles([]);
    setImageError("");
    setErrors({});
    setDrawerOpen(false);
  }

  function openCreate() {
    setDraft({ ...emptyProduct, category_id: String(categories[0]?.id || 1) });
    setImageFiles([]);
    setImageError("");
    setErrors({});
    setDrawerOpen(true);
  }

  function removeSelectedImage(index: number) {
    setImageFiles((files) => {
      const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
      setImageError(nextFiles.length > 0 && nextFiles.length < 3 ? "Please choose at least 3 images." : "");
      return nextFiles;
    });
  }

  function createCatalogItem(type: "brand" | "tag" | "collection" | "color" | "sizeGuide") {
    const value = catalogDraft[type].trim();
    if (!value) return;
    const payload = { name: value };
    const actions = {
      brand: () => adminService.createBrand(payload),
      tag: () => adminService.createTag(payload),
      collection: () => adminService.createCollection(payload),
      color: () => adminService.createColor({ name: value, hex_code: normalizeHex(catalogDraft.colorHex) }),
      sizeGuide: () => adminService.createSizeGuide({ name: value, rows: [], is_active: true }),
    };

    void run(actions[type], `${titleCase(type === "sizeGuide" ? "size guide" : type)} created.`);
    setCatalogDraft((current) => ({ ...current, [type]: "" }));
  }

  function deleteCatalogItem() {
    if (!pendingCatalogDelete) return;
    const actions = {
      brand: () => adminService.deleteBrand(pendingCatalogDelete.id),
      tag: () => adminService.deleteTag(pendingCatalogDelete.id),
      collection: () => adminService.deleteCollection(pendingCatalogDelete.id),
      color: () => adminService.deleteColor(pendingCatalogDelete.id),
      sizeGuide: () => adminService.deleteSizeGuide(pendingCatalogDelete.id),
    };
    const typeLabel = pendingCatalogDelete.type === "sizeGuide" ? "Size guide" : titleCase(pendingCatalogDelete.type);
    setPendingCatalogDelete(null);
    void run(actions[pendingCatalogDelete.type], `${typeLabel} deleted.`);
  }

  function importProducts(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void run(() => adminService.importProducts(file), "Product CSV imported.");
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Product CRUD" subtitle="Create, update, delete, and inspect product images from the API." />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => run(() => adminService.downloadProductsCsv(), "Product CSV downloaded.")}>Export CSV</Button>
          <label className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-neutral-300 px-6 text-xs font-bold uppercase hover:border-black">
            Import CSV
            <input className="sr-only" type="file" accept=".csv,text/csv" onChange={importProducts} />
          </label>
          <Button type="button" onClick={openCreate}>Add product</Button>
        </div>
      </div>
      <CatalogSetupPanel
        brands={brands}
        tags={tags}
        collections={collections}
        colors={colors}
        sizeGuides={sizeGuides}
        draft={catalogDraft}
        setDraft={setCatalogDraft}
        createItem={createCatalogItem}
        requestDelete={setPendingCatalogDelete}
      />
      <Drawer open={drawerOpen} size="wide" title={editing ? "Edit product" : "Add product"} subtitle="Upload 3 to 5 product images. Selecting new files while editing replaces the current images." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-5 pb-20">
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-4">
            <DrawerSection title="Product basics">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Dropdown value={draft.category_id} options={categoryOptions(categories)} placeholder="Select category" onChange={(value) => setDraft({ ...draft, category_id: value })} />
                  {errors.category_id && <p className="mt-1.5 px-4 text-xs font-bold text-red-600">{errors.category_id}</p>}
                </div>
                <Dropdown value={draft.brand_id} options={[{ label: "No brand", value: "" }, ...brands.map((brand) => ({ label: brand.name, value: String(brand.id) }))]} placeholder="Select brand" onChange={(value) => setDraft({ ...draft, brand_id: value })} />
                <Input required placeholder="Product name" value={draft.name} error={errors.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                <Input required placeholder="Slug" value={draft.slug} error={errors.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
                <Input placeholder="SKU" value={draft.sku} error={errors.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
                <Dropdown value={draft.status} options={productStatusOptions} onChange={(value) => setDraft({ ...draft, status: value })} />
              </div>
              <textarea className="mt-3 min-h-24 w-full rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <label className="mt-3 flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm">
                <input type="checkbox" checked={draft.is_featured} onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })} />
                Featured product
              </label>
            </DrawerSection>

            <DrawerSection title="Pricing and stock">
              <div className="grid gap-3 md:grid-cols-3">
                <Input required placeholder="Base price" type="number" value={draft.price} error={errors.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
                <Input placeholder="Cost price" type="number" value={draft.cost_price} error={errors.cost_price} onChange={(e) => setDraft({ ...draft, cost_price: e.target.value })} />
                <Input required placeholder={draft.variant_rows.length ? "Auto from variants" : "Stock quantity"} type="number" value={draft.stock_quantity} error={errors.stock_quantity} onChange={(e) => setDraft({ ...draft, stock_quantity: e.target.value })} />
              </div>
              {draft.variant_rows.length ? <p className="mt-2 text-xs text-neutral-500">Product stock will be calculated from variant stock when saved.</p> : null}
            </DrawerSection>

            <DrawerSection title="Catalog setup">
              <div className="grid gap-3">
                <Dropdown value={draft.size_guide_id} options={[{ label: "No size guide", value: "" }, ...sizeGuides.map((guide) => ({ label: guide.name, value: String(guide.id) }))]} placeholder="Select size guide" onChange={(value) => setDraft({ ...draft, size_guide_id: value })} />
                <CatalogMultiSelect title="Tags" items={tags} selected={draft.tag_ids} onChange={(tag_ids) => setDraft({ ...draft, tag_ids })} />
                <CatalogMultiSelect title="Collections" items={collections} selected={draft.collection_ids} onChange={(collection_ids) => setDraft({ ...draft, collection_ids })} />
                <ColorMultiSelect colors={colors} selected={draft.color_ids} onChange={(color_ids) => setDraft({ ...draft, color_ids })} />
                <CatalogMultiSelect title="Related products" items={allProducts.filter((item) => item.id !== draft.id)} selected={draft.related_product_ids} onChange={(related_product_ids) => setDraft({ ...draft, related_product_ids })} />
              </div>
            </DrawerSection>

            <DrawerSection title="Specifications">
              <textarea
                className="min-h-28 w-full rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black"
                placeholder={"Specifications, one per line\nFabric: Cotton\nFit: Regular"}
                value={draft.specifications_text}
                onChange={(e) => setDraft({ ...draft, specifications_text: e.target.value })}
              />
            </DrawerSection>

            <DrawerSection title="Variants" className="overflow-visible">
              <VariantBuilder basePrice={Number(draft.price || 0)} colors={colors} rows={draft.variant_rows} onChange={(variant_rows) => setDraft({ ...draft, variant_rows })} />
            </DrawerSection>

            <DrawerSection title="SEO">
              <div className="grid gap-3">
                <Input placeholder="SEO title" value={draft.seo_title} onChange={(e) => setDraft({ ...draft, seo_title: e.target.value })} />
                <textarea className="min-h-20 rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black" placeholder="SEO description" value={draft.seo_description} onChange={(e) => setDraft({ ...draft, seo_description: e.target.value })} />
                <Input placeholder="SEO keywords, comma separated" value={draft.seo_keywords} onChange={(e) => setDraft({ ...draft, seo_keywords: e.target.value })} />
              </div>
            </DrawerSection>
          </div>
          <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4 xl:sticky xl:top-5">
            <p className="text-xs font-bold uppercase text-neutral-500">Product images</p>
            {editingProduct?.images?.length ? (
              <div className="mt-3">
                <p className="mb-2 text-xs text-neutral-500">Current images</p>
                <div className="grid grid-cols-3 gap-2">
                  {editingProduct.images.map((image) => (
                    <ImageTile
                      key={image.id}
                      src={image.url}
                      alt={editingProduct.name}
                      onView={() => setViewer({ src: image.url, label: editingProduct.name })}
                      onRemove={() => setPendingImageDelete({ id: image.id, label: editingProduct.name })}
                      removeIcon="trash"
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-neutral-300 bg-white px-4 py-6 text-center text-sm hover:border-black">
              <span className="font-bold">Choose 3 to 5 images</span>
              <span className="mt-1 text-xs text-neutral-500">{editing ? "New images will replace current product images." : "Required before creating a product."}</span>
              <input
                className="sr-only"
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []).slice(0, 5);
                  setImageFiles(files);
                  setImageError(files.length > 0 && files.length < 3 ? "Please choose at least 3 images." : "");
                }}
              />
            </label>
            {imageError && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{imageError}</p>}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-neutral-500">Selected images</p>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((url, index) => (
                    <ImageTile
                      key={url}
                      src={url}
                      alt="Selected product upload"
                      onView={() => setViewer({ src: url, label: imageFiles[index]?.name || "Selected image" })}
                      onRemove={() => removeSelectedImage(index)}
                      removeIcon="x"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="sticky bottom-0 z-20 -mx-5 flex gap-2 border-t border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur md:-mx-7 md:px-7">
          <Button disabled={busy}>{editing ? "Update product" : "Create product"}</Button>
          <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
        </div>
      </form>
      </Drawer>
      <ConfirmDialog
        open={Boolean(pendingImageDelete)}
        busy={busy}
        title="Delete this image?"
        message="This removes the current product image from the backend."
        onCancel={() => setPendingImageDelete(null)}
        onConfirm={() => {
          const imageId = pendingImageDelete?.id;
          setPendingImageDelete(null);
          if (imageId) void run(() => adminService.deleteProductImage(imageId), "Product image deleted.");
        }}
      />
      <ImagePreviewDialog image={viewer} onClose={() => setViewer(null)} />
      <ConfirmDialog
        open={Boolean(pendingCatalogDelete)}
        busy={busy}
        title={`Delete ${pendingCatalogDelete?.label || "item"}?`}
        message="This removes the catalog setup item. Existing products using it may lose that association."
        onCancel={() => setPendingCatalogDelete(null)}
        onConfirm={deleteCatalogItem}
      />

      <div className="mb-4 max-w-md">
        <Input placeholder="Search products, SKU, category" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="mb-4 flex flex-col justify-between gap-3 rounded-[24px] bg-neutral-50 px-4 py-3 text-sm md:flex-row md:items-center">
        <span className="font-bold">{products.length} products found</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase text-neutral-500">Rows</span>
          <Dropdown size="sm" className="w-24" value={String(pageSize)} options={pageSizeOptions} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} />
          <Button type="button" variant="outline" className="h-9 px-4" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Prev</Button>
          <span className="text-xs font-bold uppercase text-neutral-500">Page {safePage} / {pageCount}</span>
          <Button type="button" variant="outline" className="h-9 px-4" disabled={safePage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</Button>
        </div>
      </div>

      <AdminTable columns={["Image", "Name", "Category", "Brand", "Price", "Stock", "Status", "Date", "Actions"]} rows={paginatedProducts.map((product) => [
        <img key="img" src={getPrimaryImage(product.images)} alt={product.name} className="size-16 rounded-2xl object-cover" />,
        <span key="name"><strong>{product.name}</strong><br /><small className="text-neutral-500">{product.sku || product.slug}</small></span>,
        product.category?.name || "-",
        product.brand?.name || "-",
        formatCurrency(product.price),
        <span key="stock" className={product.low_stock || product.stock_quantity <= 10 ? "font-bold text-red-600" : ""}>
          {product.stock_quantity}
          {product.variants?.length ? <small className="block text-neutral-500">{product.variants.length} variants</small> : null}
        </span>,
        <StatusBadge key="status" status={product.status || "active"} />,
        <DateCell key="date" value={product.created_at} />,
        <ActionButtons key="actions" busy={busy} onEdit={() => edit(product)} onDelete={() => run(() => adminService.deleteProduct(product.id), "Product deleted.")} />,
      ])} />
    </AdminCard>
  );
}

function CatalogMultiSelect({
  title,
  items,
  selected,
  onChange,
}: {
  title: string;
  items: Array<{ id: number; name: string }>;
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  if (!items.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
        No {title.toLowerCase()} yet.
      </div>
    );
  }

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  return (
    <div className="rounded-[20px] border border-neutral-100 bg-neutral-50 p-3">
      <p className="mb-3 text-xs font-bold uppercase text-neutral-500">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn("rounded-full border px-3 py-2 text-xs font-bold uppercase transition", selected.includes(item.id) ? "border-black bg-black text-white" : "border-neutral-200 bg-white hover:border-black")}
            onClick={() => toggle(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function DrawerSection({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[24px] border border-neutral-200 bg-white p-4", className)}>
      <p className="mb-3 text-xs font-bold uppercase text-neutral-500">{title}</p>
      {children}
    </section>
  );
}

function ColorMultiSelect({
  colors,
  selected,
  onChange,
}: {
  colors: ProductColor[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  if (!colors.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
        Add colors above before assigning product colors.
      </div>
    );
  }

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  return (
    <div className="rounded-[20px] border border-neutral-100 bg-neutral-50 p-3">
      <p className="mb-3 text-xs font-bold uppercase text-neutral-500">Product colors</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            type="button"
            className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase transition", selected.includes(color.id) ? "border-black bg-black text-white" : "border-neutral-200 bg-white hover:border-black")}
            onClick={() => toggle(color.id)}
          >
            <span className="size-4 rounded-full border border-neutral-300" style={{ backgroundColor: color.hex_code }} />
            {color.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function VariantBuilder({
  basePrice,
  colors,
  rows,
  onChange,
}: {
  basePrice: number;
  colors: ProductColor[];
  rows: ProductVariantDraft[];
  onChange: (rows: ProductVariantDraft[]) => void;
}) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [defaultStock, setDefaultStock] = useState("0");
  const [defaultPriceAdjustment, setDefaultPriceAdjustment] = useState("0");
  const colorOptions = [{ label: "Choose color", value: "" }, ...colors.map((color) => ({ label: color.name, value: String(color.id) }))];
  const selectedColors = selectedColorIds.length ? selectedColorIds : colors.length ? colors.map((color) => String(color.id)) : [""];
  const totalStock = rows.reduce((sum, row) => sum + Number(row.stock_quantity || 0), 0);

  function updateRow(id: string, patch: Partial<ProductVariantDraft>) {
    onChange(rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  function addRow() {
    onChange([...rows, emptyVariantDraft()]);
  }

  function toggleSize(size: string) {
    setSelectedSizes((current) => current.includes(size) ? current.filter((item) => item !== size) : [...current, size]);
  }

  function toggleColor(colorId: string) {
    setSelectedColorIds((current) => current.includes(colorId) ? current.filter((item) => item !== colorId) : [...current, colorId]);
  }

  function generateRows() {
    const sizes = selectedSizes.length ? selectedSizes : [""];
    const generated = sizes.flatMap((size) => selectedColors.map((color_id) => ({
      ...emptyVariantDraft(),
      size,
      color_id,
      price_adjustment: defaultPriceAdjustment || "0",
      stock_quantity: defaultStock || "0",
    })));
    const existingKeys = new Set(rows.map((row) => `${row.size}|${row.color_id}`));
    const nextRows = generated.filter((row) => !existingKeys.has(`${row.size}|${row.color_id}`));
    onChange([...rows, ...nextRows]);
  }

  return (
    <div className="grid gap-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Variant combinations</p>
          <p className="mt-1 text-xs text-neutral-500">{rows.length} variants · {totalStock} total units</p>
        </div>
        <Button type="button" variant="outline" className="h-9 px-4" onClick={addRow}>Add variant</Button>
      </div>
      <div className="grid gap-3 rounded-[20px] bg-neutral-50 p-3">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase text-neutral-500">Sizes</p>
          <div className="flex flex-wrap gap-2">
            {variantSizeValues.map((size) => (
              <button
                key={size}
                type="button"
                className={cn("h-9 rounded-full border px-3 text-xs font-bold uppercase transition", selectedSizes.includes(size) ? "border-black bg-black text-white" : "border-neutral-200 bg-white hover:border-black")}
                onClick={() => toggleSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        {colors.length ? (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase text-neutral-500">Colors</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const colorId = String(color.id);
                return (
                  <button
                    key={color.id}
                    type="button"
                    className={cn("inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-bold uppercase transition", selectedColorIds.includes(colorId) ? "border-black bg-black text-white" : "border-neutral-200 bg-white hover:border-black")}
                    onClick={() => toggleColor(colorId)}
                  >
                    <span className="size-4 rounded-full border border-neutral-300" style={{ backgroundColor: color.hex_code }} />
                    {color.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Default stock" type="number" value={defaultStock} onChange={(event) => setDefaultStock(event.target.value)} />
          <Input placeholder="+ price per variant" type="number" value={defaultPriceAdjustment} onChange={(event) => setDefaultPriceAdjustment(event.target.value)} />
          <Button type="button" className="h-11 px-5" onClick={generateRows}>Generate variants</Button>
        </div>
      </div>
      <div className="grid gap-3">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-2 rounded-[18px] bg-neutral-50 p-3 md:grid-cols-2 xl:grid-cols-[110px_180px_minmax(140px,1fr)_120px_110px_auto]">
            <Dropdown size="sm" value={row.size} options={sizeVariantOptions} onChange={(size) => updateRow(row.id, { size })} />
            <Dropdown size="sm" value={row.color_id} options={colorOptions} onChange={(color_id) => updateRow(row.id, { color_id })} />
            <Input placeholder="Variant SKU" value={row.sku} onChange={(event) => updateRow(row.id, { sku: event.target.value })} />
            <div>
              <Input placeholder="+ price" type="number" value={row.price_adjustment} onChange={(event) => updateRow(row.id, { price_adjustment: event.target.value })} />
              <p className="mt-1 px-2 text-[11px] font-bold uppercase text-neutral-400">{formatCurrency(basePrice + Number(row.price_adjustment || 0))}</p>
            </div>
            <Input placeholder="Stock" type="number" value={row.stock_quantity} onChange={(event) => updateRow(row.id, { stock_quantity: event.target.value })} />
            <Button type="button" variant="outline" className="h-11 px-4" onClick={() => onChange(rows.filter((item) => item.id !== row.id))}>Remove</Button>
          </div>
        ))}
        {!rows.length && <p className="text-sm text-neutral-500">Add size/color variants when this product has multiple sellable combinations.</p>}
      </div>
    </div>
  );
}

function CatalogSetupPanel({
  brands,
  tags,
  collections,
  colors,
  sizeGuides,
  draft,
  setDraft,
  createItem,
  requestDelete,
}: {
  brands: CatalogBrand[];
  tags: CatalogTag[];
  collections: ProductCollection[];
  colors: ProductColor[];
  sizeGuides: SizeGuide[];
  draft: CatalogQuickDraft;
  setDraft: (draft: CatalogQuickDraft) => void;
  createItem: (type: "brand" | "tag" | "collection" | "color" | "sizeGuide") => void;
  requestDelete: (item: { type: "brand" | "tag" | "collection" | "color" | "sizeGuide"; id: number; label: string }) => void;
}) {
  const groups = [
    { key: "brand" as const, title: "Brands", value: draft.brand, items: brands },
    { key: "tag" as const, title: "Tags", value: draft.tag, items: tags },
    { key: "collection" as const, title: "Collections", value: draft.collection, items: collections },
    { key: "color" as const, title: "Colors", value: draft.color, items: colors },
    { key: "sizeGuide" as const, title: "Size guides", value: draft.sizeGuide, items: sizeGuides },
  ];

  return (
    <div className="mb-5 grid gap-3 rounded-[28px] border border-neutral-200 bg-neutral-50 p-4 lg:grid-cols-5">
      {groups.map((group) => {
        const isColorGroup = group.key === "color";

        return (
        <div key={group.key} className="rounded-[22px] bg-white p-4">
          <p className="text-xs font-bold uppercase text-neutral-500">{group.title}</p>
          <div className="mt-3 flex gap-2">
            <Input
              className={isColorGroup ? "min-w-0 flex-1" : undefined}
              placeholder={`Add ${group.title.toLowerCase()}`}
              value={group.value}
              onChange={(event) => setDraft({ ...draft, [group.key]: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  createItem(group.key);
                }
              }}
            />
            {isColorGroup && (
              <label className="relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-neutral-200 bg-white transition hover:border-black" title="Choose color">
                <input
                  type="color"
                  aria-label="Color value"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  value={draft.colorHex}
                  onChange={(event) => setDraft({ ...draft, colorHex: event.target.value })}
                />
                <span className="size-6 rounded-full border border-neutral-300 shadow-inner" style={{ backgroundColor: draft.colorHex }} />
              </label>
            )}
            <Button type="button" className="h-11 px-4" onClick={() => createItem(group.key)}>Add</Button>
          </div>
          <div className="mt-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto">
            {group.items.map((item) => (
              <span key={item.id} className={cn("inline-flex items-center gap-2 rounded-full border border-neutral-200 text-xs font-bold", "hex_code" in item ? "px-2.5 py-1" : "px-3 py-1")}>
                {"hex_code" in item && <span className="size-4 rounded-full border border-neutral-300 shadow-inner" style={{ backgroundColor: item.hex_code }} />}
                {item.name}
                <button
                  type="button"
                  className="text-neutral-400 hover:text-red-600"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => requestDelete({ type: group.key, id: item.id, label: item.name })}
                >
                  ×
                </button>
              </span>
            ))}
            {!group.items.length && <span className="text-xs text-neutral-400">No records yet</span>}
          </div>
        </div>
      );
      })}
    </div>
  );
}

function CategoryPanel({ categories, busy, run }: { categories: Category[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<CategoryDraft>(emptyCategory);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);
  const parentOptions = categoryParentOptions(categories, draft.id);
  const selectedParent = categories.find((category) => String(category.id) === draft.parent_id);

  function edit(category: Category) {
    setDraft({
      id: category.id,
      is_parent: Boolean(category.show_in_header),
      parent_id: category.parent_id ? String(category.parent_id) : "",
      sort_order: String(category.sort_order || 0),
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_path: category.image_url || "",
      banner_path: category.banner_url || "",
      is_active: Boolean(category.is_active),
    });
    setErrors({});
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateCategoryDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = {
      parent_id: draft.is_parent ? null : Number(draft.parent_id),
      show_in_header: draft.is_parent,
      sort_order: Number(draft.sort_order || 0),
      name: draft.name,
      slug: draft.slug,
      description: draft.description,
      image_path: draft.image_path,
      banner_path: draft.banner_path,
      is_active: draft.is_active,
    };
    await run(() => editing && draft.id ? adminService.updateCategory(draft.id, payload) : adminService.createCategory(payload), editing ? "Category updated." : "Category created.");
    setDraft(emptyCategory);
    setDrawerOpen(false);
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Category CRUD" subtitle="Manage active/inactive categories and slugs." />
        <Button type="button" onClick={() => { setDraft(emptyCategory); setErrors({}); setDrawerOpen(true); }}>Add category</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit category" : "Add category"} subtitle="Enable parent category to show it in the header. Disable it to place this category under another category." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-3">
        <label className="flex items-center justify-between gap-4 rounded-[24px] border border-neutral-200 px-4 py-3 text-sm">
          <span>
            <strong className="block">Show in header</strong>
            <small className="text-neutral-500">Show this category as a main header item.</small>
          </span>
          <input
            type="checkbox"
            checked={draft.is_parent}
            onChange={(event) => setDraft({ ...draft, is_parent: event.target.checked, parent_id: event.target.checked ? "" : draft.parent_id })}
          />
        </label>
        {!draft.is_parent && (
          <div>
            <Dropdown
              value={draft.parent_id}
              options={parentOptions}
              placeholder="Select parent category"
              onChange={(value) => setDraft({ ...draft, parent_id: value })}
            />
            {errors.parent_id && <p className="mt-1.5 px-4 text-xs font-bold text-red-600">{errors.parent_id}</p>}
          </div>
        )}
        <Input
          required
          placeholder={draft.is_parent ? "Parent category name, e.g. Men" : "Subcategory name, e.g. Footwear or Birkenstock Slipper"}
          value={draft.name}
          error={errors.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slug || slugify(e.target.value) })}
        />
        <Input required placeholder="Slug" value={draft.slug} error={errors.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
        <Input placeholder="Menu order, e.g. 10" type="number" value={draft.sort_order} error={errors.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} />
        <Input placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <Input placeholder="Category image URL" value={draft.image_path} onChange={(e) => setDraft({ ...draft, image_path: e.target.value })} />
        <Input placeholder="Category banner URL" value={draft.banner_path} onChange={(e) => setDraft({ ...draft, banner_path: e.target.value })} />
        <div className="rounded-[22px] bg-neutral-50 p-4 text-sm text-neutral-600">
          {draft.is_parent
            ? "This will appear as a main item on the storefront header."
            : selectedParent
              ? `This will appear under ${selectedParent.name}. Nested paths like Men > Footwear > Birkenstock Slipper are supported.`
              : "Select which parent category this belongs under."}
        </div>
        <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm">
          <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active
        </label>
        <div className="flex gap-2">
          <Button disabled={busy || (!draft.is_parent && !draft.parent_id)}>{editing ? "Update category" : "Create category"}</Button>
          <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
        </div>
      </form>
      </Drawer>
      <AdminTable columns={["Name", "Path", "Order", "Header", "Slug", "Status", "Date", "Actions"]} rows={categories.map((category) => [
        <span key="name" className={cn("block", category.parent_id && "pl-5")}>
          <strong>{category.parent_id ? `↳ ${category.name}` : category.name}</strong>
          {category.children?.length ? <small className="ml-2 text-neutral-500">({category.children.length} dropdown items)</small> : null}
        </span>,
        categoryPath(category, categories),
        category.sort_order ?? 0,
        category.show_in_header ? <StatusBadge key="header" status="shown" /> : "-",
        category.slug,
        <StatusBadge key="status" status={category.is_active ? "active" : "inactive"} />,
        <DateCell key="date" value={category.created_at} />,
        <ActionButtons key="actions" busy={busy} onEdit={() => edit(category)} onDelete={() => run(() => adminService.deleteCategory(category.id), "Category deleted.")} />,
      ])} />
    </AdminCard>
  );
}

function OrderPanel({ orders, busy, run }: { orders: Order[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [selected, setSelected] = useState<Order | null>(null);

  return (
    <AdminCard>
      <PanelTitle title="Order management" subtitle="Update order, payment, delivery status, and tracking numbers." />
      <OrderTable orders={orders} action={(order) => (
        <div className="grid gap-2">
          <Button className="h-8 px-3" variant="outline" onClick={() => setSelected(order)}>Details</Button>
          <Dropdown size="sm" disabled={busy} value={order.status} options={orderStatusOptions} onChange={(value) => run(() => adminService.updateOrderStatus(order.id, { status: value, payment_status: order.payment_status }), "Order status updated.")} />
          <Button className="h-8 px-3" disabled={busy} onClick={() => run(() => adminService.updateOrderStatus(order.id, { status: "delivered", payment_status: "paid", delivery_status: "delivered" }), "Order marked delivered and paid.")}>Complete</Button>
        </div>
      )} />
      <Drawer open={Boolean(selected)} title={selected?.order_number || "Order detail"} subtitle="Customer, items, delivery timeline, invoice, and refund controls." onClose={() => setSelected(null)}>
        {selected && (
          <div className="grid gap-4">
            <div className="rounded-[24px] bg-neutral-50 p-4 text-sm">
              <p className="font-black">{selected.customer.name}</p>
              <p className="text-neutral-500">{selected.customer.email || "-"} · {selected.customer.phone || "-"}</p>
              <p className="mt-3">{selected.delivery_address}</p>
              {selected.order_notes && <p className="mt-2 text-neutral-500">Note: {selected.order_notes}</p>}
            </div>
            <div className="grid gap-2">
              {(selected.timeline || []).map((step) => (
                <div key={step.label} className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-sm">
                  <span className="font-bold">{step.label}</span>
                  <span className="text-neutral-500">{step.status}</span>
                </div>
              ))}
            </div>
            <AdminTable columns={["Item", "Qty", "Total"]} rows={(selected.items || []).map((item) => [item.product_name, item.quantity, formatCurrency(item.line_total)])} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => printInvoice(selected)}>Print invoice</Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => run(() => adminService.refundOrder(selected.id, "Manual admin refund"), "Order refunded.")}>Refund</Button>
            </div>
          </div>
        )}
      </Drawer>
    </AdminCard>
  );
}

function ReviewsPanel({ reviews, busy, run }: { reviews: NonNullable<ReturnType<typeof useAdmin>["data"]["reviews"]>; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  return (
    <AdminCard>
      <PanelTitle title="Review moderation" subtitle="Approve useful reviews, reject spam, and remove unwanted entries." />
      <AdminTable columns={["Product", "Customer", "Rating", "Comment", "Status", "Date", "Actions"]} rows={reviews.map((review) => [
        review.product?.name || "-",
        review.customer_name,
        `★ ${review.rating}`,
        review.comment || "-",
        <StatusBadge key="status" status={review.status || "pending"} />,
        <DateCell key="date" value={review.created_at} />,
        <div key="actions" className="flex flex-wrap gap-2">
          <Button className="h-8 px-3" disabled={busy} onClick={() => run(() => adminService.updateReview(review.id, "approved"), "Review approved.")}>Approve</Button>
          <Button className="h-8 px-3" variant="outline" disabled={busy} onClick={() => run(() => adminService.updateReview(review.id, "rejected"), "Review rejected.")}>Reject</Button>
          <Button className="h-8 px-3" variant="outline" disabled={busy} onClick={() => run(() => adminService.deleteReview(review.id), "Review deleted.")}>Delete</Button>
        </div>,
      ])} />
    </AdminCard>
  );
}

function QuestionsPanel({ questions, busy, run }: { questions: ProductQuestion[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [selected, setSelected] = useState<ProductQuestion | null>(null);
  const [answer, setAnswer] = useState("");

  function open(question: ProductQuestion) {
    setSelected(question);
    setAnswer(question.answer || "");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    await run(() => adminService.updateQuestion(selected.id, { answer, status: "answered" }), "Question answered.");
    setSelected(null);
    setAnswer("");
  }

  return (
    <AdminCard>
      <PanelTitle title="Product questions" subtitle="Answer customer questions. Answered questions can appear on product detail pages." />
      <AdminTable columns={["Product", "Customer", "Question", "Answer", "Status", "Date", "Actions"]} rows={questions.map((question) => [
        question.product?.name || "-",
        question.customer_name,
        question.question,
        question.answer || "-",
        <StatusBadge key="status" status={question.status || "pending"} />,
        <DateCell key="date" value={question.created_at} />,
        <div key="actions" className="flex flex-wrap gap-2">
          <Button className="h-8 px-3" disabled={busy} onClick={() => open(question)}>Answer</Button>
          <Button className="h-8 px-3" variant="outline" disabled={busy} onClick={() => run(() => adminService.updateQuestion(question.id, { answer: question.answer || "", status: "rejected" }), "Question rejected.")}>Reject</Button>
          <Button className="h-8 px-3" variant="outline" disabled={busy} onClick={() => run(() => adminService.deleteQuestion(question.id), "Question deleted.")}>Delete</Button>
        </div>,
      ])} />
      <Drawer open={Boolean(selected)} title="Answer question" subtitle={selected?.product?.name || "Product question"} onClose={() => setSelected(null)}>
        {selected && (
          <form onSubmit={submit} className="grid gap-3">
            <div className="rounded-[24px] bg-neutral-50 p-4">
              <p className="text-xs font-bold uppercase text-neutral-500">Customer question</p>
              <p className="mt-2 text-sm leading-6">{selected.question}</p>
            </div>
            <textarea required className="min-h-36 rounded-[24px] border border-neutral-200 p-4 text-sm outline-none focus:border-black" placeholder="Answer" value={answer} onChange={(event) => setAnswer(event.target.value)} />
            <div className="flex gap-2">
              <Button disabled={busy}>{busy ? "Saving..." : "Publish answer"}</Button>
              <Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Drawer>
    </AdminCard>
  );
}

function CouponPanel({ coupons, busy, run }: { coupons: Coupon[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<CouponDraft>(emptyCoupon);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);

  function edit(coupon: Coupon) {
    setDraft({ id: coupon.id, code: coupon.code, type: coupon.type, value: String(coupon.value), starts_at: dateOnly(coupon.starts_at), ends_at: dateOnly(coupon.ends_at), usage_limit: String(coupon.usage_limit || ""), is_active: coupon.is_active });
    setErrors({});
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateCouponDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = { ...draft, value: Number(draft.value), usage_limit: draft.usage_limit ? Number(draft.usage_limit) : null };
    await run(() => editing && draft.id ? adminService.updateCoupon(draft.id, payload) : adminService.createCoupon(payload), editing ? "Coupon updated." : "Coupon created.");
    setDraft(emptyCoupon);
    setDrawerOpen(false);
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Coupon CRUD" subtitle="Create percentage/fixed discounts and manage active status." />
        <Button type="button" onClick={() => { setDraft(emptyCoupon); setErrors({}); setDrawerOpen(true); }}>Add coupon</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit coupon" : "Add coupon"} subtitle="Coupons are available for mid/pro plans." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-3">
        <Input required placeholder="Code" value={draft.code} error={errors.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} />
        <Dropdown value={draft.type} options={couponTypeOptions} onChange={(value) => setDraft({ ...draft, type: value as CouponDraft["type"] })} />
        <Input required placeholder="Value" type="number" value={draft.value} error={errors.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
        <Input placeholder="Usage limit" type="number" value={draft.usage_limit} error={errors.usage_limit} onChange={(e) => setDraft({ ...draft, usage_limit: e.target.value })} />
        <Input placeholder="Starts at" type="date" value={draft.starts_at} error={errors.starts_at} onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })} />
        <Input placeholder="Ends at" type="date" value={draft.ends_at} error={errors.ends_at} onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })} />
        <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active</label>
        <div className="flex gap-2"><Button disabled={busy}>{editing ? "Update coupon" : "Create coupon"}</Button><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button></div>
      </form>
      </Drawer>
      <AdminTable columns={["Code", "Type", "Value", "Used", "Status", "Date", "Actions"]} rows={coupons.map((coupon) => [
        coupon.code,
        coupon.type,
        coupon.type === "percentage" ? `${coupon.value}%` : formatCurrency(coupon.value),
        `${coupon.used_count || 0}/${coupon.usage_limit || "∞"}`,
        <StatusBadge key="status" status={coupon.is_active ? "active" : "inactive"} />,
        <DateCell key="date" value={coupon.created_at} />,
        <ActionButtons key="actions" busy={busy} onEdit={() => edit(coupon)} onDelete={() => run(() => adminService.deleteCoupon(coupon.id), "Coupon deleted.")} />,
      ])} />
    </AdminCard>
  );
}

function ShippingPanel({ methods, busy, run }: { methods: ShippingMethod[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<ShippingDraft>(emptyShipping);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);

  function edit(method: ShippingMethod) {
    setDraft({
      id: method.id,
      name: method.name,
      code: method.code,
      description: method.description || "",
      fee: String(method.fee),
      min_order_total: method.min_order_total ? String(method.min_order_total) : "",
      sort_order: String(method.sort_order || 0),
      is_active: method.is_active,
    });
    setErrors({});
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateShippingDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = shippingPayload(draft);
    await run(() => editing && draft.id ? adminService.updateShippingMethod(draft.id, payload) : adminService.createShippingMethod(payload), editing ? "Shipping method updated." : "Shipping method created.");
    setDraft(emptyShipping);
    setDrawerOpen(false);
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Shipping methods" subtitle="These options appear in checkout and control delivery fees." />
        <Button type="button" onClick={() => { setDraft(emptyShipping); setErrors({}); setDrawerOpen(true); }}>Add method</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit shipping method" : "Add shipping method"} subtitle="Use codes like standard, express, or pickup for frontend clarity." onClose={() => setDrawerOpen(false)}>
        <form onSubmit={submit} className="grid gap-3">
          <Input required placeholder="Name" value={draft.name} error={errors.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, code: draft.code || slugify(e.target.value) })} />
          <Input placeholder="Code" value={draft.code} error={errors.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          <Input placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-3">
            <Input required type="number" placeholder="Fee" value={draft.fee} error={errors.fee} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} />
            <Input type="number" placeholder="Min order total" value={draft.min_order_total} error={errors.min_order_total} onChange={(e) => setDraft({ ...draft, min_order_total: e.target.value })} />
            <Input type="number" placeholder="Sort order" value={draft.sort_order} error={errors.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} />
          </div>
          <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active</label>
          <div className="flex gap-2"><Button disabled={busy}>{editing ? "Update method" : "Create method"}</Button><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button></div>
        </form>
      </Drawer>
      <AdminTable columns={["Name", "Code", "Fee", "Minimum", "Order", "Status", "Actions"]} rows={methods.map((method) => [
        method.name,
        method.code,
        formatCurrency(Number(method.fee)),
        method.min_order_total ? formatCurrency(Number(method.min_order_total)) : "-",
        method.sort_order || 0,
        <StatusBadge key="status" status={method.is_active ? "active" : "inactive"} />,
        <ActionButtons key="actions" busy={busy} onEdit={() => edit(method)} onDelete={() => run(() => adminService.deleteShippingMethod(method.id), "Shipping method deleted.")} />,
      ])} />
    </AdminCard>
  );
}

function MarketingPanel({ banners, busy, run }: { banners: MarketingBanner[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<BannerDraft>(emptyBanner);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);
  const imagePreview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : draft.current_image_url, [imageFile, draft.current_image_url]);

  useEffect(() => {
    return () => {
      if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview, imageFile]);

  function edit(banner: MarketingBanner) {
    setDraft({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle || "",
      current_image_url: banner.image_url || "",
      link_url: banner.link_url || "",
      position: banner.position,
      starts_at: datetimeLocal(banner.starts_at),
      ends_at: datetimeLocal(banner.ends_at),
      sort_order: String(banner.sort_order || 0),
      is_active: banner.is_active,
    });
    setImageFile(null);
    setErrors({});
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateBannerDraft(draft, imageFile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = bannerFormData(draft, imageFile);
    await run(() => editing && draft.id ? adminService.updateBanner(draft.id, payload) : adminService.createBanner(payload), editing ? "Banner updated." : "Banner created.");
    setDraft(emptyBanner);
    setImageFile(null);
    setErrors({});
    setDrawerOpen(false);
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Marketing banners" subtitle="Control hero images, promo panels, and customer notice banners from the backend." />
        <Button type="button" onClick={() => { setDraft(emptyBanner); setImageFile(null); setErrors({}); setDrawerOpen(true); }}>Add banner</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit banner" : "Add banner"} subtitle="Positions like home_hero and promo are already wired into the storefront." onClose={() => setDrawerOpen(false)}>
        <form onSubmit={submit} className="grid gap-3">
          <div>
            <Dropdown value={draft.position} options={bannerPositionOptions} onChange={(value) => setDraft({ ...draft, position: value })} />
            {errors.position && <p className="mt-1.5 px-4 text-xs font-bold text-red-600">{errors.position}</p>}
          </div>
          <Input required placeholder="Title" value={draft.title} error={errors.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <Input placeholder="Subtitle" value={draft.subtitle} error={errors.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
          <label className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed bg-white px-4 py-6 text-center text-sm hover:border-black ${errors.image ? "border-red-400 bg-red-50/40" : "border-neutral-300"}`}>
            <span className="font-bold">Upload banner image</span>
            <span className="mt-1 text-xs text-neutral-500">JPG, PNG, or WebP. Recommended wide image.</span>
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setImageFile(file);
                setErrors((current) => ({ ...current, image: "" }));
              }}
            />
          </label>
          {errors.image && <p className="px-4 text-xs font-bold text-red-600">{errors.image}</p>}
          <Input placeholder="Link URL, e.g. /products" value={draft.link_url} error={errors.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-3">
            <Input type="datetime-local" placeholder="Starts at" value={draft.starts_at} error={errors.starts_at} onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })} />
            <Input type="datetime-local" placeholder="Ends at" value={draft.ends_at} error={errors.ends_at} onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })} />
            <Input type="number" placeholder="Sort order" value={draft.sort_order} error={errors.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} />
          </div>
          <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active</label>
          {imagePreview && <img src={imagePreview} alt={draft.title || "Banner preview"} className="aspect-[2.4] rounded-[24px] object-cover" />}
          <div className="flex gap-2"><Button disabled={busy}>{editing ? "Update banner" : "Create banner"}</Button><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button></div>
        </form>
      </Drawer>
      <AdminTable columns={["Preview", "Title", "Position", "Window", "Order", "Status", "Date", "Actions"]} rows={banners.map((banner) => [
        banner.image_url ? <img key="img" src={banner.image_url} alt={banner.title} className="size-16 rounded-2xl object-cover" /> : "-",
        <span key="title"><strong>{banner.title}</strong><br /><small className="text-neutral-500">{banner.subtitle || banner.link_url || "-"}</small></span>,
        banner.position,
        `${dateOnly(banner.starts_at) || "Now"} - ${dateOnly(banner.ends_at) || "Open"}`,
        banner.sort_order || 0,
        <StatusBadge key="status" status={banner.is_active ? "active" : "inactive"} />,
        <DateCell key="date" value={banner.created_at} />,
        <ActionButtons key="actions" busy={busy} onEdit={() => edit(banner)} onDelete={() => run(() => adminService.deleteBanner(banner.id), "Banner deleted.")} />,
      ])} />
    </AdminCard>
  );
}

function NewsletterPanel({ subscribers, busy, run }: { subscribers: NewsletterSubscriber[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  return (
    <AdminCard>
      <PanelTitle title="Newsletter subscribers" subtitle="People who subscribed from the storefront footer." />
      <AdminTable columns={["Email", "Name", "Status", "Subscribed", "Date", "Actions"]} rows={subscribers.map((subscriber) => [
        subscriber.email,
        subscriber.name || "-",
        <StatusBadge key="status" status={subscriber.status} />,
        <DateCell key="subscribed" value={subscriber.subscribed_at} />,
        <DateCell key="date" value={subscriber.created_at} />,
        <div key="actions" className="flex flex-wrap gap-2">
          <Dropdown size="sm" disabled={busy} value={subscriber.status} options={subscriberStatusOptions} onChange={(value) => run(() => adminService.updateNewsletterSubscriber(subscriber.id, { status: value }), "Subscriber updated.")} />
          <Button className="h-8 px-3" variant="outline" disabled={busy} onClick={() => run(() => adminService.deleteNewsletterSubscriber(subscriber.id), "Subscriber deleted.")}>Delete</Button>
        </div>,
      ])} />
    </AdminCard>
  );
}

function AuditPanel({ logs }: { logs: NonNullable<ReturnType<typeof useAdmin>["data"]["auditLogs"]> }) {
  return (
    <AdminCard>
      <PanelTitle title="Audit logs" subtitle="Recent admin and platform activity for operational traceability." />
      <AdminTable columns={["Action", "User", "Subject", "Description", "Date"]} rows={logs.map((log) => [
        <StatusBadge key="action" status={log.action} />,
        log.user?.name || "System",
        [log.subject_type, log.subject_id].filter(Boolean).join(" #") || "-",
        log.description || "-",
        <DateCell key="date" value={log.created_at} />,
      ])} />
    </AdminCard>
  );
}

function ReportsPanel({ data }: { data: ReturnType<typeof useAdmin>["data"] }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total orders" value={data.salesReport?.total_orders || data.orders.length} />
        <MetricCard label="Revenue" value={formatCurrency(data.salesReport?.total_revenue || 0)} />
        <MetricCard label="Profit" value={formatCurrency(data.profitReport?.total_profit || 0)} helper={`Cost ${formatCurrency(data.profitReport?.total_cost || 0)}`} />
      </div>
      <AdminCard>
        <div className="mb-4 flex items-center justify-between">
          <PanelTitle title="Sales by date" subtitle="Generated from /admin/reports/sales" />
          <Button variant="outline" onClick={() => exportCsv("sales-report", data.salesReport?.sales_by_date || [])}>Export sales</Button>
        </div>
        <SalesAreaChart rows={(data.salesReport?.sales_by_date || []).map((row) => ({ label: row.date, revenue: Number(row.revenue), orders: Number(row.orders) }))} />
      </AdminCard>
      <AdminCard>
        <div className="mb-4 flex items-center justify-between">
          <PanelTitle title="Best-selling products" subtitle="Quantity and revenue per product." />
          <Button variant="outline" onClick={() => exportCsv("best-selling-products", data.salesReport?.best_selling_products || [])}>Export best sellers</Button>
        </div>
        <AdminTable columns={["Product", "Quantity", "Revenue"]} rows={(data.salesReport?.best_selling_products || []).map((item) => [item.product_name, item.quantity_sold, formatCurrency(item.revenue)])} />
      </AdminCard>
      <div className="grid gap-4 xl:grid-cols-3">
        <AdminCard>
          <PanelTitle title="Sales by category" subtitle="Revenue by catalog group." />
          <AdminTable columns={["Category", "Qty", "Revenue"]} rows={(data.salesReport?.sales_by_category || []).map((item) => [item.category_name, item.quantity_sold, formatCurrency(item.revenue)])} />
        </AdminCard>
        <AdminCard>
          <PanelTitle title="Payment methods" subtitle="Orders and revenue by payment type." />
          <AdminTable columns={["Method", "Orders", "Revenue"]} rows={(data.salesReport?.sales_by_payment_method || []).map((item) => [item.payment_method, item.orders, formatCurrency(item.revenue)])} />
        </AdminCard>
        <AdminCard>
          <PanelTitle title="Customer report" subtitle="Top customers by revenue." />
          <AdminTable columns={["Customer", "Orders", "Revenue"]} rows={(data.salesReport?.customer_report || []).map((item) => [item.customer_name || item.customer_email || "-", item.orders, formatCurrency(item.revenue)])} />
        </AdminCard>
      </div>
    </div>
  );
}

function PaymentsPanel({ payments, busy, run }: { payments: Payment[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  return (
    <AdminCard>
      <PanelTitle title="Payment updates" subtitle="Mark manual/bank transfer payments paid, failed, pending, or refunded." />
      <AdminTable columns={["Order", "Method", "Status", "Amount", "Transaction", "Date", "Action"]} rows={payments.map((payment) => [
        payment.order_number || payment.order_id,
        payment.method,
        <StatusBadge key="status" status={payment.status} />,
        formatCurrency(payment.amount),
        payment.transaction_id || "-",
        <DateCell key="date" value={payment.paid_at || payment.created_at} />,
        <Dropdown key="status" size="sm" disabled={busy} value={payment.status} options={paymentStatusOptions} onChange={(value) => run(() => adminService.updatePayment(payment.id, { status: value, transaction_id: payment.transaction_id || `MANUAL-${payment.id}` }), "Payment updated.")} />,
      ])} />
    </AdminCard>
  );
}

function InventoryPanel({ products, logs, busy, run }: { products: Product[]; logs: ReturnType<typeof useAdmin>["data"]["inventoryLogs"]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const inventoryRows = products.flatMap((product) => product.variants?.length
    ? product.variants.map((variant) => ({ product, variant, stock: variant.stock_quantity, sku: variant.sku || product.sku || "-", label: variant.attribute_value }))
    : [{ product, variant: null as ProductVariant | null, stock: product.stock_quantity, sku: product.sku || "-", label: "Whole product" }]);
  const lowStock = inventoryRows.filter((row) => row.stock <= 10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<RestockDraft>(emptyRestock);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedVariant = draft.product?.variants?.find((variant) => String(variant.id) === draft.variant_id) || null;
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : draft.product?.stock_quantity;

  function openRestock(product: Product, variant?: ProductVariant | null) {
    setDraft({ product, variant_id: variant ? String(variant.id) : "", quantity: "10", type: "restock", note: `Restock ${variant ? `${product.name} - ${variant.attribute_value}` : product.name}` });
    setErrors({});
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.product) return;
    const nextErrors = validateRestockDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const quantity = Math.abs(Number(draft.quantity));
    const quantityChange = draft.type === "damage" ? -quantity : quantity;
    await run(() => adminService.adjustInventory({
      product_id: draft.product!.id,
      product_variant_id: draft.variant_id ? Number(draft.variant_id) : null,
      quantity_change: quantityChange,
      type: draft.type,
      note: draft.note,
    }), "Inventory updated.");
    setDraft(emptyRestock);
    setDrawerOpen(false);
  }

  return (
    <div className="grid gap-4">
      <AdminCard>
        <PanelTitle title="Low stock flags" subtitle="Variant and product stock at or below the low-stock threshold." />
        <AdminTable columns={["Image", "Product", "Variant", "SKU", "Stock", "Date", "Action"]} rows={lowStock.map((row) => [
          <img key="img" src={getPrimaryImage(row.product.images)} alt={row.product.name} className="size-14 rounded-2xl object-cover" />,
          row.product.name,
          row.label,
          row.sku,
          <span key="stock" className="font-bold text-red-600">{row.stock}</span>,
          <DateCell key="date" value={row.product.updated_at || row.product.created_at} />,
          <Button key="restock" type="button" className="h-8 px-3" onClick={() => openRestock(row.product, row.variant)}>Adjust</Button>,
        ])} />
      </AdminCard>
      <AdminCard>
        <PanelTitle title="Inventory logs" subtitle="Stock changes generated by orders and adjustments." />
        <AdminTable columns={["Type", "Product", "Variant", "Change", "Stock After", "Note", "Date"]} rows={logs.map((log) => [
          <StatusBadge key="type" status={log.type} />,
          log.product?.name || log.product_id,
          log.variant?.attribute_value || "-",
          log.quantity_change,
          log.stock_after,
          log.note || "-",
          <DateCell key="date" value={log.created_at} />,
        ])} />
      </AdminCard>
      <Drawer open={drawerOpen} title="Inventory adjustment" subtitle="Restock, correct counts, or log damaged/returned stock with a reason." onClose={() => setDrawerOpen(false)}>
        <form onSubmit={submit} className="grid gap-3">
          {draft.product && (
            <div className="rounded-[24px] bg-neutral-50 p-4">
              <p className="text-[11px] font-bold uppercase text-neutral-500">Product</p>
              <p className="mt-2 font-black">{draft.product.name}</p>
              <p className="text-sm text-neutral-500">{selectedVariant ? selectedVariant.attribute_value : "Whole product"} stock: {currentStock}</p>
            </div>
          )}
          {draft.product?.variants?.length ? (
            <Dropdown
              value={draft.variant_id}
              placeholder="Select variant stock"
              options={draft.product.variants.map((variant) => ({ label: `${variant.attribute_value} (${variant.stock_quantity})`, value: String(variant.id) }))}
              onChange={(value) => setDraft({ ...draft, variant_id: value })}
            />
          ) : null}
          <Dropdown value={draft.type} options={inventoryTypeOptions} onChange={(value) => setDraft({ ...draft, type: value as RestockDraft["type"] })} />
          <Input required min={1} type="number" placeholder="Quantity" value={draft.quantity} error={errors.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value })} />
          <Input required placeholder="Reason note" value={draft.note} error={errors.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
          <div className="flex gap-2">
            <Button disabled={busy}>{busy ? "Saving..." : "Save adjustment"}</Button>
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

function BranchPanel({ branches, busy, run }: { branches: Branch[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<BranchDraft>(emptyBranch);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);

  function edit(branch: Branch) {
    setDraft({ id: branch.id, name: branch.name, phone: branch.phone || "", address: branch.address || "", is_active: branch.is_active });
    setErrors({});
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateBranchDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await run(() => editing && draft.id ? adminService.updateBranch(draft.id, draft) : adminService.createBranch(draft), editing ? "Branch updated." : "Branch created.");
    setDraft(emptyBranch);
    setDrawerOpen(false);
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Branch CRUD" subtitle="Manage multi-branch locations for pro stores." />
        <Button type="button" onClick={() => { setDraft(emptyBranch); setErrors({}); setDrawerOpen(true); }}>Add branch</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit branch" : "Add branch"} subtitle="Branches are available for pro plan stores." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-3">
        <Input required placeholder="Name" value={draft.name} error={errors.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Input placeholder="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
        <Input placeholder="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
        <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active</label>
        <div className="flex gap-2"><Button disabled={busy}>{editing ? "Update branch" : "Create branch"}</Button><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button></div>
      </form>
      </Drawer>
      <AdminTable columns={["Name", "Phone", "Address", "Status", "Date", "Actions"]} rows={branches.map((branch) => [branch.name, branch.phone || "-", branch.address || "-", <StatusBadge key="status" status={branch.is_active ? "active" : "inactive"} />, <DateCell key="date" value={branch.created_at} />, <ActionButtons key="actions" busy={busy} onEdit={() => edit(branch)} onDelete={() => run(() => adminService.deleteBranch(branch.id), "Branch deleted.")} />])} />
    </AdminCard>
  );
}

function StaffPanel({ staff, busy, run }: { staff: StaffUser[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<StaffDraft>(emptyStaff);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);

  function edit(user: StaffUser) {
    setDraft({ id: user.id, name: user.name, email: user.email, phone: user.phone || "", role: user.role, permissions: user.permissions || [], password: "" });
    setErrors({});
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateStaffDraft(draft, editing);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = { ...draft };
    if (editing && !payload.password) delete (payload as Partial<StaffDraft>).password;
    await run(() => editing && draft.id ? adminService.updateStaff(draft.id, payload) : adminService.createStaff(payload), editing ? "Staff user updated." : "Staff user created.");
    setDraft(emptyStaff);
    setDrawerOpen(false);
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Staff CRUD" subtitle="Admin, manager, and staff users for pro stores." />
        <Button type="button" onClick={() => { setDraft(emptyStaff); setErrors({}); setDrawerOpen(true); }}>Add staff</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit staff user" : "Add staff user"} subtitle="Staff roles are available for pro plan stores." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-3">
        <Input required placeholder="Name" value={draft.name} error={errors.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Input required placeholder="Email" type="email" value={draft.email} error={errors.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        <Input placeholder="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
        <Dropdown value={draft.role} options={staffRoleOptions} onChange={(value) => setDraft({ ...draft, role: value as StaffDraft["role"] })} />
        <div className="rounded-[24px] border border-neutral-200 p-4">
          <p className="mb-3 text-xs font-bold uppercase text-neutral-500">Permissions</p>
          <div className="grid gap-2 md:grid-cols-2">
            {staffPermissionOptions.map((permission) => (
              <label key={permission.value} className="flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.permissions.includes(permission.value)}
                  onChange={(event) => setDraft({
                    ...draft,
                    permissions: event.target.checked
                      ? [...draft.permissions, permission.value]
                      : draft.permissions.filter((value) => value !== permission.value),
                  })}
                />
                {permission.label}
              </label>
            ))}
          </div>
        </div>
        <Input required={!editing} placeholder={editing ? "New password optional" : "Password"} type="password" value={draft.password} error={errors.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
        <div className="flex gap-2"><Button disabled={busy}>{editing ? "Update staff" : "Create staff"}</Button><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button></div>
      </form>
      </Drawer>
      <AdminTable columns={["Name", "Email", "Phone", "Role", "Permissions", "Date", "Actions"]} rows={staff.map((user) => [user.name, user.email, user.phone || "-", <StatusBadge key="role" status={user.role} />, (user.permissions || []).join(", ") || "Role defaults", <DateCell key="date" value={user.created_at} />, <ActionButtons key="actions" busy={busy} onEdit={() => edit(user)} onDelete={() => run(() => adminService.deleteStaff(user.id), "Staff user deleted.")} />])} />
    </AdminCard>
  );
}

function OrderTable({ orders, action }: { orders: Order[]; action?: (order: Order) => ReactNode }) {
  return (
    <AdminTable columns={["Order", "Customer", "Total", "Status", "Payment", "Date", ...(action ? ["Action"] : [])]} rows={orders.map((order) => [
      <span key="order"><strong>{order.order_number}</strong></span>,
      <span key="customer">{order.customer.name}<br /><small className="text-neutral-500">{order.customer.phone || order.customer.email}</small></span>,
      formatCurrency(order.total),
      <StatusBadge key="status" status={order.status} />,
      <StatusBadge key="payment" status={order.payment_status} />,
      <DateCell key="date" value={order.created_at} />,
      ...(action ? [action(order)] : []),
    ])} />
  );
}

function PanelTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-2xl font-medium tracking-[-0.04em]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const normalized = String(status || "unknown").toLowerCase().replace(/\s+/g, "_");
  const success = ["active", "approved", "paid", "success", "delivered", "complete", "completed", "shown", "admin", "restock", "return"];
  const warning = ["pending", "processing", "assigned", "out_for_delivery", "manager", "adjustment"];
  const danger = ["cancelled", "canceled", "failed", "rejected", "inactive", "refunded", "damage"];
  const className = success.includes(normalized)
    ? "border-green-200 bg-green-50 text-green-700"
    : warning.includes(normalized)
      ? "border-yellow-200 bg-yellow-50 text-yellow-800"
      : danger.includes(normalized)
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-neutral-200 bg-neutral-100 text-neutral-600";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase", className)}>
      {titleCase(normalized)}
    </span>
  );
}

function DateCell({ value }: { value?: string | null }) {
  return <span className="whitespace-nowrap text-sm text-neutral-600">{relativeDate(value)}</span>;
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-neutral-50 p-4">
      <p className="text-[11px] font-bold uppercase text-neutral-500">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-black">{value}</p>
    </div>
  );
}

function ImageTile({
  src,
  alt,
  removeIcon,
  onView,
  onRemove,
}: {
  src: string;
  alt: string;
  removeIcon: "trash" | "x";
  onView: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-neutral-100">
      <img src={src} alt={alt} className="aspect-square w-full object-cover transition duration-200 group-hover:scale-105" />
      <div className="absolute inset-x-2 top-2 flex justify-between gap-2">
        <button
          type="button"
          className="grid size-8 place-items-center rounded-full bg-white/95 text-black shadow-sm hover:bg-black hover:text-white"
          onClick={onView}
          aria-label="View image"
        >
          <EyeIcon />
        </button>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-full bg-white/95 text-red-600 shadow-sm hover:bg-red-600 hover:text-white"
          onClick={onRemove}
          aria-label="Remove image"
        >
          {removeIcon === "trash" ? <TrashIcon /> : <XIcon />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function ImagePreviewDialog({ image, onClose }: { image: { src: string; label: string } | null; onClose: () => void }) {
  if (!image) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-[2px]">
      <div className="animate-pop-in w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase text-neutral-500">Image preview</p>
            <h2 className="mt-1 text-2xl font-medium tracking-[-0.05em]">{image.label}</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-neutral-200 text-xl hover:bg-neutral-100" onClick={onClose} aria-label="Close image preview">
            ×
          </button>
        </div>
        <div className="bg-neutral-50 p-4">
          <img src={image.src} alt={image.label} className="max-h-[70vh] w-full rounded-[22px] object-contain" />
        </div>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-11 items-center gap-3 rounded-full border border-neutral-200 px-3 text-sm">
      <span className="grid size-7 place-items-center overflow-hidden rounded-full border border-neutral-200">
        <input className="size-10 cursor-pointer border-0 p-0" type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      </span>
      <span className="font-bold">{label}</span>
    </label>
  );
}

function ActionButtons({ busy, onEdit, onDelete }: { busy?: boolean; onEdit: () => void; onDelete: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="h-8 px-3" disabled={busy} onClick={onEdit}>Edit</Button>
        <Button type="button" className="h-8 px-3" disabled={busy} onClick={() => setConfirmOpen(true)}>Delete</Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        busy={busy}
        title="Delete this record?"
        message="Please confirm before deleting. This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete();
        }}
      />
    </>
  );
}

function SalesAreaChart({ rows }: { rows: Array<{ label: string; revenue: number; orders: number }> }) {
  if (!rows.length) return <EmptyState message="No chart data yet." />;
  return (
    <div className="mt-5 h-[310px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows.slice(-12)} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="salesRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#111827" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#111827" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} width={72} tick={{ fill: "#737373", fontSize: 12 }} tickFormatter={(value) => formatCurrency(Number(value)).replace("LKR", "").trim()} />
          <Tooltip
            cursor={{ stroke: "#111827", strokeWidth: 1 }}
            contentStyle={{ borderRadius: 18, border: "1px solid #e5e5e5", boxShadow: "0 18px 45px rgba(0,0,0,0.12)" }}
            formatter={(value, name) => [name === "revenue" ? formatCurrency(Number(value)) : value, titleCase(String(name))]}
          />
          <Area type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={3} fill="url(#salesRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function BestSellerChart({ rows }: { rows: Array<{ label: string; quantity: number; revenue: number }> }) {
  if (!rows.length) return <EmptyState message="No best-selling products yet." />;

  return (
    <div className="mt-5 h-[310px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={rows.slice(0, 8)} layout="vertical" margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid horizontal={false} stroke="#e5e5e5" />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" width={120} tickLine={false} axisLine={false} tick={{ fill: "#525252", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "#f5f5f5" }}
            contentStyle={{ borderRadius: 18, border: "1px solid #e5e5e5", boxShadow: "0 18px 45px rgba(0,0,0,0.12)" }}
            formatter={(value, name) => [name === "revenue" ? formatCurrency(Number(value)) : value, titleCase(String(name))]}
          />
          <Bar dataKey="quantity" fill="#111827" radius={[0, 10, 10, 0]} barSize={18} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function productPayload(draft: ProductDraft, colors: ProductColor[] = []) {
  const variants = variantRowsPayload(draft.variant_rows, colors);
  const variantStockTotal = variants.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0);

  return {
    category_id: Number(draft.category_id),
    brand_id: draft.brand_id ? Number(draft.brand_id) : null,
    size_guide_id: draft.size_guide_id ? Number(draft.size_guide_id) : null,
    name: draft.name,
    slug: draft.slug,
    description: draft.description,
    seo_title: draft.seo_title,
    seo_description: draft.seo_description,
    seo_keywords: draft.seo_keywords,
    price: Number(draft.price),
    cost_price: Number(draft.cost_price || 0),
    sku: draft.sku,
    stock_quantity: variants.length ? variantStockTotal : Number(draft.stock_quantity),
    status: draft.status,
    is_featured: draft.is_featured,
    tag_ids: draft.tag_ids,
    collection_ids: draft.collection_ids,
    color_ids: draft.color_ids,
    related_product_ids: draft.related_product_ids,
    specifications: parseSpecifications(draft.specifications_text),
    variants,
  };
}

function shippingPayload(draft: ShippingDraft) {
  return {
    name: draft.name,
    code: draft.code || slugify(draft.name),
    description: draft.description,
    fee: Number(draft.fee || 0),
    min_order_total: draft.min_order_total ? Number(draft.min_order_total) : null,
    sort_order: Number(draft.sort_order || 0),
    is_active: draft.is_active,
  };
}

function bannerFormData(draft: BannerDraft, image: File | null) {
  const formData = new FormData();
  const payload = {
    title: draft.title,
    subtitle: draft.subtitle,
    link_url: draft.link_url,
    position: draft.position,
    starts_at: draft.starts_at || null,
    ends_at: draft.ends_at || null,
    sort_order: Number(draft.sort_order || 0),
    is_active: draft.is_active,
  };
  appendFormData(formData, payload);
  if (image) formData.append("image", image);
  return formData;
}

function validateBannerDraft(draft: BannerDraft, image: File | null) {
  const errors: Record<string, string> = {};
  if (!draft.position.trim()) errors.position = "Choose where this banner should appear.";
  if (!draft.title.trim()) errors.title = "Banner title is required.";
  if (draft.subtitle.length > 500) errors.subtitle = "Subtitle must be 500 characters or less.";
  if (!image && !draft.current_image_url) errors.image = "Please upload a banner image.";
  if (image && !image.type.startsWith("image/")) errors.image = "Please select a valid image file.";
  if (image && image.size > 4 * 1024 * 1024) errors.image = "Image must be 4MB or smaller.";
  if (draft.link_url && !draft.link_url.startsWith("/") && !draft.link_url.startsWith("http://") && !draft.link_url.startsWith("https://")) {
    errors.link_url = "Use a site path like /products or a full URL.";
  }
  if (draft.sort_order && Number(draft.sort_order) < 0) errors.sort_order = "Sort order cannot be negative.";
  if (draft.starts_at && draft.ends_at && new Date(draft.ends_at) < new Date(draft.starts_at)) {
    errors.ends_at = "End date must be after start date.";
  }
  return errors;
}

function validateStoreDraft(draft: StoreDraft) {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = "Store name is required.";
  if (draft.email && !isEmail(draft.email)) errors.email = "Enter a valid email address.";
  if (!draft.currency.trim()) errors.currency = "Currency is required.";
  if (draft.currency && draft.currency.trim().length !== 3) errors.currency = "Use a 3-letter currency code like LKR.";
  if (draft.delivery_fee && Number(draft.delivery_fee) < 0) errors.delivery_fee = "Delivery fee cannot be negative.";
  if (draft.domain && /\s/.test(draft.domain)) errors.domain = "Domain cannot contain spaces.";
  if (draft.custom_domain && /\s/.test(draft.custom_domain)) errors.custom_domain = "Custom domain cannot contain spaces.";
  return errors;
}

function validateProductDraft(draft: ProductDraft) {
  const errors: Record<string, string> = {};
  if (!draft.category_id) errors.category_id = "Select a category.";
  if (!draft.name.trim()) errors.name = "Product name is required.";
  if (!draft.slug.trim()) errors.slug = "Slug is required.";
  if (draft.slug && !isSlug(draft.slug)) errors.slug = "Use lowercase letters, numbers, and hyphens only.";
  if (draft.price === "" || Number(draft.price) < 0) errors.price = "Enter a valid product price.";
  if (draft.cost_price && Number(draft.cost_price) < 0) errors.cost_price = "Cost price cannot be negative.";
  if (draft.stock_quantity === "" || Number(draft.stock_quantity) < 0 || !Number.isInteger(Number(draft.stock_quantity))) {
    errors.stock_quantity = "Stock must be a whole number.";
  }
  return errors;
}

function validateCategoryDraft(draft: CategoryDraft) {
  const errors: Record<string, string> = {};
  if (!draft.is_parent && !draft.parent_id) errors.parent_id = "Select the parent category.";
  if (!draft.name.trim()) errors.name = "Category name is required.";
  if (!draft.slug.trim()) errors.slug = "Slug is required.";
  if (draft.slug && !isSlug(draft.slug)) errors.slug = "Use lowercase letters, numbers, and hyphens only.";
  if (draft.sort_order && Number(draft.sort_order) < 0) errors.sort_order = "Menu order cannot be negative.";
  return errors;
}

function validateCouponDraft(draft: CouponDraft) {
  const errors: Record<string, string> = {};
  if (!draft.code.trim()) errors.code = "Coupon code is required.";
  if (draft.value === "" || Number(draft.value) <= 0) errors.value = "Discount value must be greater than 0.";
  if (draft.type === "percentage" && Number(draft.value) > 100) errors.value = "Percentage discount cannot be over 100%.";
  if (draft.usage_limit && (!Number.isInteger(Number(draft.usage_limit)) || Number(draft.usage_limit) < 1)) {
    errors.usage_limit = "Usage limit must be a whole number.";
  }
  if (draft.starts_at && draft.ends_at && new Date(draft.ends_at) < new Date(draft.starts_at)) {
    errors.ends_at = "End date must be after start date.";
  }
  return errors;
}

function validateShippingDraft(draft: ShippingDraft) {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = "Shipping method name is required.";
  if (draft.code && !isSlug(draft.code)) errors.code = "Use lowercase letters, numbers, and hyphens only.";
  if (draft.fee === "" || Number(draft.fee) < 0) errors.fee = "Fee cannot be negative.";
  if (draft.min_order_total && Number(draft.min_order_total) < 0) errors.min_order_total = "Minimum order cannot be negative.";
  if (draft.sort_order && Number(draft.sort_order) < 0) errors.sort_order = "Sort order cannot be negative.";
  return errors;
}

function validateRestockDraft(draft: RestockDraft) {
  const errors: Record<string, string> = {};
  if (!draft.quantity || Number(draft.quantity) <= 0 || !Number.isInteger(Number(draft.quantity))) {
    errors.quantity = "Quantity must be a whole number greater than 0.";
  }
  if (!draft.note.trim()) errors.note = "Please add a reason note.";
  return errors;
}

function validateBranchDraft(draft: BranchDraft) {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = "Branch name is required.";
  return errors;
}

function validateStaffDraft(draft: StaffDraft, editing: boolean) {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = "Staff name is required.";
  if (!draft.email.trim()) errors.email = "Email is required.";
  if (draft.email && !isEmail(draft.email)) errors.email = "Enter a valid email address.";
  if (!editing && draft.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (editing && draft.password && draft.password.length < 8) errors.password = "New password must be at least 8 characters.";
  return errors;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function productFormData(draft: ProductDraft, files: File[], colors: ProductColor[] = []) {
  const payload = productPayload(draft, colors);
  const formData = new FormData();
  appendFormData(formData, payload);
  files.forEach((file) => formData.append("images[]", file));
  return formData;
}

function emptyVariantDraft(): ProductVariantDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    size: "",
    color_id: "",
    sku: "",
    price_adjustment: "0",
    stock_quantity: "0",
  };
}

function normalizeHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#111111";
}

function appendFormData(formData: FormData, payload: Record<string, unknown>, prefix?: string) {
  Object.entries(payload).forEach(([key, value]) => {
    const field = prefix ? `${prefix}[${key}]` : key;
    if (value === null || value === undefined) {
      formData.append(field, "");
      return;
    }
    if (typeof value === "boolean") {
      formData.append(field, value ? "1" : "0");
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          appendFormData(formData, item as Record<string, unknown>, `${field}[${index}]`);
        } else {
          formData.append(`${field}[]`, String(item));
        }
      });
      return;
    }
    if (typeof value === "object") {
      appendFormData(formData, value as Record<string, unknown>, field);
      return;
    }
    formData.append(field, String(value));
  });
}

function parseSpecifications(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name, ...rest] = line.split(":");
      return { name: name.trim(), value: rest.join(":").trim(), sort_order: index };
    })
    .filter((item) => item.name);
}

function variantRowsPayload(rows: ProductVariantDraft[], colors: ProductColor[]) {
  return rows
    .filter((row) => row.size || row.color_id || row.sku || Number(row.stock_quantity || 0) > 0)
    .map((row) => {
      const colorName = row.color_id ? colors.find((color) => color.id === Number(row.color_id))?.name || `Color ${row.color_id}` : "";
      const label = [row.size, colorName].filter(Boolean).join(" / ") || row.sku || "Variant";

      return {
        attribute_name: row.size && row.color_id ? "combination" : row.size ? "size" : "color",
        attribute_value: label,
        options: {
          ...(row.size ? { size: row.size } : {}),
          ...(row.color_id ? { color_id: row.color_id, color: colorName } : {}),
        },
        sku: row.sku,
        price_adjustment: Number(row.price_adjustment || 0),
        stock_quantity: Number(row.stock_quantity || 0),
      };
    });
}

function variantToDraft(variant: ProductVariant, colors: ProductColor[]): ProductVariantDraft {
  const options = variant.options || {};
  const colorId = String(options.color_id || colors.find((color) => color.name.toLowerCase() === String(options.color || "").toLowerCase())?.id || "");

  return {
    id: String(variant.id),
    size: String(options.size || ""),
    color_id: colorId,
    sku: variant.sku || "",
    price_adjustment: String(variant.price_adjustment || 0),
    stock_quantity: String(variant.stock_quantity || 0),
  };
}

function storeDraftFromStore(store: StoreSettings): StoreDraft {
  return {
    name: store.name || "",
    email: store.contact?.email || "",
    phone: store.contact?.phone || "",
    address: store.contact?.address || "",
    currency: store.currency || "LKR",
    domain: store.domain || "",
    custom_domain: store.custom_domain || "",
    plan: store.plan || "simple",
    primary: store.theme?.primary || "#111111",
    secondary: store.theme?.secondary || "#d8dfcc",
    accent: store.theme?.accent || "#ef4444",
    delivery_fee: String(store.settings?.delivery_fee || 0),
    notice_enabled: Boolean(store.settings?.promo_notice?.enabled),
    notice_message: store.settings?.promo_notice?.message || "",
    notice_coupon_code: store.settings?.promo_notice?.coupon_code || "",
    notice_href: store.settings?.promo_notice?.href || "/products",
  };
}

function storePayload(draft: StoreDraft) {
  return {
    name: draft.name,
    email: draft.email,
    phone: draft.phone,
    address: draft.address,
    currency: draft.currency,
    domain: draft.domain,
    custom_domain: draft.custom_domain,
    plan: draft.plan,
    theme: {
      primary: draft.primary,
      secondary: draft.secondary,
      accent: draft.accent,
    },
    settings: {
      delivery_fee: Number(draft.delivery_fee || 0),
      promo_notice: {
        enabled: draft.notice_enabled,
        message: draft.notice_message,
        coupon_code: draft.notice_coupon_code,
        href: draft.notice_href || "/products",
      },
    },
  };
}

function buildAdminNotifications(data: ReturnType<typeof useAdmin>["data"]): AdminNotification[] {
  if (data.notifications?.length) {
    return data.notifications.map((notification, index) => ({
      id: `${notification.type}-${index}`,
      title: notification.title,
      message: notification.message,
      tone: notification.type.includes("failed") || notification.type.includes("low_stock") ? "warning" : notification.type.includes("new_order") ? "info" : "success",
      tab: tabs.includes(notification.target as Tab) ? notification.target as Tab : "overview",
    }));
  }

  const lowStockAlerts = (data.notificationProducts || data.products)
    .filter((product) => product.low_stock || product.stock_quantity <= 10)
    .slice(0, 6)
    .map((product) => ({
      id: `stock-${product.id}`,
      title: "Low stock",
      message: `${product.name} has ${product.stock_quantity} units remaining.`,
      tone: "warning" as const,
      tab: "inventory" as const,
    }));

  const pendingOrderAlerts = (data.notificationOrders || data.orders)
    .filter((order) => order.status === "pending")
    .slice(0, 6)
    .map((order) => ({
      id: `order-${order.id}`,
      title: "New order confirmation",
      message: `${order.order_number} from ${order.customer.name} is waiting for processing.`,
      tone: "info" as const,
      tab: "orders" as const,
    }));

  const paymentAlerts = (data.notificationPayments || data.payments)
    .filter((payment) => ["pending", "failed"].includes(payment.status))
    .slice(0, 4)
    .map((payment) => ({
      id: `payment-${payment.id}`,
      title: payment.status === "failed" ? "Payment failed" : "Payment pending",
      message: `${payment.order_number || `Order #${payment.order_id}`} via ${payment.method} needs review.`,
      tone: payment.status === "failed" ? "warning" as const : "info" as const,
      tab: "payments" as const,
    }));

  const paidOrders = (data.notificationOrders || data.orders)
    .filter((order) => order.payment_status === "paid" && ["paid", "processing"].includes(order.status))
    .slice(0, 3)
    .map((order) => ({
      id: `confirmed-${order.id}`,
      title: "Order confirmed",
      message: `${order.order_number} is paid and ready for fulfillment.`,
      tone: "success" as const,
      tab: "orders" as const,
    }));

  return [...lowStockAlerts, ...pendingOrderAlerts, ...paymentAlerts, ...paidOrders];
}

function dateOnly(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function datetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function relativeDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return `${diffSeconds || 1} sec ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryOptions(categories: Category[], excludeId?: number) {
  const excludedIds = new Set(excludeId ? [excludeId, ...descendantIds(categories, excludeId)] : []);
  return flattenCategoryTree(categories.filter((category) => !excludedIds.has(category.id))).map((category) => ({
    label: `${"— ".repeat(category.depth)}${category.name}`,
    value: String(category.id),
  }));
}

function categoryParentOptions(categories: Category[], excludeId?: number) {
  return categoryOptions(categories, excludeId);
}

function flattenCategoryTree(categories: Category[]) {
  const childrenByParent = categories.reduce<Record<string, Category[]>>((groups, category) => {
    const key = String(category.parent_id || "root");
    groups[key] = [...(groups[key] || []), category];
    return groups;
  }, {});

  const walk = (parentKey: string, depth = 0): Array<Category & { depth: number }> =>
    (childrenByParent[parentKey] || [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((category) => [{ ...category, depth }, ...walk(String(category.id), depth + 1)]);

  return walk("root");
}

function descendantIds(categories: Category[], parentId: number): number[] {
  const children = categories.filter((category) => category.parent_id === parentId);
  return children.flatMap((child) => [child.id, ...descendantIds(categories, child.id)]);
}

function categoryPath(category: Category, categories: Category[]) {
  const path = [category.name];
  let parentId = category.parent_id;
  while (parentId) {
    const parent = categories.find((item) => item.id === parentId);
    if (!parent) break;
    path.unshift(parent.name);
    parentId = parent.parent_id || null;
  }
  return path.join(" > ");
}

function exportAdminCsv(tab: Tab, data: ReturnType<typeof useAdmin>["data"]) {
  exportCsv(`admin-${tab}`, getExportRows(tab, data));
}

function exportAdminExcel(tab: Tab, data: ReturnType<typeof useAdmin>["data"]) {
  exportExcel(`admin-${tab}`, getExportRows(tab, data));
}

function exportAdminPdf(tab: Tab, data: ReturnType<typeof useAdmin>["data"]) {
  exportPdf(`Admin ${tabLabels[tab]}`, getExportRows(tab, data));
}

function getExportRows(tab: Tab, data: ReturnType<typeof useAdmin>["data"]) {
  const map: Record<Tab, unknown[]> = {
    overview: data.orders,
    store: data.store ? [data.store] : [],
    products: data.products,
    categories: data.categories,
    orders: data.orders,
    coupons: data.coupons,
    reviews: data.reviews || [],
    questions: data.questions || [],
    reports: data.salesReport?.best_selling_products || [],
    payments: data.payments,
    shipping: data.shippingMethods || [],
    marketing: data.marketingBanners || [],
    newsletter: data.newsletterSubscribers || [],
    inventory: data.inventoryLogs,
    branches: data.branches,
    staff: data.staff,
    audit: data.auditLogs || [],
  };
  return map[tab];
}

function exportCsv(filename: string, rows: unknown[]) {
  if (!rows.length) return;
  const objects = rows.map((row) => flatten(row as Record<string, unknown>));
  const headers = Object.keys(objects[0]);
  const csv = [
    headers.join(","),
    ...objects.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportExcel(filename: string, rows: unknown[]) {
  if (!rows.length) return;
  const objects = rows.map((row) => flatten(row as Record<string, unknown>));
  const headers = Object.keys(objects[0]);
  const table = `
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>
        ${objects.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(String(row[header] ?? ""))}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
  const blob = new Blob([table], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportPdf(title: string, rows: unknown[]) {
  if (!rows.length) return;
  const objects = rows.map((row) => flatten(row as Record<string, unknown>));
  const headers = Object.keys(objects[0]);
  const popup = window.open("", "_blank", "width=1200,height=800");
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #111; }
          h1 { font-size: 24px; margin-bottom: 18px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 7px; text-align: left; vertical-align: top; }
          th { background: #111; color: white; }
          tr:nth-child(even) { background: #f7f7f7; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <table>
          <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>${objects.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(String(row[header] ?? ""))}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
        <script>window.onload = () => { window.print(); };</script>
      </body>
    </html>
  `);
  popup.document.close();
}

function printInvoice(order: Order) {
  const popup = window.open("", "_blank", "width=980,height=1200");
  if (!popup) return;

  const items = order.items || [];
  const itemsTotal = items.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
  const subtotal = Number(order.subtotal || itemsTotal);
  const discount = Number(order.discount_total || 0);
  const deliveryFee = Number(order.delivery_fee || 0);
  const total = Number(order.total || subtotal - discount + deliveryFee);
  const createdAt = order.created_at ? new Date(order.created_at).toLocaleString() : "-";

  popup.document.write(`
    <html>
      <head>
        <title>Invoice ${escapeHtml(order.order_number)}</title>
        <style>
          @page { size: A4; margin: 16mm; }
          * { box-sizing: border-box; }
          html, body { margin: 0; overflow: visible !important; background: #f4f4f1; color: #111; font-family: Arial, Helvetica, sans-serif; }
          body::-webkit-scrollbar { display: none; }
          body { -ms-overflow-style: none; scrollbar-width: none; }
          .sheet { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 28px; }
          .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #111; padding-bottom: 22px; }
          .brand { font-size: 14px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
          .muted { color: #666; font-size: 12px; line-height: 1.7; }
          h1 { margin: 10px 0 0; font-size: 42px; line-height: .95; letter-spacing: -0.05em; font-weight: 500; }
          .invoice-meta { text-align: right; font-size: 12px; line-height: 1.8; }
          .badge { display: inline-block; border-radius: 999px; padding: 5px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; border: 1px solid #ddd; background: #f7f7f7; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; }
          .box { border: 1px solid #e5e5e5; border-radius: 18px; padding: 16px; min-height: 120px; }
          .label { margin: 0 0 10px; font-size: 10px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; color: #777; }
          .value { margin: 0; font-size: 14px; line-height: 1.65; }
          table { width: 100%; border-collapse: collapse; margin-top: 26px; font-size: 12px; }
          th { background: #111; color: #fff; text-align: left; padding: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
          td { border-bottom: 1px solid #ededed; padding: 13px 12px; vertical-align: top; }
          .right { text-align: right; }
          .totals { width: 300px; margin: 22px 0 0 auto; font-size: 13px; }
          .totals-row { display: flex; justify-content: space-between; border-bottom: 1px solid #ededed; padding: 9px 0; }
          .grand { font-size: 20px; font-weight: 900; border-bottom: 0; padding-top: 14px; }
          .notes { margin-top: 28px; border-radius: 18px; background: #f7f7f4; padding: 16px; font-size: 12px; line-height: 1.7; color: #555; }
          .footer { margin-top: 34px; display: flex; justify-content: space-between; gap: 24px; border-top: 1px solid #e5e5e5; padding-top: 16px; font-size: 11px; color: #777; }
          @media print {
            html, body { width: 210mm; background: #fff !important; overflow: visible !important; }
            .sheet { width: auto; min-height: auto; margin: 0; padding: 0; box-shadow: none; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <main class="sheet">
          <section class="top">
            <div>
              <div class="brand">ECOMMERCE</div>
              <h1>Invoice</h1>
              <p class="muted">Reusable ecommerce backend invoice<br />Generated from the admin panel</p>
            </div>
            <div class="invoice-meta">
              <strong>${escapeHtml(order.order_number)}</strong><br />
              ${escapeHtml(createdAt)}<br />
              <span class="badge">${escapeHtml(titleCase(order.status || "pending"))}</span>
              <span class="badge">${escapeHtml(titleCase(order.payment_status || "unpaid"))}</span>
            </div>
          </section>

          <section class="grid">
            <div class="box">
              <p class="label">Bill to</p>
              <p class="value">
                <strong>${escapeHtml(order.customer.name || "-")}</strong><br />
                ${escapeHtml(order.customer.email || "-")}<br />
                ${escapeHtml(order.customer.phone || "-")}
              </p>
            </div>
            <div class="box">
              <p class="label">Delivery</p>
              <p class="value">
                ${escapeHtml(order.delivery_address || "-")}<br />
                Method: ${escapeHtml(titleCase(order.shipping_method || "standard"))}<br />
                Tracking: ${escapeHtml(order.tracking_number || "-")}
              </p>
            </div>
          </section>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="right">Qty</th>
                <th class="right">Unit</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(item.product_name || "Item")}</strong><br />
                    <span class="muted">${escapeHtml(item.variant_label || "")}</span>
                  </td>
                  <td class="right">${item.quantity}</td>
                  <td class="right">${escapeHtml(formatCurrency(Number(item.unit_price || 0)))}</td>
                  <td class="right">${escapeHtml(formatCurrency(Number(item.line_total || 0)))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <section class="totals">
            <div class="totals-row"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(subtotal))}</strong></div>
            <div class="totals-row"><span>Discount</span><strong>${escapeHtml(formatCurrency(discount))}</strong></div>
            <div class="totals-row"><span>Delivery</span><strong>${escapeHtml(formatCurrency(deliveryFee))}</strong></div>
            <div class="totals-row grand"><span>Total</span><span>${escapeHtml(formatCurrency(total))}</span></div>
          </section>

          ${order.order_notes ? `<section class="notes"><strong>Order notes:</strong><br />${escapeHtml(order.order_notes)}</section>` : ""}

          <footer class="footer">
            <span>Thank you for your order.</span>
            <span>Printed on ${escapeHtml(new Date().toLocaleString())}</span>
          </footer>
        </main>
        <script>
          window.onload = () => {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  popup.document.close();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] || character);
}

function flatten(row: Record<string, unknown>, prefix = ""): Record<string, string | number | boolean | null> {
  return Object.entries(row).reduce<Record<string, string | number | boolean | null>>((acc, [key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return { ...acc, ...flatten(value as Record<string, unknown>, nextKey) };
    }
    acc[nextKey] = Array.isArray(value) ? JSON.stringify(value) : (value as string | number | boolean | null);
    return acc;
  }, {});
}
