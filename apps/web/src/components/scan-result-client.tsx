"use client";

import { useEffect, useState } from "react";

import { QciBadge } from "@/components/qci-badge";
import { QesGauge } from "@/components/qes-gauge";
import { RecommendationList } from "@/components/recommendation-list";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { ShareBadge } from "@/components/share-badge";
import { requestScan, type ScanApiResponse } from "@/lib/api";

type ScanResultClientProps = {
  readonly address: string;
  readonly copy: {
    readonly commonError: string;
    readonly results: {
      readonly breakdownLabels: Record<string, string>;
      readonly breakdownTitle: string;
      readonly cacheHit: string;
      readonly cacheMiss: string;
      readonly gradeHidden: string;
      readonly loading: string;
      readonly qci: string;
      readonly qes: string;
      readonly recommendationsTitle: string;
      readonly shareCaption: string;
      readonly value: string;
      readonly warningsTitle: string;
    };
  };
};

export function ScanResultClient({ address, copy }: ScanResultClientProps) {
  const [result, setResult] = useState<ScanApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function runScan() {
      setLoading(true);
      setError(null);

      try {
        const nextResult = await requestScan(address);

        if (active) {
          setResult(nextResult);
        }
      } catch {
        if (active) {
          setError(copy.commonError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void runScan();

    return () => {
      active = false;
    };
  }, [address, copy.commonError]);

  if (loading) {
    return (
      <p className="rounded-lg border bg-white p-5 text-sm text-foreground/70 shadow-sm">
        {copy.results.loading}
      </p>
    );
  }

  if (error !== null) {
    return (
      <p className="rounded-lg border bg-white p-5 text-sm text-foreground/70 shadow-sm">{error}</p>
    );
  }

  if (result === null) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <QciBadge label={copy.results.qci} qci={result.qci} />
        <span className="rounded-full border bg-white px-3 py-1 text-sm text-foreground/65">
          {result.cache.hit ? copy.results.cacheHit : copy.results.cacheMiss}
        </span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <QesGauge
          grade={result.grade}
          gradeDisplayed={result.gradeDisplayed}
          hiddenCopy={copy.results.gradeHidden}
          label={copy.results.qes}
          qes={result.qes}
        />
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{copy.results.value}</h2>
          <p className="mt-4 text-4xl font-semibold tabular-nums">
            {formatUsd(result.estimatedMigrationExposureValueUsd)}
          </p>
          <p className="mt-3 break-all text-sm leading-6 text-foreground/60">{result.address}</p>
        </section>
      </div>
      <ScoreBreakdown
        breakdown={result.breakdown}
        labels={copy.results.breakdownLabels}
        title={copy.results.breakdownTitle}
      />
      <RecommendationList
        items={result.recommendations}
        title={copy.results.recommendationsTitle}
      />
      <RecommendationList items={result.warnings} title={copy.results.warningsTitle} />
      <ShareBadge
        address={result.address}
        caption={copy.results.shareCaption}
        grade={result.grade}
        gradeDisplayed={result.gradeDisplayed}
        qci={result.qci}
        qes={result.qes}
      />
    </div>
  );
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
