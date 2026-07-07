"use client";

import Link from "next/link";
import { type ComponentProps, useState } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

export function UserAuthForm({
  state = "login",
  className,
  ...props
}: ComponentProps<"div"> & {
  state: "signup" | "login";
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">
          {state === "login" ? "Log in" : "Sign up"} to {siteConfig.name}
        </h1>
      </div>
      <div className={cn("grid gap-6", className)} {...props}>
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              await authClient.signIn.social({
                provider: "roblox",
                callbackURL: "/",
              });
            }}
            type="button"
          >
            {isLoading ? <Spinner /> : <Icons.roblox className="mr-2 size-4" />}{" "}
            {state === "login" ? "Log in" : "Sign up"} with Roblox
          </Button>
        </div>
      </div>
      <FieldDescription className="px-6 text-center">
        {state === "login"
          ? "Don't have an account?"
          : "Already have an account?"}
        <Button asChild className="underline hover:opacity-75" variant="link">
          <Link href={state === "login" ? "/signup" : "/login"}>
            {state === "login" ? "Sign up" : "Log in"}
          </Link>
        </Button>
      </FieldDescription>
      <FieldDescription className="px-6 text-center">
        By {state === "login" ? "logging in" : "signing up"}, you agree to our{" "}
        <Link href="/terms">Terms of Service</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </>
  );
}
