import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PromoNoticeBanner } from "./PromoNoticeBanner";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <PromoNoticeBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
