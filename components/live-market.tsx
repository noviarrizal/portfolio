"use client";

import { useEffect, useRef, useState } from "react";

// Coinbase Exchange's public feed: no key, open CORS on REST, and reachable from the US as well as
// Asia, which matters because the visitors are hiring leads in many countries.
const WS = "wss://ws-feed.exchange.coinbase.com";
const REST = "https://api.exchange.coinbase.com";
const WINDOW_MS = 120_000;
const MAX_TRADES = 6000;
const GIVE_UP_MS = 8000;
const REDUCED_MOTION_PAUSE_MS = 10_000;
const FLOW_PRODUCT = "BTC-USD";
const MARKETS = [
  { id: "BTC-USD", label: "BTC" },
  { id: "ETH-USD", label: "ETH" },
  { id: "SOL-USD", label: "SOL" },
] as const;

/**
 * Coinbase reports the MAKER's side on matches (WebSocket and REST alike, checked against live data):
 * a "buy" match means a resting buy order was hit, so the aggressor sold.
 */
const aggressorSold = (makerSide: string) => makerSide === "buy";

interface Trade {
  id: number; // exchange trade id, used to avoid drawing a trade twice
  t: number; // local time, ms. Not the exchange clock, so dots never land off-screen
  price: number;
  qty: number;
  sell: boolean; // true when the aggressor sold
}

interface Quote {
  last: number;
  open: number;
}

type Status = "connecting" | "live" | "offline";

const price = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Order flow, drawn from real BTC-USD trades of the last two minutes. Newest is at the
 * right edge; each trade is a bar from the baseline, up for a buy and down for a sell,
 * taller for a bigger trade. The line is net buying (buys minus sells) over the window.
 * Price itself barely moves at this scale, so it is not what the chart plots.
 * One WebSocket feeds both the canvas and the three quotes underneath it.
 */
