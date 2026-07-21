import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 lg:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: July 20, 2026
          </p>
        </div>

        <div className="flex flex-col gap-6 text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">1. Acceptance of Terms</h2>
            <p>
              By accessing or using {siteConfig.name}, you agree to be bound by
              these Terms of Service. If you do not agree to these terms, please
              do not use the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">2. Description of Service</h2>
            <p>
              {siteConfig.name} provides analytics, rankings, and insights
              derived from publicly available Roblox platform data. The service
              is provided for informational purposes only and is not affiliated
              with or endorsed by Roblox Corporation.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">3. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activity that occurs under your
              account. You must notify us immediately of any unauthorized use of
              your account.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">4. Acceptable Use</h2>
            <p>
              You agree not to misuse the service, including but not limited to
              attempting to access data you are not authorized to view,
              disrupting service availability, or scraping the service at a rate
              that degrades performance for other users.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">5. Data Accuracy</h2>
            <p>
              Data displayed on {siteConfig.name} is sourced from third-party
              APIs and may contain inaccuracies or delays. We make no guarantees
              about the accuracy, completeness, or timeliness of any information
              presented.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">
              6. Limitation of Liability
            </h2>
            <p>
              {siteConfig.name} is provided "as is" without warranties of any
              kind. We are not liable for any damages arising from your use of,
              or inability to use, the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">7. Changes to These Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued
              use of the service after changes take effect constitutes
              acceptance of the revised terms.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">8. Contact</h2>
            <p>
              If you have questions about these terms, please contact us through
              the details listed on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
