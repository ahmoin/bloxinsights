import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserAuthForm } from "@/components/user-auth-form";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Sign up for ${siteConfig.name}`,
  description: `Sign up to create an account on ${siteConfig.name}`,
};

export default async function AuthenticationPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    return redirect("/");
  }

  return (
    <div className="flex h-screen items-center justify-center px-8">
      <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-sm">
        <UserAuthForm state="signup" />
      </div>
    </div>
  );
}
