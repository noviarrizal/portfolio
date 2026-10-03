import Link from "next/link";
import { site } from "@/site.config";

const nav = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center font-display text-lg font-semibold tracking-tight"
      >
        {site.name}
      </Link>
      <nav aria-label="Main">
        <ul className="flex gap-6 text-[0.95rem]">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center text-muted hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
