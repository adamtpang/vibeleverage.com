import { ImageResponse } from "next/og";

import {
  bindingConstraint,
  LEVER_BY_KEY,
  leverageIndex,
  parseScoreSlug,
  profile,
  type Scores,
} from "@/lib/levers";

export const runtime = "edge";
export const alt = "A leverage diagnosis card from archimedes.life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#f6b13f";
const INK = "#0b0a08";
const TRACK = "#2b261d";
const MUTED = "#8f8878";
const PAPER = "#f2ead9";

export default function CardImage({ params }: { params: { scores: string } }) {
  const scores: Scores =
    parseScoreSlug(params.scores) ?? { code: 0, media: 0, capital: 0, labor: 0 };
  const index = leverageIndex(scores);
  const prof = profile(scores);
  const constraint = LEVER_BY_KEY[bindingConstraint(scores)];

  const rows: Array<{ name: string; value: number }> = [
    { name: "Code", value: scores.code },
    { name: "Media", value: scores.media },
    { name: "Capital", value: scores.capital },
    { name: "Labor", value: scores.labor },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: INK,
          padding: "60px 68px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            color: MUTED,
            fontSize: 23,
            letterSpacing: 7,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderBottom: `19px solid ${GOLD}`,
            }}
          />
          THE LEVERAGE DIAGNOSIS
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 64 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 400 }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <div style={{ fontSize: 168, fontWeight: 700, color: GOLD, lineHeight: 1 }}>
                {index}
              </div>
              <div style={{ fontSize: 40, color: MUTED, marginLeft: 8 }}>/100</div>
            </div>
            <div style={{ fontSize: 30, color: PAPER, marginTop: 14, display: "flex" }}>
              {prof.label}
            </div>
            <div style={{ fontSize: 23, color: MUTED, marginTop: 8, display: "flex" }}>
              Binding constraint: {constraint.name}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 22 }}>
            {rows.map((row) => (
              <div key={row.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ fontSize: 25, color: PAPER, display: "flex" }}>{row.name}</div>
                  <div style={{ fontSize: 25, color: GOLD, display: "flex" }}>{row.value}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: 12,
                    backgroundColor: TRACK,
                    borderRadius: 99,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: `${Math.max(1.5, row.value)}%`,
                      height: 12,
                      backgroundColor: GOLD,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: MUTED, fontSize: 25, display: "flex" }}>
            Find the lever. Move the world.
          </div>
          <div style={{ color: GOLD, fontSize: 25, letterSpacing: 1, display: "flex" }}>
            archimedes.life
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
