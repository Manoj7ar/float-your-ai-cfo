import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, Wallet, ShieldCheck, ShieldAlert, FileText, Activity } from "lucide-react";
import type { Account } from "@/hooks/useAccount";
import type { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;

interface KpiCardsProps {
  account: Account | null;
  invoices: Invoice[];
}

export function KpiCards({ account, invoices }: KpiCardsProps) {
  const balance = 620000;
  const payroll = account?.payroll_amount ?? 840000;
  const atRisk = account?.payroll_at_risk ?? false;
  const shortfall = payroll - balance;
  const totalOutstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;
  const unpaidCount = invoices.filter((i) => i.status !== "paid").length;
  const runwayDays = atRisk ? 9 : 47;

  const cards = [
    {
      label: "Current Balance",
      icon: Wallet,
      value: formatCurrency(balance),
      sub: (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-0.5 text-xs text-float-red">
            <TrendingDown size={12} /> 2.1%
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-float-monzo" /> Live
          </span>
        </div>
      ),
      accent: false,
    },
    {
      label: "Payroll Coverage",
      icon: atRisk ? ShieldAlert : ShieldCheck,
      value: atRisk ? `−${formatCurrency(shortfall)}` : `+${formatCurrency(balance - payroll)}`,
      sub: (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            atRisk ? "bg-float-red/10 text-float-red" : "bg-float-green/10 text-float-green"
          }`}>
            {atRisk ? "At Risk" : "Covered"}
          </span>
          <span className="text-[10px] text-muted-foreground">Due Fri Feb 27</span>
        </div>
      ),
      accent: atRisk,
    },
    {
      label: "Outstanding Invoices",
      icon: FileText,
      value: formatCurrency(totalOutstanding),
      sub: (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">{unpaidCount} invoice{unpaidCount !== 1 ? "s" : ""}</span>
          {overdueCount > 0 && (
            <span className="rounded-full bg-float-red/10 px-1.5 py-0.5 text-[10px] font-semibold text-float-red">
              {overdueCount} overdue
            </span>
          )}
        </div>
      ),
      accent: false,
    },
    {
      label: "Runway",
      icon: Activity,
      value: `${runwayDays} days`,
      valueColor: runwayDays < 14 ? "text-float-red" : runwayDays < 30 ? "text-float-amber" : "text-float-green",
      sub: (
        <div className="space-y-1.5">
          <Progress value={Math.min(100, (runwayDays / 60) * 100)} className="h-1.5" />
          <span className="text-[10px] text-muted-foreground">Based on 30-day AI projection</span>
        </div>
      ),
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <Card
          key={card.label}
          className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            card.accent
              ? "border-float-red/30 shadow-[0_0_20px_-6px_hsl(var(--float-red)/0.15)]"
              : "hover:shadow-primary/5"
          }`}
        >
          {/* Decorative top accent bar */}
          <div className={`absolute inset-x-0 top-0 h-0.5 ${
            card.accent ? "bg-float-red" : idx === 0 ? "bg-primary" : idx === 3 ? "bg-float-green" : "bg-border"
          }`} />
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                card.accent
                  ? "bg-float-red/10 text-float-red"
                  : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}>
                <card.icon size={15} />
              </div>
            </div>
            <p className={`mt-2.5 font-mono text-2xl font-bold tabular-nums ${(card as any).valueColor ?? "text-foreground"}`}>
              {card.value}
            </p>
            <div className="mt-2.5">{card.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
