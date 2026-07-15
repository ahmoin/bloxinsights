import { AppShell } from "@/components/app-shell";
import { AnalyzeChat } from "@/components/sections/analyze/analyze-chat";

export default function Page() {
  return (
    <AppShell title="Analyze">
      <div className="@container/main flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 md:py-6 lg:px-6">
        <AnalyzeChat />
      </div>
    </AppShell>
  );
}
