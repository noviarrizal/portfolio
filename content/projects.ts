export interface Project {
  slug: string;
  title: string;
  /** Page title for search results, when it should say more than the heading does. */
  metaTitle: string;
  /** Last real content change, YYYY-MM-DD. Feeds the sitemap, so only bump it when the page changes. */
  updated: string;
  /** Short and plain, for search snippets (aim for under 155 characters). */
  metaDescription: string;
  /** One or two sentences shown on the home page and at the top of the case study. */
  summary: string;
  stack: string[];
  demo: string;
  repo: string;
  image: { src: string; alt: string; width: number; height: number };
  /** Phone-width capture, shown beside the desktop one to prove the layout holds. */
  mobileImage: { src: string; alt: string; width: number; height: number };
  /** Case study body, as plain paragraphs under named headings. */
  sections: { heading: string; paragraphs: string[] }[];
}

export const projects: Project[] = [
  {
    slug: "realtime-trading-dashboard",
    title: "Real-time Trading Dashboard",
    metaTitle: "Real-time Trading Dashboard in Next.js",
    updated: "2026-10-04",
    metaDescription:
      "How I built a live trading dashboard in Next.js: one WebSocket, one render per frame, an order book, candlestick chart and visible feed health.",
    summary:
      "A live market dashboard with a candlestick chart, order book, trade tape and watchlist, all fed by one WebSocket. I built it to show how I keep a fast-moving screen smooth.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "WebSockets", "lightweight-charts"],
    demo: "https://realtime-trading-dashboard-lime.vercel.app/",
    repo: "https://github.com/noviarrizal/realtime-trading-dashboard",
    image: {
      src: "/work/realtime-trading-dashboard.png",
      alt: "The trading dashboard showing a candlestick chart, an order book and a list of recent trades",
      width: 1440,
      height: 900,
    },
    mobileImage: {
      src: "/work/realtime-trading-dashboard-mobile.png",
      alt: "The same dashboard at phone width, with the price, chart and order book stacked in one column",
      width: 390,
      height: 844,
    },
    sections: [
      {
        heading: "The problem",
        paragraphs: [
          "Market data arrives faster than a screen can sensibly redraw. If every trade and every order book update triggers a render, the interface stalls just when the market gets busy, and people stop trusting the numbers on it.",
        ],
      },
      {
        heading: "How it works",
        paragraphs: [
          "The app keeps one WebSocket open and changes what it listens to by subscribing and unsubscribing, so switching market or timeframe never means reconnecting. Incoming messages are buffered and published at most once per animation frame, so a burst of trades costs one render instead of dozens.",
          "Each panel reads only the slice of data it needs through useSyncExternalStore. The order book re-renders on book updates, not on every trade.",
          "The exchange sends the order book as a snapshot followed by diffs, so the feed keeps the book itself. It applies each diff, trims levels far from the top, and publishes the best twenty per side. If the book ever looks crossed, which means a diff was missed, it keeps showing the last good one instead. There is no candle stream either, so the newest candle is grown from trades as they arrive.",
          "Coinbase reports the maker's side on each trade, which is the opposite of what most people assume. I checked it against live data (where each trade printed relative to the best bid and ask) before colouring a single bar, because getting that backwards would show buyers as sellers.",
          "If the connection drops, it reconnects with backoff and jitter. A connect timeout and a watchdog catch the two quieter failures: a socket that never opens and one that stays open but goes silent.",
        ],
      },
      {
        heading: "Making the feed visible",
        paragraphs: [
          "The top bar shows connection state, messages per second over the last 30 seconds, smoothed lag and the reconnect count. Real-time is easy to claim and hard to see, so I put it on screen. The lag figure compares the exchange timestamp with the browser clock, so it is indicative rather than exact, and the interface says so.",
        ],
      },
      {
        heading: "Details that matter to people",
        paragraphs: [
          "There is a colour-blind safe palette (blue and orange instead of green and red) that is remembered between visits, controls work from the keyboard with visible focus, and the layout holds down to phone width. Empty, loading, error and reconnecting states all say what is happening and what to do.",
        ],
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
