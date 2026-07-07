import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const imageSize = {
  height: 630,
  width: 1200,
};

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address") ?? "";
  const qes = parseScore(searchParams.get("qes"));
  const qci = parseScore(searchParams.get("qci")) ?? 0;
  const grade = searchParams.get("grade");
  const gradeDisplayed = qci >= 40 && grade !== null && grade.length > 0;

  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#f7faf9",
        color: "#17202a",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: 72,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ color: "#14746f", fontSize: 34, fontWeight: 800 }}>QuantaLayer</div>
          <div style={{ color: "#5f6f6d", fontSize: 25 }}>Migration Readiness Score</div>
        </div>
        <div
          style={{
            alignItems: "center",
            border: "2px solid #cfd9d7",
            borderRadius: 999,
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            height: 64,
            padding: "0 28px",
          }}
        >
          QCI {qci}
        </div>
      </div>
      <div style={{ display: "flex", gap: 34 }}>
        <Metric label="QES" value={qes === null ? "-" : String(qes)} />
        <Metric label="Grade" value={gradeDisplayed ? grade : "-"} />
      </div>
      <div
        style={{
          borderTop: "2px solid #dfe7e5",
          color: "#5f6f6d",
          display: "flex",
          fontSize: 25,
          justifyContent: "space-between",
          paddingTop: 28,
        }}
      >
        <span>{truncateAddress(address)}</span>
        <span>quantalayer.app</span>
      </div>
    </div>,
    imageSize,
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: string | null }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "2px solid #dfe7e5",
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        padding: 42,
        width: 310,
      }}
    >
      <div style={{ color: "#5f6f6d", fontSize: 28 }}>{label}</div>
      <div style={{ color: "#17202a", fontSize: 86, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function parseScore(value: string | null): number | null {
  if (value === null || value.length === 0) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : null;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
