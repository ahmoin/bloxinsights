import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 lg:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: July 20, 2026
          </p>
        </div>

        <div className="flex flex-col gap-6 text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">1. Overview</h2>
            <p>
              This Privacy Policy describes how {siteConfig.name} collects,
              uses, and protects information when you use our service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">2. Information We Collect</h2>
            <p>
              When you create an account, we collect basic profile information
              such as your name, email address, and authentication details. We
              also collect usage data, such as pages visited and features used,
              to help us improve the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">3. Roblox Platform Data</h2>
            <p>
              {siteConfig.name} aggregates and displays publicly available data
              from the Roblox platform, such as player counts and game metadata.
              This data is not personal information about individual Roblox
              users and is used solely to power analytics features.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">4. How We Use Information</h2>
            <p>
              We use collected information to operate and improve the service,
              provide customer support, and communicate important updates. We do
              not sell your personal information to third parties.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">5. Cookies</h2>
            <p>
              We use cookies and similar technologies to maintain your session,
              remember your preferences, and understand how the service is used.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">6. Data Retention</h2>
            <p>
              We retain account information for as long as your account is
              active. You may request deletion of your account and associated
              data at any time.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">7. Security</h2>
            <p>
              We implement reasonable technical and organizational measures to
              protect your information. However, no method of transmission or
              storage is completely secure.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We encourage
              you to review this page periodically for the latest information on
              our privacy practices.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">9. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              through the details listed on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
