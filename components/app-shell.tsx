import { headers } from "next/headers";
import type { CSSProperties, ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { CreditsProvider } from "@/components/sections/credits/credits-provider";
import { NotificationsProvider } from "@/components/sections/notifications/notifications-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { getCreditBalance } from "@/lib/credits";
import {
  getUnreadNotificationCount,
  listNotifications,
} from "@/lib/notifications";

export async function AppShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session
    ? {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image ?? "",
      }
    : null;
  const creditBalance = session ? await getCreditBalance(session.user.id) : 0;
  const [notifications, unreadCount] = session
    ? await Promise.all([
        listNotifications(session.user.id),
        getUnreadNotificationCount(session.user.id),
      ])
    : [[], 0];

  return (
    <CreditsProvider initialBalance={creditBalance}>
      <NotificationsProvider
        initialNotifications={notifications.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
        initialUnreadCount={unreadCount}
      >
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 14)",
            } as CSSProperties
          }
        >
          <AppSidebar user={user} variant="inset" />
          <SidebarInset>
            <DashboardHeader title={title} />
            <div className="flex flex-1 flex-col">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </NotificationsProvider>
    </CreditsProvider>
  );
}
