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

export type WaitlistEntryInput = {
  readonly consent: true;
  readonly email: string;
  readonly source?: string | undefined;
  readonly wallet?: string | undefined;
};

export type WaitlistEntryResult = {
  readonly duplicate: boolean;
};

export type WaitlistStore = {
  readonly recordWaitlistEntry: (entry: WaitlistEntryInput) => Promise<WaitlistEntryResult>;
};

export class MemoryScanAggregateStore implements ScanAggregateStore {
  private readonly scanRows: ScanAggregateRow[] = [];
  private readonly waitlistEntries = new Map<string, WaitlistEntryInput>();

  async recordScan(row: ScanAggregateRow): Promise<void> {
    this.scanRows.push(row);
  }

  async getStats(): Promise<AggregateStats> {
    return aggregateScanRows(this.scanRows);
  }

  async recordWaitlistEntry(entry: WaitlistEntryInput): Promise<WaitlistEntryResult> {
    const existing = this.waitlistEntries.get(entry.email);

    if (existing !== undefined) {
      return { duplicate: true };
    }

    this.waitlistEntries.set(entry.email, entry);

    return { duplicate: false };
  }

  rows(): readonly ScanAggregateRow[] {
    return this.scanRows;
  }

  waitlistRows(): readonly WaitlistEntryInput[] {
    return [...this.waitlistEntries.values()];
  }
}

type PrismaScanRecord = {
  readonly addressHash: string;
  readonly createdAt: Date;
  readonly estimatedMigrationExposureValueUsd: number;
  readonly grade: string | null;
  readonly gradeDisplayed: boolean;
  readonly qci: number;
  readonly qciVersion: string;
  readonly qes: number | null;
  readonly qesVersion: string;
  readonly status: string;
};

type PrismaClientLike = {
  readonly scan: {
    readonly create: (args: {
      readonly data: Omit<ScanAggregateRow, "createdAt">;
    }) => Promise<unknown>;
    readonly findMany: (args: {
      readonly select: Record<keyof PrismaScanRecord, true>;
    }) => Promise<readonly PrismaScanRecord[]>;
  };
  readonly waitlistEntry: {
    readonly create: (args: { readonly data: WaitlistEntryInput }) => Promise<unknown>;
    readonly findUnique: (args: {
      readonly where: {
        readonly email: string;
      };
    }) => Promise<unknown | null>;
  };
};

export class PrismaMvpStore implements ScanAggregateStore, WaitlistStore {
  private readonly prisma: PrismaClientLike;

  constructor(prisma: unknown) {
    this.prisma = prisma as PrismaClientLike;
  }

  async recordScan(row: ScanAggregateRow): Promise<void> {
    await this.prisma.scan.create({
      data: {
        addressHash: row.addressHash,
        estimatedMigrationExposureValueUsd: row.estimatedMigrationExposureValueUsd,
        grade: row.grade,
        gradeDisplayed: row.gradeDisplayed,
        qci: row.qci,
        qciVersion: row.qciVersion,
        qes: row.qes,
        qesVersion: row.qesVersion,
        status: row.status,
      },
    });
  }

  async getStats(): Promise<AggregateStats> {
    // TODO(public-beta): replace this MVP table scan with Prisma aggregate/groupBy queries or a
    // materialized aggregate table before scan volume grows.
    const rows = await this.prisma.scan.findMany({
      select: {
        addressHash: true,
        createdAt: true,
        estimatedMigrationExposureValueUsd: true,
        grade: true,
        gradeDisplayed: true,
        qci: true,
        qciVersion: true,
        qes: true,
        qesVersion: true,
        status: true,
      },
    });

    return aggregateScanRows(
      rows.map((row) => ({
        addressHash: row.addressHash,
        createdAt: row.createdAt.toISOString(),
        estimatedMigrationExposureValueUsd: row.estimatedMigrationExposureValueUsd,
        grade: parseDisplayGrade(row.grade),
        gradeDisplayed: row.gradeDisplayed,
        qci: row.qci,
        qciVersion: row.qciVersion,
        qes: row.qes,
        qesVersion: row.qesVersion,
        status: parseQesStatus(row.status),
      })),
    );
  }

  async recordWaitlistEntry(entry: WaitlistEntryInput): Promise<WaitlistEntryResult> {
    const existing = await this.prisma.waitlistEntry.findUnique({
      where: {
        email: entry.email,
      },
    });

    if (existing !== null) {
      return { duplicate: true };
    }

    await this.prisma.waitlistEntry.create({
      data: entry,
    });

    return { duplicate: false };
  }
}

function aggregateScanRows(rows: readonly ScanAggregateRow[]): AggregateStats {
  const distribution = emptyGradeDistribution();
  let totalQci = 0;
  let totalQes = 0;
  let qesCount = 0;
  let totalExposure = 0;
  let lastScanTimestamp: string | null = null;

  for (const row of rows) {
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
    averageQci: rows.length === 0 ? null : roundMetric(totalQci / rows.length),
    averageQes: qesCount === 0 ? null : roundMetric(totalQes / qesCount),
    gradeDistribution: distribution,
    lastScanTimestamp,
    totalEstimatedMigrationExposureValueUsd: roundMetric(totalExposure),
    totalScans: rows.length,
  };
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

function parseDisplayGrade(grade: string | null): DisplayGrade | null {
  if (
    grade === "A" ||
    grade === "B" ||
    grade === "C" ||
    grade === "D" ||
    grade === "E" ||
    grade === "N/A"
  ) {
    return grade;
  }

  return null;
}

function parseQesStatus(status: string): QesStatus {
  if (
    status === "fragile_estimate" ||
    status === "insufficient_data" ||
    status === "not_applicable" ||
    status === "ok"
  ) {
    return status;
  }

  return "ok";
}
