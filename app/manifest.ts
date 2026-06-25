import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sukoon सुकून — thoda sukoon, har din",
    short_name: "Sukoon",
    description:
      "An Indian stress-relief app — pranayama, trataka, soundscapes, rangoli, a daily ritual, and instant quick-calm. Works offline.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#2a1410",
    theme_color: "#2a1410",
    categories: ["health", "lifestyle", "wellness"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
