import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { siteUrl } from "@/lib/site-url";
import { site } from "@/site.config";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const path = `/work/${project.slug}`;
  const fullTitle = `${project.metaTitle} | ${site.name}`;
  return {
    title: project.metaTitle,
    description: project.metaDescription,
    alternates: { canonical: path },
    // Setting openGraph here replaces the layout's, so the shared fields are repeated.
    // The image comes from this route's opengraph-image.tsx.
    openGraph: {
      type: "article",
      url: path,
      siteName: site.name,
      locale: "en_US",
      title: fullTitle,
      description: project.metaDescription,
      modifiedTime: project.updated,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: project.metaDescription,
    },
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const pageUrl = `${siteUrl}/work/${project.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: project.title },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: project.title,
        description: project.metaDescription,
        dateModified: project.updated,
        isPartOf: { "@id": `${siteUrl}/#website` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        mainEntity: { "@id": `${pageUrl}#code` },
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${pageUrl}#code`,
        name: project.title,
        description: project.summary,
        codeRepository: project.repo,
        url: project.demo,
        programmingLanguage: "TypeScript",
        keywords: project.stack.join(", "),
        author: { "@id": `${siteUrl}/#person` },
      },
    ],
  };

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl px-5 pb-20 pt-6 outline-none sm:px-8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/#work" className="text-[0.95rem] text-muted hover:text-ink">
        Back to work
      </Link>

      <article className="mt-8">
        <h1 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
          {project.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{project.summary}</p>
        <p className="mt-4 text-[0.95rem] text-muted">
          Built with {project.stack.join(", ")}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={project.demo}
            className="inline-flex items-center rounded-md bg-ink px-5 py-3 font-medium text-paper hover:bg-ink/85"
          >
            Open the live demo
          </a>
          <a
            href={project.repo}
            className="inline-flex items-center rounded-md border border-ink/55 px-5 py-3 font-medium hover:border-ink"
          >
            View the source
          </a>
        </div>

        <Image
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          sizes="(min-width: 1152px) 1088px, 100vw"
          priority
          className="mt-12 w-full rounded-lg border border-line"
        />

        <div className="mt-14 max-w-2xl space-y-12">
          {project.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {s.heading}
              </h2>
              <div className="mt-3 space-y-4">
                {s.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <aside className="mt-20 max-w-2xl">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Building something similar?
        </h2>
        <p className="mt-3 text-muted">
          If you have a product with live data or a screen that struggles under load, I would like
          to hear about it.
        </p>
        <p className="mt-4">
          <a
            href={`mailto:${site.email}`}
            className="font-medium underline decoration-accent decoration-2 underline-offset-4"
          >
            {site.email}
          </a>
        </p>
      </aside>
    </main>
  );
}
