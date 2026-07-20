import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SignOutButton } from "@/components/sections/settings/sign-out-button";
import { ThemeToggleGroup } from "@/components/sections/settings/theme-toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Settings | ${siteConfig.name}`,
  description: "Manage your account and preferences",
};

export const dynamic = "force-dynamic";

const INITIALS_LENGTH = 2;

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return redirect("/login");
  }

  const { user } = session;
  const initials = user.name.slice(0, INITIALS_LENGTH).toUpperCase();

  return (
    <AppShell title="Settings">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your profile is synced from your Roblox account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage alt={user.name} src={user.image ?? ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user.name}</span>
              <span className="text-muted-foreground text-sm">
                {user.email}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose how Bloxinsights looks on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggleGroup />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Sign out of your account on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
