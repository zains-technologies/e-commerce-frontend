"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { AdminCard, AdminTable, ConfirmDialog, Drawer, MetricCard, ToastMessage } from "@/components/admin/AdminPrimitives";
import { Button } from "@/components/common/Button";
import { Dropdown } from "@/components/common/Dropdown";
import { Input } from "@/components/common/Input";
import { EmptyState, ErrorState } from "@/components/common/StateBlock";
import { useAdmin } from "@/hooks/useAdmin";
import { formatCurrency, getPrimaryImage } from "@/lib/utils";
import { adminService } from "@/services/adminService";
import { authService } from "@/services/authService";
import type { Branch, Coupon, Order, Payment, StaffUser, StoreSettings } from "@/types/admin";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

const tabs = ["overview", "store", "products", "categories", "orders", "coupons", "reports", "payments", "inventory", "branches", "staff"] as const;
type Tab = (typeof tabs)[number];

const tabLabels: Record<Tab, string> = {
  overview: "Overview",
  store: "Store",
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  coupons: "Coupons",
  reports: "Reports",
  payments: "Payments",
  inventory: "Inventory",
  branches: "Branches",
  staff: "Staff",
};

const tabHref: Record<Tab, string> = {
  overview: "/admin",
  store: "/admin/store",
  products: "/admin/products",
  categories: "/admin/categories",
  orders: "/admin/orders",
  coupons: "/admin/coupons",
  reports: "/admin/reports",
  payments: "/admin/payments",
  inventory: "/admin/inventory",
  branches: "/admin/branches",
  staff: "/admin/staff",
};

type ProductDraft = {
  id?: number;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  cost_price: string;
  sku: string;
  stock_quantity: string;
  status: string;
  is_featured: boolean;
};

type CategoryDraft = {
  id?: number;
  name: string;
  slug: string;
  description: string;
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
};

