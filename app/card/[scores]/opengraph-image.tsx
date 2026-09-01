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
export const alt = "A leverage diagnosis card from vibeleverage.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#f6b13f";
const INK = "#0b0a08";
const TRACK = "#2b261d";
const MUTED = "#8f8878";
const PAPER = "#f2ead9";

// Satori rule: every div gets an explicit display, and any div holding text
// holds exactly one text child. Multiple children without display:flex throws,
// and the route then returns an empty 200 instead of a visible error.
export default function CardImage({ params }: { params: { scores: string } }) {
  const scores: Scores =
    parseScoreSlug(params.scores) ?? { code: 0, media: 0, capital: 0, labor: 0 };
  const index = leverageIndex(scores);
  const prof = profile(scores);
  const constraint = LEVER_BY_KEY[bindingConstraint(scores)];

  const rows: Array<{ name: string; value: number }> = [
    { name: "Vibe Code", value: scores.code },
    { name: "Vibe Media", value: scores.media },
    { name: "Vibe Capital", value: scores.capital },
    { name: "Vibe Labor", value: scores.labor },
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
          padding: "58px 66px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              width: 0,
              height: 0,
              marginRight: 14,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderBottom: `19px solid ${GOLD}`,
            }}
          />
          <div style={{ display: "flex", color: MUTED, fontSize: 22, letterSpacing: 7 }}>
            THE LEVERAGE DIAGNOSIS
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 420 }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 172,
                  fontWeight: 700,
                  color: GOLD,
                  lineHeight: 1,
                }}
              >
                {String(index)}
              </div>
              <div
                style={{ display: "flex", fontSize: 40, color: MUTED, marginLeft: 10 }}
              >
                /100
              </div>
            </div>
            <div
              style={{ display: "flex", fontSize: 31, color: PAPER, marginTop: 16 }}
            >
              {prof.label}
            </div>
            <div
              style={{ display: "flex", fontSize: 23, color: MUTED, marginTop: 10 }}
            >
              {`Binding constraint: ${constraint.name}`}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {rows.map((row) => (
              <div
                key={row.name}
                style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 9,
                  }}
                >
                  <div style={{ display: "flex", fontSize: 25, color: PAPER }}>
                    {row.name}
                  </div>
                  <div style={{ display: "flex", fontSize: 25, color: GOLD }}>
                    {String(row.value)}
                  </div>
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
          <div style={{ display: "flex", color: MUTED, fontSize: 24 }}>
            Find the lever. Move the world.
          </div>
          <div style={{ display: "flex", color: GOLD, fontSize: 24, letterSpacing: 1 }}>
            vibeleverage.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
