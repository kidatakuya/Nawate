import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nawate | 生育管理アプリ",
    short_name: "Nawate",
    description: "畑・作物・生育記録を管理する農業向けアプリ",
    lang: "ja",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f7f2",
    theme_color: "#3f7a4f",
    icons: [
      {
        src: "/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
