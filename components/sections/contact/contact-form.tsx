"use client";

import { Loader2Icon, SendIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/contact-shared";

interface FormErrors {
  email: string | null;
  message: string | null;
  name: string | null;
}

const EMPTY_ERRORS: FormErrors = { email: null, message: null, name: null };

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const result = contactSchema.safeParse({ name, email, message });
    if (result.success) {
      setErrors(EMPTY_ERRORS);
      return true;
    }
    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors({
      email: fieldErrors.email?.[0] ?? null,
      message: fieldErrors.message?.[0] ?? null,
      name: fieldErrors.name?.[0] ?? null,
    });
    return false;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-1 rounded-lg border p-6 text-center">
        <p className="font-medium">Message sent</p>
        <p className="text-muted-foreground text-sm">
          Thanks for reaching out, we'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={errors.name !== null}>
          <FieldLabel htmlFor="contact-name">Name</FieldLabel>
          <Input
            aria-invalid={errors.name !== null}
            id="contact-name"
            onChange={(event) => {
              setName(event.target.value);
              setErrors((current) => ({ ...current, name: null }));
            }}
            value={name}
          />
          {errors.name !== null && <FieldError>{errors.name}</FieldError>}
        </Field>
        <Field data-invalid={errors.email !== null}>
          <FieldLabel htmlFor="contact-email">Email</FieldLabel>
          <Input
            aria-invalid={errors.email !== null}
            id="contact-email"
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: null }));
            }}
            type="email"
            value={email}
          />
          {errors.email !== null && <FieldError>{errors.email}</FieldError>}
        </Field>
        <Field data-invalid={errors.message !== null}>
          <FieldLabel htmlFor="contact-message">Message</FieldLabel>
          <Textarea
            aria-invalid={errors.message !== null}
            id="contact-message"
            onChange={(event) => {
              setMessage(event.target.value);
              setErrors((current) => ({ ...current, message: null }));
            }}
            rows={6}
            value={message}
          />
          {errors.message !== null && <FieldError>{errors.message}</FieldError>}
        </Field>
      </FieldGroup>
      <Button className="w-fit" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
        Send message
      </Button>
    </form>
  );
}
