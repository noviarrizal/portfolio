import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { siteUrl } from "@/lib/site-url";

// lastModified comes from the content, not the build date: stamping every deploy
// as "changed" teaches crawlers to ignore the field.
export default function sitemap(): MetadataRoute.Sitemap {
  const latest = projects.map((p) => p.updated).sort().at(-1);
  return [
    { url: siteUrl, lastModified: latest },
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      lastModified: p.updated,
    })),
  ];
}
