"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Shell } from "@/components/layout/Shell";

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_id") || searchParams.get("order_number");

  return (
    <Shell>
      <section className="container-shell py-12">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-neutral-200 p-6 text-center">
          <p className="text-xs font-bold uppercase text-green-700">Payment received</p>
          <h1 className="mt-3 text-5xl font-medium tracking-[-0.07em]">Thank you</h1>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Your PayHere payment was completed. We will update the order as soon as the payment notification is confirmed.
          </p>
          {orderNumber && <p className="mt-4 text-sm font-bold">Order {orderNumber}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/account"><Button>View account</Button></Link>
            <Link href="/track-order"><Button variant="outline">Track order</Button></Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
