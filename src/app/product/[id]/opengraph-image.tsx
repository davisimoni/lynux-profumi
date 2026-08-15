import { ImageResponse } from "next/og";
import { getProductBySlug, products } from "@/data/products";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lynux Profumi";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.slug }));
}

interface OgImageProps {
  params: Promise<{ id: string }>;
}

export default async function OpengraphImage({ params }: OgImageProps) {
  const { id } = await params;
  const product = getProductBySlug(id);

  const name = product?.name ?? "Lynux Profumi";
  const tagline = product?.tagline ?? "L'Arte della Profumeria Invisibile";
  const family = product?.family;
  const accent = product?.accent ?? "#D8B45B";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08080A",
          backgroundImage: "linear-gradient(135deg, #08080A 0%, #121216 55%, #08080A 100%)",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: `1.5px solid ${accent}66`,
            borderRadius: "12px",
            padding: "64px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 10,
              color: accent,
              textTransform: "uppercase",
            }}
          >
            Lynux Profumi
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 88,
              fontWeight: 600,
              color: "#F5F5F2",
              letterSpacing: 2,
            }}
          >
            {name}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 32,
              color: "#94A3B8",
            }}
          >
            {tagline}
          </div>

          {family && (
            <div
              style={{
                display: "flex",
                marginTop: 44,
                fontSize: 20,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: accent,
                border: `1px solid ${accent}88`,
                borderRadius: "999px",
                padding: "10px 32px",
              }}
            >
              {family}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
