"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/StateBlock";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const data = await login(email, password);
    router.push(["admin", "manager", "staff"].includes(data.user.role || "") ? "/admin" : "/products");
  }

  return (
    <Shell>
      <section className="container-shell grid min-h-[620px] place-items-center py-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-[32px] border border-neutral-200 p-6">
          <h1 className="text-5xl font-medium tracking-[-0.07em]">Login</h1>
          <p className="mt-3 text-sm text-neutral-600">Use the demo admin account or your registered customer account.</p>
          <div className="mt-6 space-y-4">
            {error && <ErrorState message={error} />}
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button disabled={loading} className="w-full">{loading ? "Signing in..." : "Login"}</Button>
          </div>
        </form>
      </section>
    </Shell>
  );
}
