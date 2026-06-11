"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/StateBlock";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    await register(name, email, password);
    router.push("/products");
  }

  return (
    <Shell>
      <section className="container-shell grid min-h-[620px] place-items-center py-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-[32px] border border-neutral-200 p-6">
          <h1 className="text-5xl font-medium tracking-[-0.07em]">Register</h1>
          <p className="mt-3 text-sm text-neutral-600">Create a reusable customer account for order history later.</p>
          <div className="mt-6 space-y-4">
            {error && <ErrorState message={error} />}
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button disabled={loading} className="w-full">{loading ? "Creating..." : "Create account"}</Button>
          </div>
        </form>
      </section>
    </Shell>
  );
}

