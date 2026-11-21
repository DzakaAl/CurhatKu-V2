import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CurhatKu",
    short_name: "CurhatKu",
    description: "Semua perasaan layak punya tempat — journal, forum anonim, artikel, dan psikolog.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f8fb",
    theme_color: "#3155d4",
    lang: "id",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
