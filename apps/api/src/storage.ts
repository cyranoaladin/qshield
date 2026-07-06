import type { DisplayGrade, QesStatus } from "@quantalayer/scoring";

export type ScanAggregateRow = {
  readonly addressHash: string;
  readonly createdAt: string;
  readonly estimatedMigrationExposureValueUsd: number;
  readonly grade: DisplayGrade | null;
  readonly gradeDisplayed: boolean;
  readonly qci: number;
  readonly qciVersion: string;
  readonly qes: number | null;
  readonly qesVersion: string;
  readonly status: QesStatus;
};

export type GradeDistribution = Record<"A" | "B" | "C" | "D" | "E" | "N/A", number>;

export type AggregateStats = {
  readonly averageQci: number | null;
  readonly averageQes: number | null;
  readonly gradeDistribution: GradeDistribution;
  readonly lastScanTimestamp: string | null;
  readonly totalEstimatedMigrationExposureValueUsd: number;
  readonly totalScans: number;
};

export type ScanAggregateStore = {
  readonly getStats: () => Promise<AggregateStats>;
  readonly recordScan: (row: ScanAggregateRow) => Promise<void>;
};

export class MemoryScanAggregateStore implements ScanAggregateStore {
  private readonly scanRows: ScanAggregateRow[] = [];

  async recordScan(row: ScanAggregateRow): Promise<void> {
    this.scanRows.push(row);
  }

  async getStats(): Promise<AggregateStats> {
    const distribution = emptyGradeDistribution();
    let totalQci = 0;
    let totalQes = 0;
    let qesCount = 0;
    let totalExposure = 0;
    let lastScanTimestamp: string | null = null;

    for (const row of this.scanRows) {
      totalQci += row.qci;
      totalExposure += row.estimatedMigrationExposureValueUsd;

      if (row.qes !== null) {
        totalQes += row.qes;
        qesCount += 1;
      }

      if (row.grade !== null) {
        distribution[row.grade] += 1;
      }

      if (lastScanTimestamp === null || row.createdAt > lastScanTimestamp) {
        lastScanTimestamp = row.createdAt;
      }
    }

    return {
      averageQci: this.scanRows.length === 0 ? null : roundMetric(totalQci / this.scanRows.length),
      averageQes: qesCount === 0 ? null : roundMetric(totalQes / qesCount),
      gradeDistribution: distribution,
      lastScanTimestamp,
      totalEstimatedMigrationExposureValueUsd: roundMetric(totalExposure),
      totalScans: this.scanRows.length,
    };
  }

  rows(): readonly ScanAggregateRow[] {
    return this.scanRows;
  }
}

function emptyGradeDistribution(): GradeDistribution {
  return {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    "N/A": 0,
  };
}

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}