export function LiveMarket({ demoUrl }: { demoUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trades = useRef<Trade[]>([]);
  const latest = useRef<Record<string, Quote>>({});
  const count = useRef(0);
  const pausedRef = useRef(false);

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [status, setStatus] = useState<Status>("connecting");
  const [rate, setRate] = useState(0);
  const [paused, setPaused] = useState(false);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  // The socket, plus a twice-a-second publish for the numbers that live in React.
  useEffect(() => {
    let closed = false;
    let ws: WebSocket | null = null;
    let retry = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let giveUpTimer: ReturnType<typeof setTimeout> | undefined;
    const ctrl = new AbortController();

    // Start with the last thousand real trades so the chart is full on arrival, not empty.
    // Times are anchored to the newest of them, which avoids any clock difference with the exchange.
    fetch(`${REST}/products/${FLOW_PRODUCT}/trades?limit=1000`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then(
        (rows: { trade_id: number; side: string; size: string; price: string; time: string }[]) => {
          if (closed || !rows.length) return;
          // The newest trade comes first.
          const offset = Date.now() - Date.parse(rows[0].time);
          const seen = new Set(trades.current.map((tr) => tr.id));
          const earlier = rows
            .filter((r) => !seen.has(r.trade_id))
            .map((r) => ({
              id: r.trade_id,
              t: Date.parse(r.time) + offset,
              price: Number(r.price),
              qty: Number(r.size),
              sell: aggressorSold(r.side),
            }));
          trades.current = [...earlier, ...trades.current].sort((a, b) => a.t - b.t);
        },
      )
      .catch(() => {
        /* the live stream alone still fills the chart, just more slowly */
      });

    const connect = () => {
      if (closed) return;
      ws = new WebSocket(WS);
      giveUpTimer = setTimeout(() => {
        if (ws?.readyState === WebSocket.CONNECTING) ws.close();
      }, GIVE_UP_MS);

      ws.onopen = () => {
        retry = 0;
        clearTimeout(giveUpTimer);
        setStatus("live");
        ws?.send(
          JSON.stringify({
            type: "subscribe",
            product_ids: MARKETS.map((m) => m.id),
            channels: ["matches", "ticker"],
          }),
        );
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as Record<string, string>;
          if (msg.type === "match" && msg.product_id === FLOW_PRODUCT) {
            count.current += 1;
            const list = trades.current;
            const id = Number(msg.trade_id);
            // The REST backfill can already hold this trade.
            if (list.length && id <= list[list.length - 1].id) return;
            list.push({
              id,
              t: Date.now(),
              price: Number(msg.price),
              qty: Number(msg.size),
              sell: aggressorSold(msg.side),
            });
            if (list.length > MAX_TRADES) list.splice(0, list.length - MAX_TRADES);
          } else if (msg.type === "ticker" && msg.product_id) {
            count.current += 1;
            latest.current[msg.product_id] = {
              last: Number(msg.price),
              open: Number(msg.open_24h),
            };
          }
        } catch {
          /* ignore malformed frames */
        }
      };
      ws.onclose = () => {
        clearTimeout(giveUpTimer);
        if (closed) return;
        setStatus((s) => (s === "live" ? "connecting" : "offline"));
        retryTimer = setTimeout(connect, Math.min(15000, 1000 * 2 ** retry++));
      };
      ws.onerror = () => ws?.close();
    };
    connect();

    const tick = setInterval(() => {
      if (pausedRef.current) {
        count.current = 0;
        return;
      }
      setQuotes({ ...latest.current });
      setRate(count.current * 2);
      count.current = 0;
    }, 500);

    // People who ask their system for reduced motion get it paused once there is something to look at.
    const reduceTimer = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? setTimeout(() => {
          pausedRef.current = true;
          setPaused(true);
        }, REDUCED_MOTION_PAUSE_MS)
      : undefined;

    return () => {
      closed = true;
      ctrl.abort();
      clearTimeout(retryTimer);
      clearTimeout(giveUpTimer);
      clearTimeout(reduceTimer);
      clearInterval(tick);
      if (ws) {
        ws.onclose = ws.onerror = ws.onmessage = ws.onopen = null;
        ws.close();
      }
    };
  }, []);

  // The canvas. Draws only while visible, and at one frame a second under reduced motion.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const color = (name: string) => css.getPropertyValue(name).trim();
    const c = {
      up: color("--up"),
      down: color("--down"),
      line: color("--term-line"),
      text: color("--term-text"),
      muted: color("--term-muted"),
      ink: "#0f1a24",
    };
    const family = getComputedStyle(canvas).fontFamily;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let visible = true;
    let raf = 0;
    let lastDraw = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    const draw = () => {
      const now = Date.now();
      const list = trades.current;
      let drop = 0;
      while (drop < list.length && now - list[drop].t > WINDOW_MS) drop += 1;
      if (drop) list.splice(0, drop);

      ctx.clearRect(0, 0, w, h);
      if (!list.length || w < 120) return;

      // Room above for the status row and caption, below for the quotes strip and the time labels.
      const padL = 20;
      const padR = w < 520 ? 84 : 104;
      const padT = w < 520 ? 128 : 92;
      const padB = 108;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const cy = padT + plotH / 2; // the baseline: buys rise above it, sells drop below
      const reach = plotH / 2 - 6;
      const x = (t: number) => padL + plotW - ((now - t) / WINDOW_MS) * plotW;

      ctx.font = `12px ${family}`;
      ctx.textBaseline = "middle";
      ctx.lineWidth = 1;

      // Baseline, the two sides it separates, and the time axis.
      const base = Math.round(cy) + 0.5;
      ctx.strokeStyle = c.line;
      ctx.beginPath();
      ctx.moveTo(padL, base);
      ctx.lineTo(padL + plotW, base);
      ctx.stroke();
      ctx.fillStyle = c.muted;
      ctx.textAlign = "left";
      ctx.fillText("Buys", padL + 4, padT + 8);
      ctx.fillText("Sells", padL + 4, padT + plotH - 8);
      ctx.fillText("2 min ago", padL, padT + plotH + 20);
      ctx.textAlign = "right";
      ctx.fillText("now", padL + plotW, padT + plotH + 20);

      // One bar per trade. Height follows size on a gentle curve so small trades stay visible.
      for (const tr of list) {
        const size = Math.min(1, Math.pow(tr.qty, 0.4));
        const bh = Math.max(2, size * reach);
        const px = x(tr.t);
        // Older trades fade out toward the left edge, so the window has no hard cut.
        ctx.globalAlpha = 0.85 * Math.min(1, Math.max(0, (px - padL) / (plotW * 0.12)));
        ctx.fillStyle = tr.sell ? c.down : c.up;
        if (tr.sell) ctx.fillRect(px - 1, cy, 2, bh);
        else ctx.fillRect(px - 1, cy - bh, 2, bh);
        if (tr.qty >= 0.5) {
          ctx.beginPath();
          ctx.arc(px, tr.sell ? cy + bh : cy - bh, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = c.text;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Net buying: running buys minus sells over the window, on its own symmetric scale.
      let run = 0;
      let maxAbs = 0.5;
      const net = list.map((tr) => {
        run += tr.sell ? -tr.qty : tr.qty;
        if (Math.abs(run) > maxAbs) maxAbs = Math.abs(run);
        return run;
      });
      const ny = (v: number) => cy - (v / maxAbs) * reach * 0.9;
      ctx.strokeStyle = c.text;
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      list.forEach((tr, i) => {
        if (i) ctx.lineTo(x(tr.t), ny(net[i]));
        else ctx.moveTo(x(tr.t), ny(net[i]));
      });
      ctx.stroke();
      ctx.lineWidth = 1;

      const total = net[net.length - 1];
      const labelY = Math.min(padT + plotH - 14, Math.max(padT + 16, ny(total)));
      ctx.textAlign = "left";
      ctx.fillStyle = c.muted;
      ctx.fillText("net buying", padL + plotW + 10, labelY - 14);
      ctx.fillStyle = total >= 0 ? c.up : c.down;
      ctx.fillText(`${total >= 0 ? "+" : ""}${total.toFixed(2)} BTC`, padL + plotW + 10, labelY + 2);
    };

    const frame = (time: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden || pausedRef.current) return;
      if (reduce && time - lastDraw < 1000) return;
      lastDraw = time;
      draw();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const caption =
    status === "offline"
      ? null
      : status === "connecting"
        ? "Connecting to Coinbase..."
        : paused
          ? "Updates paused."
          : "Each bar is a real BTC/USD trade from the last two minutes: buys rise, sells drop, a taller bar is a bigger trade. The white line is net buying.";

  return (
    <div
      role="group"
      aria-label="Live BTC/USD trades"
      data-nosnippet
      className="relative h-[27rem] overflow-hidden rounded-lg border border-term-line bg-term text-term-text shadow-[0_30px_80px_-30px_rgba(15,26,36,0.6)] lg:h-[29rem]"
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="num absolute inset-0 h-full w-full"
      />

      <div className="absolute left-5 top-4 flex items-center gap-3 text-[0.875rem] text-term-muted">
        <span
          aria-hidden
          className={`size-2 rounded-full ${status === "live" && !paused ? "bg-up" : "bg-term-muted"}`}
        />
        {/* Only the state is a live region; the rate changes too often to announce. */}
        <span role="status">
          {status !== "live" ? (status === "connecting" ? "Connecting" : "Offline") : paused ? "Paused" : "Live"}
        </span>
        <span>from Coinbase</span>
        {status === "live" && !paused && (
          <span className="num" aria-hidden>
            {rate} msg/s
          </span>
        )}
      </div>

      {status === "live" && (
        <button
          type="button"
          onClick={togglePause}
          aria-pressed={paused}
          className="absolute right-3 top-1 inline-flex min-h-11 items-center px-2 text-[0.875rem] text-term-muted underline hover:text-term-text"
        >
          {paused ? "Resume updates" : "Pause updates"}
        </button>
      )}

      <p className="absolute left-5 right-5 top-11 text-[0.875rem] leading-snug text-term-muted sm:right-auto sm:max-w-xl">
        {caption ?? (
          <>
            The live feed isn&apos;t reachable from here right now. The{" "}
            <a href={demoUrl} className="underline hover:text-term-text">
              full dashboard
            </a>{" "}
            uses the same data.
          </>
        )}
      </p>

      <ul className="absolute inset-x-0 bottom-0 grid grid-cols-3 border-t border-term-line bg-term px-5 py-3">
        {MARKETS.map((m) => {
          const q = quotes[m.id];
          const change = q ? ((q.last - q.open) / q.open) * 100 : null;
          return (
            <li key={m.id} className="flex flex-col">
              <span className="text-[0.875rem] text-term-muted">{m.label}/USD</span>
              <span className="num text-[1.05rem]">{q ? price.format(q.last) : "-"}</span>
              <span
                className={`num text-[0.875rem] ${
                  change === null ? "text-term-muted" : change >= 0 ? "text-up" : "text-down"
                }`}
              >
                {change !== null && (
                  <>
                    <span aria-hidden>{change >= 0 ? "▲" : "▼"} </span>
                    {`${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
