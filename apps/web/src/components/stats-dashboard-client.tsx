"use client";

import { useEffect, useState } from "react";

import { requestStats, type StatsApiResponse } from "@/lib/api";

const GRADE_ORDER = ["A", "B", "C", "D", "E", "N/A"] as const;

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
        <GradeDistribution distribution={stats.gradeDistribution} />
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

function GradeDistribution({
  distribution,
}: {
  readonly distribution: StatsApiResponse["gradeDistribution"];
}) {
  const entries = orderedGradeEntries(distribution);
  const maxCount = Math.max(...entries.map(([, count]) => count), 0);
  const ariaMax = Math.max(maxCount, 1);

  return (
    <div className="mt-4 grid gap-3">
      {entries.map(([grade, count]) => {
        const width = maxCount === 0 ? 0 : (count / maxCount) * 100;

        return (
          <div className="flex items-center gap-3" key={grade}>
            <span className="w-10 shrink-0 text-sm font-medium">{grade}</span>
            <div
              aria-label={grade}
              aria-valuemax={ariaMax}
              aria-valuemin={0}
              aria-valuenow={count}
              className="h-2 min-w-0 flex-1 rounded-full bg-primary/10"
              role="meter"
            >
              <div className="h-2 rounded-full bg-primary/80" style={{ width: `${width}%` }} />
            </div>
            <span className="w-20 shrink-0 text-right text-sm tabular-nums text-foreground/70">
              {formatInteger(count)}
            </span>
          </div>
        );
      })}
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

function orderedGradeEntries(distribution: StatsApiResponse["gradeDistribution"]) {
  const knownEntries = GRADE_ORDER.filter((grade) => distribution[grade] !== undefined).map(
    (grade) => [grade, distribution[grade] ?? 0] as const,
  );
  const customEntries = Object.entries(distribution).filter(([grade]) => !isKnownGrade(grade));

  return [...knownEntries, ...customEntries];
}

function isKnownGrade(grade: string): grade is (typeof GRADE_ORDER)[number] {
  return (GRADE_ORDER as readonly string[]).includes(grade);
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
