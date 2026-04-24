import type { MetadataRoute } from "next";

// Web app manifest — lets mobile browsers render a branded install
// prompt and gives the iOS home-screen icon + name a real source of
// truth (previously relied on iOS defaults).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dr. Sameh Elguizaoui, M.D.",
    short_name: "Dr. Elguizaoui",
    description:
      "Board-certified orthopedic surgeon specializing in sports medicine, knee & shoulder surgery, and cartilage repair in NYC.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a1628",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
