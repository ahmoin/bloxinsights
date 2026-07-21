import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Help | ${siteConfig.name}`,
  description: "Answers to common questions",
};

export const dynamic = "force-dynamic";

const FAQS = [
  {
    question: "What is Bloxinsights?",
    answer:
      "Bloxinsights is a dashboard for tracking Roblox games and the assets around them, with a focus on analytics like concurrent players, rankings, and trends.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "We aggregate publicly available data from the Roblox platform, such as player counts and game metadata, and refresh it on a regular schedule.",
  },
  {
    question: "Why don't the numbers match what I see on Roblox?",
    answer:
      "Player counts and rankings can lag slightly behind the live Roblox platform due to how frequently we poll the underlying data. Large swings usually settle within a few minutes.",
  },
  {
    question: "How do I track a specific game?",
    answer:
      "Use the search on the Games page to find a title, then open it to see its detailed metrics. You can also add it to your library for quicker access.",
  },
  {
    question: "How do I change my account settings?",
    answer:
      "Visit the Settings page to update your profile, appearance preferences, and account details.",
  },
  {
    question: "I found a bug or have a feature request. What do I do?",
    answer: "Reach out through the Contact page and describe what you found.",
  },
];

export default async function HelpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return redirect("/login");
  }

  return (
    <AppShell title="Help">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 lg:p-6">
        {FAQS.map((faq) => (
          <Card key={faq.question}>
            <CardHeader>
              <CardTitle>{faq.question}</CardTitle>
              <CardDescription>{faq.answer}</CardDescription>
            </CardHeader>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Still need help?</CardTitle>
            <CardDescription>
              Visit our{" "}
              <Link className="text-foreground underline" href="/contact">
                Contact
              </Link>{" "}
              page and we&apos;ll get back to you.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppShell>
  );
}
