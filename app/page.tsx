import Image from "next/image";
import Link from "next/link";
import { LiveMarket } from "@/components/live-market";
import { HeroItem, HeroStack, Reveal } from "@/components/motion";
import { projects } from "@/content/projects";
import { site } from "@/site.config";

const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

// Buttons are rounded-md everywhere; surfaces (images, panels) are rounded-lg.
const primaryButton =
  "inline-flex min-h-12 items-center rounded-md bg-ink px-6 font-medium text-paper transition-transform hover:bg-ink/85 active:scale-[0.98]";
const secondaryButton =
  "inline-flex min-h-12 items-center rounded-md border border-ink/55 px-6 font-medium transition-transform hover:border-ink active:scale-[0.98]";

const services = [
  {
    title: "Real-time interfaces",
    text: "Live prices, order books, charts and activity feeds that stay readable under load and don't render themselves into a stall.",
  },
  {
    title: "Dashboards and internal tools",
    text: "Operations and analytics screens where people need to filter, compare and trust the numbers.",
  },
  {
    title: "React Native apps",
    text: "Mobile apps for finance products, including the crash reporting, analytics and release habits that keep them steady.",
  },
  {
    title: "Rescue work",
    text: "Slow, fragile or hard-to-change React and Next.js apps, made faster and easier to work in.",
  },
];

export default function Home() {
  const featured = projects[0];

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      {/* Hero: the headline, one line of copy, then the proof itself: every real trade, live. */}
      <section className={`${container} pb-20 pt-6 lg:pt-10`}>
        <HeroStack>
          <HeroItem>
            <h1 className="display-tight font-display text-[clamp(2.5rem,6.4vw,5rem)] font-semibold leading-[1.02]">
              <span className="lg:block">I build real-time interfaces </span>
              <span className="lg:block">for financial products.</span>
            </h1>
          </HeroItem>

          <HeroItem className="mt-7 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-lg text-xl text-muted">{site.intro}</p>
            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${site.email}`} className={primaryButton}>
                Contact me
              </a>
              <a href={featured.demo} className={secondaryButton}>
                Live demo
              </a>
            </div>
          </HeroItem>

          <HeroItem className="mt-9">
            <LiveMarket demoUrl={featured.demo} />
          </HeroItem>
        </HeroStack>
      </section>

      {/* Work: the page's single colour block. Full bleed, product shown at both widths. */}
      <section id="work" className="scroll-mt-4 bg-band text-band-text">
        <div className={`${container} py-24 lg:py-32`}>
          <h2 className="text-xl text-band-muted">Work</h2>

          <div className="mt-10 grid items-center gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-20">
            <Reveal>
              <h3 className="display-tight font-display text-4xl font-semibold leading-[1.05] md:text-5xl">
                {featured.title}
              </h3>
              <p className="mt-5 max-w-md text-lg text-band-muted">{featured.summary}</p>
              <p className="mt-4 max-w-md text-band-muted">
                Built with {featured.stack.join(", ")}.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-7 font-medium">
                <Link
                  href={`/work/${featured.slug}`}
                  className="inline-flex min-h-11 items-center underline decoration-accent decoration-2 underline-offset-4"
                >
                  Read the case study
                </Link>
                <a
                  href={featured.demo}
                  aria-label={`Live demo of ${featured.title}`}
                  className="inline-flex min-h-11 items-center underline decoration-band-muted decoration-2 underline-offset-4 hover:decoration-accent"
                >
                  Live demo
                </a>
                <a
                  href={featured.repo}
                  aria-label={`Source code of ${featured.title}`}
                  className="inline-flex min-h-11 items-center underline decoration-band-muted decoration-2 underline-offset-4 hover:decoration-accent"
                >
                  Source
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="relative pb-0 md:pb-16">
              <Link
                href={`/work/${featured.slug}`}
                aria-label={`Case study: ${featured.title}`}
                className="block"
              >
                <Image
                  src={featured.image.src}
                  alt={featured.image.alt}
                  width={featured.image.width}
                  height={featured.image.height}
                  sizes="(min-width: 1024px) 720px, 100vw"
                  className="w-full rounded-lg border border-band-line"
                />
              </Link>
              {/* Phone capture overlaps the desktop one: the same product, one column. */}
              <Image
                src={featured.mobileImage.src}
                alt={featured.mobileImage.alt}
                width={featured.mobileImage.width}
                height={featured.mobileImage.height}
                sizes="200px"
                className="absolute -bottom-4 -left-6 hidden w-44 rounded-lg border border-band-line shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] md:block lg:-left-12 lg:w-52"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* What I do: a typographic index. Large titles, spacing instead of rules. */}
      <section id="services" className={`${container} scroll-mt-4 py-24 lg:py-32`}>
        <h2 className="text-xl text-muted">What I do</h2>
        <ul className="mt-10">
          {services.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.05}>
                <div className="grid gap-3 py-7 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-baseline md:gap-16">
                  <h3 className="display-tight font-display text-3xl font-semibold leading-[1.08] md:text-5xl">
                    {s.title}
                  </h3>
                  <p className="max-w-md text-muted">{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Experience: one statement set large, the stack stated plainly beneath it. */}
      <section id="experience" className={`${container} scroll-mt-4 pb-24 lg:pb-32`}>
        <h2 className="text-xl text-muted">Experience</h2>
        <Reveal>
          <p className="display-tight mt-8 max-w-4xl font-display text-3xl font-medium leading-[1.15] md:text-5xl">
            Four years of building frontends for finance: a production mobile trading app with
            live market data, internal dashboards for settlement operations, and web applications
            for banking clients.
          </p>
          <p className="mt-8 max-w-2xl text-lg">
            Day to day I work in React, Next.js, React Native, TypeScript, Redux Toolkit and
            WebSockets, with Jest for tests. When a project needs a backend I can work in Node.js
            or Spring Boot.
          </p>
        </Reveal>
      </section>

      {/* Contact: the address is the headline. */}
      <section id="contact" className={`${container} scroll-mt-4 pb-28 lg:pb-36`}>
        <h2 className="text-xl text-muted">Contact</h2>
        <Reveal>
          <p className="mt-8 max-w-xl text-xl">
            Working on something with live data, a dashboard that has gotten slow, or a React
            Native app that needs steadier ground? Tell me what you are building and what is
            getting in the way.
          </p>
          <p className="mt-8">
            <a
              href={`mailto:${site.email}`}
              className="display-tight font-display text-[clamp(1.75rem,6vw,4.5rem)] font-semibold leading-tight underline decoration-accent decoration-[3px] underline-offset-[0.2em] [overflow-wrap:anywhere]"
            >
              {site.email}
            </a>
          </p>
        </Reveal>
      </section>
    </main>
  );
}
