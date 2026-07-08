import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "archimedes: the leverage diagnosis. You don't have an effort problem. You have a leverage problem.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#f6b13f";
const INK = "#0b0a08";
const MUTED = "#8f8878";

export default function OpengraphImage() {
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
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: MUTED,
            fontSize: 26,
            letterSpacing: 8,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderBottom: `22px solid ${GOLD}`,
            }}
          />
          THE LEVERAGE CLINIC
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 150,
              fontWeight: 700,
              color: "#f2ead9",
              letterSpacing: -6,
              lineHeight: 1,
            }}
          >
            archimedes
          </div>
          <div
            style={{
              marginTop: 34,
              fontSize: 40,
              color: "#c9c2b2",
              lineHeight: 1.25,
              display: "flex",
            }}
          >
            You don&apos;t have an effort problem. You have a leverage problem.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
            <div
              style={{
                width: 340,
                height: 8,
                backgroundColor: GOLD,
                borderRadius: 4,
                transform: "rotate(-6deg)",
                transformOrigin: "70% 50%",
              }}
            />
            <div
              style={{
                width: 0,
                height: 0,
                marginLeft: -160,
                borderLeft: "26px solid transparent",
                borderRight: "26px solid transparent",
                borderBottom: `40px solid ${GOLD}`,
              }}
            />
          </div>
          <div style={{ color: MUTED, fontSize: 28, letterSpacing: 2 }}>
            archimedes.life
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
