"use client";

import { useEffect, useState } from "react";

import { requestStats, type StatsApiResponse } from "@/lib/api";

type StatsDashboardClientProps = {
  readonly copy: {
    readonly apiError: string;
    readonly stats: {
      readonly averageQci: string;
      readonly averageQes: string;
      readonly gradeDistribution: string;
      readonly lastScanTimestamp: string;
      readonly totalEstimatedMigrationExposureValueUsd: string;
      readonly totalScans: string;
    };
  };
};

export function StatsDashboardClient({ copy }: StatsDashboardClientProps) {
  const [stats, setStats] = useState<StatsApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const nextStats = await requestStats();

        if (active) {
          setStats(nextStats);
        }
      } catch {
        if (active) {
          setError(copy.apiError);
        }
      }
    }

    void loadStats();

    return () => {
      active = false;
    };
  }, [copy.apiError]);

  if (error !== null) {
    return (
      <p className="rounded-lg border bg-white p-5 text-sm text-foreground/70 shadow-sm">{error}</p>
    );
  }

  if (stats === null) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label={copy.stats.totalScans} value={formatInteger(stats.totalScans)} />
        <MetricCard
          label={copy.stats.totalEstimatedMigrationExposureValueUsd}
          value={formatUsd(stats.totalEstimatedMigrationExposureValueUsd)}
        />
        <MetricCard label={copy.stats.averageQes} value={formatNullable(stats.averageQes)} />
        <MetricCard label={copy.stats.averageQci} value={formatNullable(stats.averageQci)} />
      </div>
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{copy.stats.gradeDistribution}</h2>
        <div className="mt-4 grid gap-3">
          {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
            <div
              className="flex items-center justify-between rounded-md bg-background p-3"
              key={grade}
            >
              <span className="font-medium">{grade}</span>
              <span className="tabular-nums text-foreground/70">{count}</span>
            </div>
          ))}
        </div>
      </section>
      <MetricCard
        label={copy.stats.lastScanTimestamp}
        value={
          stats.lastScanTimestamp === null
            ? "-"
            : new Date(stats.lastScanTimestamp).toLocaleString("fr-FR")
        }
      />
    </div>
  );
}

function MetricCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-medium text-foreground/65">{label}</h2>
      <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
    </section>
  );
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNullable(value: number | null): string {
  return value === null ? "-" : formatInteger(value);
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
