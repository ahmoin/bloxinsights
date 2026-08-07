import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 lg:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl">About {siteConfig.name}</h1>
          <p className="text-muted-foreground text-sm">
            {siteConfig.description}
          </p>
        </div>

        <div className="flex flex-col gap-6 text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">What we do</h2>
            <p>
              {siteConfig.name} tracks concurrent players, ranking movement, and
              genre trends across the Roblox platform, then surfaces that data
              in dashboards built for creators and studios who want to
              understand how their games are performing.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">Why we built it</h2>
            <p>
              Roblox's own analytics tools are limited to your own games. We
              wanted a way to see the wider landscape: which games are trending,
              how genres shift over time, and where a new release stacks up
              against the competition.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">Get in touch</h2>
            <p>
              Questions, feedback, or partnership ideas are always welcome.
              Reach out through our{" "}
              <a className="underline underline-offset-4" href="/contact">
                contact page
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
