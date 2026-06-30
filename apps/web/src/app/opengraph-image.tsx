import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "zkHelios — Zero-Knowledge proofs. Solana speed.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#000000",
          backgroundImage: "radial-gradient(60% 60% at 30% 0%, rgba(245,165,36,0.22) 0%, rgba(0,0,0,0) 70%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: "#F5A524" }} />
          <div style={{ fontSize: 44, fontWeight: 700, color: "#FAFAFA" }}>
            zk<span style={{ color: "#F5A524" }}>Helios</span>
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 76, fontWeight: 800, color: "#FAFAFA", lineHeight: 1.05, maxWidth: 900 }}>
          Zero-Knowledge proofs. <span style={{ color: "#F5A524" }}>Solana speed.</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#A1A1AA", maxWidth: 880 }}>
          Privacy-preserving verification on Solana. Prove what matters, reveal only what you choose.
        </div>
      </div>
    ),
    size,
  );
}
