/**
 * Single place for personal details. Leave `linkedin` and `upwork` empty until
 * you have the URLs: links with no value are simply not rendered.
 */
export const site = {
  name: "Arif Noviarrizal",
  role: "Frontend engineer",
  location: "Jakarta, Indonesia",
  headline: "I build real-time interfaces for financial products.",
  intro:
    "Arif Noviarrizal, frontend engineer in Jakarta. React, Next.js and React Native for live market data and trading screens.",
  description:
    "Frontend engineer in Jakarta building real-time trading dashboards, fintech UIs and React Native apps with React, Next.js and TypeScript.",
  email: "arifnoviarrizal@gmail.com",
  github: "https://github.com/noviarrizal",
  linkedin: "https://www.linkedin.com/in/arif-noviarrizal/",
  upwork: "https://www.upwork.com/freelancers/~01c9c20de3e6b27fd5",
} as const;

export const socialLinks = [
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
  { label: "Upwork", href: site.upwork },
].filter((l) => l.href);
