import { site, socialLinks } from "@/site.config";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-5 py-10 text-[0.95rem] text-muted sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p>
          &copy; {new Date().getFullYear()} {site.name}, {site.location}
        </p>
        <ul className="flex gap-5">
          {socialLinks.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                rel="me noopener"
                className="inline-flex min-h-11 items-center hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
