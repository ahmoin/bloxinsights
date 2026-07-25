"use client";

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useState,
} from "react";

interface CreditsContextValue {
  balance: number;
  refreshBalance: () => Promise<void>;
  setBalance: (balance: number) => void;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({
  children,
  initialBalance,
}: {
  children: ReactNode;
  initialBalance: number;
}) {
  const [balance, setBalance] = useState(initialBalance);

  const refreshBalance = useCallback(async () => {
    const response = await fetch("/api/credits/balance");
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as { balance: number };
    setBalance(data.balance);
  }, []);

  return (
    <CreditsContext
      value={{
        balance,
        setBalance,
        refreshBalance,
      }}
    >
      {children}
    </CreditsContext>
  );
}

export function useCredits(): CreditsContextValue {
  const context = use(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
}
