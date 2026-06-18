"use client";

import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Shell } from "@/components/layout/Shell";

export default function PaymentCancelPage() {
  return (
    <Shell>
      <section className="container-shell py-12">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-neutral-200 p-6 text-center">
          <p className="text-xs font-bold uppercase text-neutral-500">Payment cancelled</p>
          <h1 className="mt-3 text-5xl font-medium tracking-[-0.07em]">No payment taken</h1>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            The PayHere checkout was cancelled. You can return to the shop or track your order if it was already created.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products"><Button>Continue shopping</Button></Link>
            <Link href="/track-order"><Button variant="outline">Track order</Button></Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