const emptyProduct: ProductDraft = { category_id: "1", name: "", slug: "", description: "", price: "", cost_price: "", sku: "", stock_quantity: "", status: "active", is_featured: false };
const emptyCategory: CategoryDraft = { name: "", slug: "", description: "", is_active: true };
const emptyCoupon: CouponDraft = { code: "", type: "percentage", value: "10", starts_at: "", ends_at: "", usage_limit: "50", is_active: true };
const emptyBranch: BranchDraft = { name: "", phone: "", address: "", is_active: true };
const emptyStaff: StaffDraft = { name: "", email: "", phone: "", role: "staff", password: "password" };
const emptyStore: StoreDraft = { name: "", email: "", phone: "", address: "", currency: "LKR", domain: "localhost", custom_domain: "", plan: "simple", primary: "#111111", secondary: "#d8dfcc", accent: "#ef4444", delivery_fee: "0" };
const planOptions = [{ label: "Simple", value: "simple" }, { label: "Mid", value: "mid" }, { label: "Pro", value: "pro" }];
const productStatusOptions = [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }, { label: "Draft", value: "draft" }];
const couponTypeOptions = [{ label: "Percentage", value: "percentage" }, { label: "Fixed", value: "fixed" }];
const orderStatusOptions = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"].map((status) => ({ label: titleCase(status), value: status }));
const paymentStatusOptions = ["pending", "paid", "failed", "refunded"].map((status) => ({ label: titleCase(status), value: status }));
const staffRoleOptions = [{ label: "Admin", value: "admin" }, { label: "Manager", value: "manager" }, { label: "Staff", value: "staff" }];
const pageSizeOptions = [12, 24, 48].map((size) => ({ label: String(size), value: String(size) }));

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
    <main className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 border-b border-neutral-100 bg-white/90 backdrop-blur">
        <div className="container-shell flex h-16 items-center justify-between">
          <Link href="/" className="font-black tracking-tight">ECOMMERCE</Link>
          <div className="flex items-center gap-3">
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
            <Link href="/products" className="hidden text-xs font-bold uppercase text-neutral-500 hover:text-black md:inline">Storefront</Link>
            <Button variant="outline" className="h-9 px-4" onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>

      <div className="container-shell py-6">
        <section className="relative overflow-hidden rounded-[32px] bg-[#d8dfcc] p-6 md:p-10">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 opacity-70 md:block">
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=85" alt="" className="image-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#d8dfcc] via-[#d8dfcc]/50 to-transparent" />
          </div>
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase text-black/50">Store command center</p>
            <h1 className="mt-4 text-5xl font-medium leading-[0.9] tracking-[-0.08em] md:text-7xl">Admin panel</h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-black/65">Complete admin surface for catalog, orders, payments, reports, inventory, branches, and staff.</p>
          </div>
        </section>
      </div>

      <div className="container-shell grid gap-6 pb-10 lg:grid-cols-[250px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="hide-scrollbar flex gap-2 overflow-x-auto rounded-[28px] border border-neutral-200 bg-white p-2 lg:grid">
            {tabs.map((item) => (
              <Link key={item} href={tabHref[item]} className={`shrink-0 rounded-full px-4 py-3 text-left text-xs font-bold uppercase ${tab === item ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-black"}`}>
                {tabLabels[item]}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-3 border-b border-neutral-100 pb-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-medium tracking-[-0.07em]">{tabLabels[tab]}</h2>
              <p className="mt-2 text-sm text-neutral-500">CRUD actions use your Laravel admin endpoints and refresh after saving.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-10 px-5" onClick={() => exportAdminCsv(tab, data)}>Export CSV</Button>
              <Button variant="outline" className="h-10 px-5" disabled={refreshing} onClick={refresh}>{refreshing ? "Refreshing..." : "Refresh"}</Button>
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

              {tab === "reports" && (
                <ReportsPanel data={data} />
              )}

              {tab === "payments" && (
                <PaymentsPanel payments={data.payments} busy={busy} run={run} />
              )}

              {tab === "inventory" && (
                <InventoryPanel products={data.products} logs={data.inventoryLogs} />
              )}

              {tab === "branches" && (
                <BranchPanel branches={data.branches} busy={busy} run={run} />
              )}

              {tab === "staff" && (
                <StaffPanel staff={data.staff} busy={busy} run={run} />
              )}
            </>
          )}
        </section>
      </div>
      <footer className="border-t border-neutral-100 py-6">
        <div className="container-shell flex flex-col justify-between gap-2 text-xs text-neutral-500 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
          <p>
            Built by{" "}
            <a className="font-bold text-black hover:text-neutral-600" href="https://www.mintboxstudio.com/" target="_blank" rel="noreferrer">
              MintBox.Studio
            </a>
          </p>
        </div>
      </footer>
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
          <h2 className="mb-4 text-2xl font-medium tracking-[-0.04em]">Sales trend</h2>
          <BarChart rows={(data.salesReport?.sales_by_date || []).map((row) => ({ label: row.date, value: Number(row.revenue) }))} />
        </AdminCard>
        <AdminCard>
          <h2 className="mb-4 text-2xl font-medium tracking-[-0.04em]">Best sellers</h2>
          <MiniList items={(data.salesReport?.best_selling_products || []).map((item) => ({ label: item.product_name, value: `${item.quantity_sold} sold` }))} />
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

  async function submit(event: FormEvent) {
    event.preventDefault();
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
          <Input required placeholder="Store name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <Input placeholder="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </div>
          <Input placeholder="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input required placeholder="Currency" value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value.toUpperCase() })} />
            <Dropdown value={draft.plan} options={planOptions} onChange={(value) => setDraft({ ...draft, plan: value as StoreDraft["plan"] })} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Default domain" value={draft.domain} onChange={(e) => setDraft({ ...draft, domain: e.target.value })} />
            <Input placeholder="Custom domain" value={draft.custom_domain} onChange={(e) => setDraft({ ...draft, custom_domain: e.target.value })} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <ColorInput label="Primary" value={draft.primary} onChange={(value) => setDraft({ ...draft, primary: value })} />
            <ColorInput label="Secondary" value={draft.secondary} onChange={(value) => setDraft({ ...draft, secondary: value })} />
            <ColorInput label="Accent" value={draft.accent} onChange={(value) => setDraft({ ...draft, accent: value })} />
          </div>
          <Input placeholder="Delivery fee" type="number" value={draft.delivery_fee} onChange={(e) => setDraft({ ...draft, delivery_fee: e.target.value })} />
          <div className="flex gap-2">
            <Button disabled={busy}>{busy ? "Saving..." : "Save store"}</Button>
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

function ProductPanel({ products, categories, busy, search, setSearch, run }: {
  products: Product[];
  categories: Category[];
  busy: boolean;
  search: string;
  setSearch: (value: string) => void;
  run: (action: () => Promise<unknown>, success: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const [viewer, setViewer] = useState<{ src: string; label: string } | null>(null);
  const [pendingImageDelete, setPendingImageDelete] = useState<{ id: number; label: string } | null>(null);
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
    setDraft({
      id: product.id,
      category_id: String(product.category?.id || categories[0]?.id || 1),
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: String(product.price),
      cost_price: String(product.cost_price || 0),
      sku: product.sku || "",
      stock_quantity: String(product.stock_quantity),
      status: product.status || "active",
      is_featured: Boolean(product.is_featured),
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

    await run(
      async () => {
        const payload = imageFiles.length ? productFormData(draft, imageFiles) : productPayload(draft);
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
    setDrawerOpen(false);
  }

  function openCreate() {
    setDraft({ ...emptyProduct, category_id: String(categories[0]?.id || 1) });
    setImageFiles([]);
    setImageError("");
    setDrawerOpen(true);
  }

  function removeSelectedImage(index: number) {
    setImageFiles((files) => {
      const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
      setImageError(nextFiles.length > 0 && nextFiles.length < 3 ? "Please choose at least 3 images." : "");
      return nextFiles;
    });
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Product CRUD" subtitle="Create, update, delete, and inspect product images from the API." />
        <Button type="button" onClick={openCreate}>Add product</Button>
      </div>
      <Drawer open={drawerOpen} size="wide" title={editing ? "Edit product" : "Add product"} subtitle="Upload 3 to 5 product images. Selecting new files while editing replaces the current images." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="grid gap-3">
        <Dropdown value={draft.category_id} options={categories.map((category) => ({ label: category.name, value: String(category.id) }))} placeholder="Select category" onChange={(value) => setDraft({ ...draft, category_id: value })} />
        <Input required placeholder="Product name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Input required placeholder="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
        <Input placeholder="SKU" value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
        <Input required placeholder="Price" type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
        <Input placeholder="Cost price" type="number" value={draft.cost_price} onChange={(e) => setDraft({ ...draft, cost_price: e.target.value })} />
        <Input required placeholder="Stock quantity" type="number" value={draft.stock_quantity} onChange={(e) => setDraft({ ...draft, stock_quantity: e.target.value })} />
        <Dropdown value={draft.status} options={productStatusOptions} onChange={(value) => setDraft({ ...draft, status: value })} />
        <textarea className="min-h-24 rounded-[24px] border border-neutral-200 p-4 text-sm outline-none" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm">
          <input type="checkbox" checked={draft.is_featured} onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })} />
          Featured
        </label>
          </div>
          <div className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-4">
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
        <div className="flex gap-2">
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

      <AdminTable columns={["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"]} rows={paginatedProducts.map((product) => [
        <img key="img" src={getPrimaryImage(product.images)} alt={product.name} className="size-16 rounded-2xl object-cover" />,
        <span key="name"><strong>{product.name}</strong><br /><small className="text-neutral-500">{product.sku || product.slug}</small></span>,
        product.category?.name || "-",
        formatCurrency(product.price),
        <span key="stock" className={product.low_stock || product.stock_quantity <= 10 ? "font-bold text-red-600" : ""}>{product.stock_quantity}</span>,
        product.status || "active",
        <ActionButtons key="actions" busy={busy} onEdit={() => edit(product)} onDelete={() => run(() => adminService.deleteProduct(product.id), "Product deleted.")} />,
      ])} />
    </AdminCard>
  );
}

function CategoryPanel({ categories, busy, run }: { categories: Category[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<CategoryDraft>(emptyCategory);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);

  function edit(category: Category) {
    setDraft({ id: category.id, name: category.name, slug: category.slug, description: category.description || "", is_active: Boolean(category.is_active) });
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { name: draft.name, slug: draft.slug, description: draft.description, is_active: draft.is_active };
    await run(() => editing && draft.id ? adminService.updateCategory(draft.id, payload) : adminService.createCategory(payload), editing ? "Category updated." : "Category created.");
    setDraft(emptyCategory);
    setDrawerOpen(false);
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Category CRUD" subtitle="Manage active/inactive categories and slugs." />
        <Button type="button" onClick={() => { setDraft(emptyCategory); setDrawerOpen(true); }}>Add category</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit category" : "Add category"} subtitle="Categories control storefront browsing and product grouping." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-3">
        <Input required placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Input required placeholder="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
        <Input placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm">
          <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active
        </label>
        <div className="flex gap-2"><Button disabled={busy}>{editing ? "Update category" : "Create category"}</Button><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button></div>
      </form>
      </Drawer>
      <AdminTable columns={["Name", "Slug", "Status", "Actions"]} rows={categories.map((category) => [
        category.name,
        category.slug,
        category.is_active ? "Active" : "Inactive",
        <ActionButtons key="actions" busy={busy} onEdit={() => edit(category)} onDelete={() => run(() => adminService.deleteCategory(category.id), "Category deleted.")} />,
      ])} />
    </AdminCard>
  );
}

function OrderPanel({ orders, busy, run }: { orders: Order[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  return (
    <AdminCard>
      <PanelTitle title="Order management" subtitle="Update order, payment, delivery status, and tracking numbers." />
      <OrderTable orders={orders} action={(order) => (
        <div className="grid gap-2">
          <Dropdown size="sm" disabled={busy} value={order.status} options={orderStatusOptions} onChange={(value) => run(() => adminService.updateOrderStatus(order.id, { status: value, payment_status: order.payment_status }), "Order status updated.")} />
          <Button className="h-8 px-3" disabled={busy} onClick={() => run(() => adminService.updateOrderStatus(order.id, { status: "delivered", payment_status: "paid", delivery_status: "delivered" }), "Order marked delivered and paid.")}>Complete</Button>
        </div>
      )} />
    </AdminCard>
  );
}

function CouponPanel({ coupons, busy, run }: { coupons: Coupon[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<CouponDraft>(emptyCoupon);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);

  function edit(coupon: Coupon) {
    setDraft({ id: coupon.id, code: coupon.code, type: coupon.type, value: String(coupon.value), starts_at: dateOnly(coupon.starts_at), ends_at: dateOnly(coupon.ends_at), usage_limit: String(coupon.usage_limit || ""), is_active: coupon.is_active });
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...draft, value: Number(draft.value), usage_limit: draft.usage_limit ? Number(draft.usage_limit) : null };
    await run(() => editing && draft.id ? adminService.updateCoupon(draft.id, payload) : adminService.createCoupon(payload), editing ? "Coupon updated." : "Coupon created.");
    setDraft(emptyCoupon);
    setDrawerOpen(false);
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Coupon CRUD" subtitle="Create percentage/fixed discounts and manage active status." />
        <Button type="button" onClick={() => { setDraft(emptyCoupon); setDrawerOpen(true); }}>Add coupon</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit coupon" : "Add coupon"} subtitle="Coupons are available for mid/pro plans." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-3">
        <Input required placeholder="Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} />
        <Dropdown value={draft.type} options={couponTypeOptions} onChange={(value) => setDraft({ ...draft, type: value as CouponDraft["type"] })} />
        <Input required placeholder="Value" type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
        <Input placeholder="Usage limit" type="number" value={draft.usage_limit} onChange={(e) => setDraft({ ...draft, usage_limit: e.target.value })} />
        <Input placeholder="Starts at" type="date" value={draft.starts_at} onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })} />
        <Input placeholder="Ends at" type="date" value={draft.ends_at} onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })} />
        <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active</label>
        <div className="flex gap-2"><Button disabled={busy}>{editing ? "Update coupon" : "Create coupon"}</Button><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button></div>
      </form>
      </Drawer>
      <AdminTable columns={["Code", "Type", "Value", "Used", "Status", "Actions"]} rows={coupons.map((coupon) => [
        coupon.code,
        coupon.type,
        coupon.type === "percentage" ? `${coupon.value}%` : formatCurrency(coupon.value),
        `${coupon.used_count || 0}/${coupon.usage_limit || "∞"}`,
        coupon.is_active ? "Active" : "Inactive",
        <ActionButtons key="actions" busy={busy} onEdit={() => edit(coupon)} onDelete={() => run(() => adminService.deleteCoupon(coupon.id), "Coupon deleted.")} />,
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
        <BarChart rows={(data.salesReport?.sales_by_date || []).map((row) => ({ label: row.date, value: Number(row.revenue) }))} />
      </AdminCard>
      <AdminCard>
        <div className="mb-4 flex items-center justify-between">
          <PanelTitle title="Best-selling products" subtitle="Quantity and revenue per product." />
          <Button variant="outline" onClick={() => exportCsv("best-selling-products", data.salesReport?.best_selling_products || [])}>Export best sellers</Button>
        </div>
        <AdminTable columns={["Product", "Quantity", "Revenue"]} rows={(data.salesReport?.best_selling_products || []).map((item) => [item.product_name, item.quantity_sold, formatCurrency(item.revenue)])} />
      </AdminCard>
    </div>
  );
}

function PaymentsPanel({ payments, busy, run }: { payments: Payment[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  return (
    <AdminCard>
      <PanelTitle title="Payment updates" subtitle="Mark manual/bank transfer payments paid, failed, pending, or refunded." />
      <AdminTable columns={["Order", "Method", "Status", "Amount", "Transaction", "Action"]} rows={payments.map((payment) => [
        payment.order_number || payment.order_id,
        payment.method,
        payment.status,
        formatCurrency(payment.amount),
        payment.transaction_id || "-",
        <Dropdown key="status" size="sm" disabled={busy} value={payment.status} options={paymentStatusOptions} onChange={(value) => run(() => adminService.updatePayment(payment.id, { status: value, transaction_id: payment.transaction_id || `MANUAL-${payment.id}` }), "Payment updated.")} />,
      ])} />
    </AdminCard>
  );
}

function InventoryPanel({ products, logs }: { products: Product[]; logs: ReturnType<typeof useAdmin>["data"]["inventoryLogs"] }) {
  const lowStock = products.filter((product) => product.low_stock || product.stock_quantity <= 10);
  return (
    <div className="grid gap-4">
      <AdminCard>
        <PanelTitle title="Low stock flags" subtitle="Products at or below the low-stock threshold." />
        <AdminTable columns={["Image", "Product", "SKU", "Stock"]} rows={lowStock.map((product) => [
          <img key="img" src={getPrimaryImage(product.images)} alt={product.name} className="size-14 rounded-2xl object-cover" />,
          product.name,
          product.sku || "-",
          <span key="stock" className="font-bold text-red-600">{product.stock_quantity}</span>,
        ])} />
      </AdminCard>
      <AdminCard>
        <PanelTitle title="Inventory logs" subtitle="Stock changes generated by orders and adjustments." />
        <AdminTable columns={["Type", "Product", "Change", "Stock After", "Note"]} rows={logs.map((log) => [log.type, log.product_id, log.quantity_change, log.stock_after, log.note || "-"])} />
      </AdminCard>
    </div>
  );
}

function BranchPanel({ branches, busy, run }: { branches: Branch[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<BranchDraft>(emptyBranch);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);

  function edit(branch: Branch) {
    setDraft({ id: branch.id, name: branch.name, phone: branch.phone || "", address: branch.address || "", is_active: branch.is_active });
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await run(() => editing && draft.id ? adminService.updateBranch(draft.id, draft) : adminService.createBranch(draft), editing ? "Branch updated." : "Branch created.");
    setDraft(emptyBranch);
    setDrawerOpen(false);
  }

  return (
    <AdminCard>
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <PanelTitle title="Branch CRUD" subtitle="Manage multi-branch locations for pro stores." />
        <Button type="button" onClick={() => { setDraft(emptyBranch); setDrawerOpen(true); }}>Add branch</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit branch" : "Add branch"} subtitle="Branches are available for pro plan stores." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-3">
        <Input required placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Input placeholder="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
        <Input placeholder="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
        <label className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active</label>
        <div className="flex gap-2"><Button disabled={busy}>{editing ? "Update branch" : "Create branch"}</Button><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button></div>
      </form>
      </Drawer>
      <AdminTable columns={["Name", "Phone", "Address", "Status", "Actions"]} rows={branches.map((branch) => [branch.name, branch.phone || "-", branch.address || "-", branch.is_active ? "Active" : "Inactive", <ActionButtons key="actions" busy={busy} onEdit={() => edit(branch)} onDelete={() => run(() => adminService.deleteBranch(branch.id), "Branch deleted.")} />])} />
    </AdminCard>
  );
}

function StaffPanel({ staff, busy, run }: { staff: StaffUser[]; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<StaffDraft>(emptyStaff);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editing = Boolean(draft.id);

  function edit(user: StaffUser) {
    setDraft({ id: user.id, name: user.name, email: user.email, phone: user.phone || "", role: user.role, password: "" });
    setDrawerOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
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
        <Button type="button" onClick={() => { setDraft(emptyStaff); setDrawerOpen(true); }}>Add staff</Button>
      </div>
      <Drawer open={drawerOpen} title={editing ? "Edit staff user" : "Add staff user"} subtitle="Staff roles are available for pro plan stores." onClose={() => setDrawerOpen(false)}>
      <form onSubmit={submit} className="grid gap-3">
        <Input required placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Input required placeholder="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        <Input placeholder="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
        <Dropdown value={draft.role} options={staffRoleOptions} onChange={(value) => setDraft({ ...draft, role: value as StaffDraft["role"] })} />
        <Input required={!editing} placeholder={editing ? "New password optional" : "Password"} type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
        <div className="flex gap-2"><Button disabled={busy}>{editing ? "Update staff" : "Create staff"}</Button><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button></div>
      </form>
      </Drawer>
      <AdminTable columns={["Name", "Email", "Phone", "Role", "Actions"]} rows={staff.map((user) => [user.name, user.email, user.phone || "-", user.role, <ActionButtons key="actions" busy={busy} onEdit={() => edit(user)} onDelete={() => run(() => adminService.deleteStaff(user.id), "Staff user deleted.")} />])} />
    </AdminCard>
  );
}

function OrderTable({ orders, action }: { orders: Order[]; action?: (order: Order) => ReactNode }) {
  return (
    <AdminTable columns={["Order", "Customer", "Total", "Status", "Payment", ...(action ? ["Action"] : [])]} rows={orders.map((order) => [
      <span key="order"><strong>{order.order_number}</strong><br /><small className="text-neutral-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}</small></span>,
      <span key="customer">{order.customer.name}<br /><small className="text-neutral-500">{order.customer.phone || order.customer.email}</small></span>,
      formatCurrency(order.total),
      order.status,
      order.payment_status,
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

function MiniList({ items }: { items: Array<{ label: string; value: string }> }) {
  if (!items.length) return <EmptyState message="No report rows yet." />;
  return (
    <div className="space-y-3">
      {items.slice(0, 6).map((item) => (
        <div key={item.label} className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3 text-sm">
          <span className="font-bold">{item.label}</span>
          <span className="text-neutral-500">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function BarChart({ rows }: { rows: Array<{ label: string; value: number }> }) {
  if (!rows.length) return <EmptyState message="No chart data yet." />;
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="space-y-3">
      {rows.slice(-10).map((row) => (
        <div key={row.label} className="grid grid-cols-[105px_1fr_90px] items-center gap-3 text-sm">
          <span className="truncate text-neutral-500">{row.label}</span>
          <div className="h-4 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-black" style={{ width: `${Math.max(5, (row.value / max) * 100)}%` }} />
          </div>
          <strong className="text-right">{formatCurrency(row.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function productPayload(draft: ProductDraft) {
  return {
    category_id: Number(draft.category_id),
    name: draft.name,
    slug: draft.slug,
    description: draft.description,
    price: Number(draft.price),
    cost_price: Number(draft.cost_price || 0),
    sku: draft.sku,
    stock_quantity: Number(draft.stock_quantity),
    status: draft.status,
    is_featured: draft.is_featured,
  };
}

function productFormData(draft: ProductDraft, files: File[]) {
  const payload = productPayload(draft);
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
  });
  files.forEach((file) => formData.append("images[]", file));
  return formData;
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
    },
  };
}

function buildAdminNotifications(data: ReturnType<typeof useAdmin>["data"]): AdminNotification[] {
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

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function exportAdminCsv(tab: Tab, data: ReturnType<typeof useAdmin>["data"]) {
  const map: Record<Tab, unknown[]> = {
    overview: data.orders,
    store: data.store ? [data.store] : [],
    products: data.products,
    categories: data.categories,
    orders: data.orders,
    coupons: data.coupons,
    reports: data.salesReport?.best_selling_products || [],
    payments: data.payments,
    inventory: data.inventoryLogs,
    branches: data.branches,
    staff: data.staff,
  };
  exportCsv(`admin-${tab}`, map[tab]);
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
