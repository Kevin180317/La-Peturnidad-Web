import React from "react";
import { TREND_RANGES, type TrendRange } from "../../../lib/admin/trend";

/**
 * Window selector for the dashboard charts.
 *
 * A segmented control rather than a <select>: three options, all worth showing
 * at once, and it reads as a filter on the chart rather than a form field.
 */

const LABELS: Record<TrendRange, string> = {
  7: "7 días",
  30: "30 días",
  90: "90 días",
};

interface Props {
  value: TrendRange;
  onChange: (range: TrendRange) => void;
  disabled?: boolean;
}

export default function RangeTabs({ value, onChange, disabled }: Props) {
  return (
    <div
      role="group"
      aria-label="Periodo del gráfico"
      className="inline-flex shrink-0 rounded-xl border border-texto/10 bg-fondo/50 p-1"
    >
      {TREND_RANGES.map((range) => {
        const active = range === value;
        return (
          <button
            key={range}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(range)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "bg-panel text-texto shadow-sm shadow-shadow/10"
                : "text-texto/50 hover:text-texto"
            }`}
          >
            {LABELS[range]}
          </button>
        );
      })}
    </div>
  );
}