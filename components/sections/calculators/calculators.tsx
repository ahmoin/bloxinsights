"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const DEVEX_ROBUX = 30_000;
const DEVEX_USD = 105;
const DEVEX_RATE = DEVEX_USD / DEVEX_ROBUX;
const MARKETPLACE_TAX_RATE = 0.3;

type PaymentMethod = "echeck" | "paypal" | "wire";

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  fee: (grossUsd: number) => number;
}[] = [
  {
    value: "echeck",
    label: "eCheck / Local Bank Transfer / SEPA Transfer",
    fee: () => 5,
  },
  {
    value: "paypal",
    label: "PayPal",
    fee: (grossUsd) => grossUsd * 0.02,
  },
  {
    value: "wire",
    label: "Wire Transfer",
    fee: () => 30,
  },
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;
type Currency = (typeof CURRENCIES)[number];

const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.37,
  AUD: 1.52,
};

function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatRobux(amount: number): string {
  return `R$${Math.round(amount).toLocaleString()}`;
}

function parseRobuxInput(value: string): number {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}

function DevexCalculator() {
  const [robuxInput, setRobuxInput] = useState("30000");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("echeck");

  const robux = parseRobuxInput(robuxInput);
  const grossUsd = robux * DEVEX_RATE;
  const method = PAYMENT_METHODS.find((item) => item.value === paymentMethod);
  const feeUsd = method ? method.fee(grossUsd) : 0;
  const netUsd = Math.max(grossUsd - feeUsd, 0);
  const rate = CURRENCY_RATES[currency];

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-medium text-sm" htmlFor="devex-robux">
            Robux
          </label>
          <Input
            id="devex-robux"
            inputMode="numeric"
            onChange={(event) => setRobuxInput(event.target.value)}
            value={robuxInput ? `R$${robux.toLocaleString()}` : ""}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-sm" htmlFor="devex-currency">
              Currency
            </label>
            <Select
              onValueChange={(value) => setCurrency(value as Currency)}
              value={currency}
            >
              <SelectTrigger className="w-full" id="devex-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-sm" htmlFor="devex-method">
              Payment Method
            </label>
            <Select
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
              value={paymentMethod}
            >
              <SelectTrigger className="w-full" id="devex-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 rounded-lg border p-4">
        <span className="text-muted-foreground text-sm">Total DevEx</span>
        <span className="font-semibold text-3xl text-green-500">
          {formatCurrency(netUsd * rate, currency)}
        </span>
        <span className="text-muted-foreground text-xs">
          DevEx Rate: {formatRobux(DEVEX_ROBUX)} for{" "}
          {formatCurrency(DEVEX_USD, "USD")}
        </span>
        <span className="text-muted-foreground text-xs">
          Payment fee: -{formatCurrency(feeUsd * rate, currency)}
        </span>
      </div>
    </div>
  );
}

type TaxMode = "after" | "before";

function RobloxTaxCalculator() {
  const [robuxInput, setRobuxInput] = useState("30000");
  const [mode, setMode] = useState<TaxMode>("after");

  const robux = parseRobuxInput(robuxInput);

  const { beforeTax, afterTax } = useMemo(() => {
    if (mode === "after") {
      return { beforeTax: robux, afterTax: robux * (1 - MARKETPLACE_TAX_RATE) };
    }
    const computedBeforeTax = robux / (1 - MARKETPLACE_TAX_RATE);
    return { beforeTax: computedBeforeTax, afterTax: robux };
  }, [robux, mode]);

  const taxPaid = beforeTax - afterTax;

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-medium text-sm" htmlFor="tax-robux">
            Robux
          </label>
          <Input
            id="tax-robux"
            inputMode="numeric"
            onChange={(event) => setRobuxInput(event.target.value)}
            value={robuxInput ? `R$${robux.toLocaleString()}` : ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-medium text-sm">Tax</span>
          <ToggleGroup
            onValueChange={(value) => {
              if (value) {
                setMode(value as TaxMode);
              }
            }}
            type="single"
            value={mode}
            variant="outline"
          >
            <ToggleGroupItem value="after">After Tax</ToggleGroupItem>
            <ToggleGroupItem value="before">Before Tax</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <div className="flex flex-col gap-1 rounded-lg border p-4">
        <span className="text-muted-foreground text-sm">Total Robux</span>
        <span className="font-semibold text-3xl text-green-500">
          {formatRobux(afterTax)}
        </span>
        <span className="text-muted-foreground text-xs">
          Before Tax: {formatRobux(beforeTax)}
        </span>
        <span className="text-muted-foreground text-xs">
          Tax Paid: {formatRobux(taxPaid)} (
          {Math.round(MARKETPLACE_TAX_RATE * 100)}%)
        </span>
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    question: "What is the Robux to USD conversion rate?",
    answer: `The conversion rate is ${formatRobux(DEVEX_ROBUX)} for ${formatCurrency(
      DEVEX_USD,
      "USD"
    )}. That's equivalent to 1 Robux for ${formatCurrency(DEVEX_RATE, "USD")}.`,
  },
  {
    question: "What is the minimum amount I need to DevEx?",
    answer: `You need a minimum of ${DEVEX_ROBUX.toLocaleString()} Robux to DevEx.`,
  },
  {
    question: "What are the DevEx requirements?",
    answer:
      "You must be at least 13 years old, have Roblox Premium, and have a verified email address on your account to qualify for DevEx.",
  },
  {
    question: "How much tax does Roblox take on marketplace sales?",
    answer:
      "Roblox takes a 30% marketplace tax on Robux earned from selling items and passes, group funds, and other engagement-based payouts.",
  },
] as const;

function CalculatorsFaq() {
  return (
    <Accordion collapsible type="single">
      {FAQ_ITEMS.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function Calculators() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <h1 className="font-semibold text-3xl">Calculators</h1>
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-xl">DevEx Calculator</h2>
        <p className="text-muted-foreground text-sm">
          Convert Robux to USD (or other currencies).
        </p>
        <div className="mt-2">
          <DevexCalculator />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-xl">Roblox Tax Calculator</h2>
        <p className="text-muted-foreground text-sm">
          Calculate Robux before or after Roblox's tax.
        </p>
        <div className="mt-2">
          <RobloxTaxCalculator />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-xl">Questions</h2>
        <CalculatorsFaq />
      </div>
    </div>
  );
}
