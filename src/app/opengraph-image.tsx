import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "R2 Storage Manager — Manage Cloudflare R2 Storage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background blobs */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(91,92,240,0.25), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "-50px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.2), transparent 70%)",
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #5b5cf0 0%, #7c3aed 52%, #a855f7 100%)",
            boxShadow: "0 20px 60px rgba(91,92,240,0.4)",
            marginBottom: "32px",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.03em",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          R2 Storage Manager
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          Modern multi-tenant platform for managing
          Cloudflare R2 cloud storage
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "36px",
          }}
        >
          {["Multi-Bucket", "Drag & Drop", "Analytics", "OAuth", "Guest Mode"].map((label) => (
            <div
              key={label}
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                padding: "8px 16px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom line */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            fontSize: "14px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.1em",
          }}
        >
          OPEN SOURCE &bull; NEXT.JS &bull; TYPESCRIPT &bull; CLOUDFLARE R2
        </div>
      </div>
    ),
    { ...size }
  );
}
