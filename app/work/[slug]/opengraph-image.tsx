import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getProject } from "@/content/projects";
import { site } from "@/site.config";

export const alt = "Case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CaseStudyImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

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
        <div style={{ fontSize: 32, color: "#8fa3b3" }}>{`Case study by ${site.name}`}</div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            maxWidth: 1000,
          }}
        >
          {project.title}
        </div>
        <div style={{ fontSize: 30, color: "#8fa3b3" }}>{project.stack.join(", ")}</div>
      </div>
    ),
    size,
  );
}
