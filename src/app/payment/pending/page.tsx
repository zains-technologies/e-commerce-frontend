import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Shell } from "@/components/layout/Shell";

export default function PaymentPendingPage() {
  return (
    <Shell>
      <section className="container-shell grid min-h-[70vh] place-items-center py-10">
        <div className="max-w-xl rounded-[32px] border border-neutral-200 p-8 text-center">
          <p className="text-xs font-bold uppercase text-neutral-500">Payment pending</p>
          <h1 className="mt-3 text-5xl font-medium tracking-[-0.07em]">We are checking your payment</h1>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Some payment methods need confirmation from the provider or admin team. You can track the order or contact support if it takes longer than expected.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/track-order"><Button>Track order</Button></Link>
            <Link href="/support"><Button variant="outline">Contact support</Button></Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
