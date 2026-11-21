import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CurhatKu",
    short_name: "CurhatKu",
    description: "Tempat berteduh untuk bercerita — journal, forum anonim, artikel, dan psikolog.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#1f5c54",
    lang: "id",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
