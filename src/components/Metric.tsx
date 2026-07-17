import type { ReactNode } from "react";

interface MetricProps {
  label: string;
  value: ReactNode;
  tone?: "teal" | "coral" | "violet" | "ink";
}

const toneClasses = {
  teal: "border-accent/25 bg-teal-50 text-accent",
  coral: "border-coral/25 bg-orange-50 text-coral",
  violet: "border-violet/25 bg-violet-50 text-violet",
  ink: "border-slate-300 bg-white text-ink"
};

export default function Metric({ label, value, tone = "ink" }: MetricProps) {
  return (
    <div className={`rounded-md border p-4 ${toneClasses[tone]}`}>
      <div className="text-2xl font-semibold leading-none">{value}</div>
      <div className="mt-2 text-sm text-muted">{label}</div>
    </div>
  );
}
