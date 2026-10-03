import { ImageResponse } from "next/og";
import { site } from "@/site.config";

export const alt = `${site.name}: ${site.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f1a24",
          color: "#d9e3ea",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 34, color: "#8fa3b3" }}>{site.name}</div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            maxWidth: 960,
          }}
        >
          {site.headline}
        </div>
        <div style={{ fontSize: 30, color: "#8fa3b3" }}>
          {`React, Next.js, React Native and TypeScript. ${site.location}.`}
        </div>
      </div>
    ),
    size,
  );
}
