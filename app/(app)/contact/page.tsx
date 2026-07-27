import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10 lg:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl">Contact us</h1>
          <p className="text-muted-foreground text-sm">
            Questions, feedback, or bug reports: send us a message and we'll get
            back to you.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
