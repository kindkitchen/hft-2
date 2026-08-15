import { make_ws } from "./ws/make_ws.ts";

/// run: deno run -A main.ts

const TOPIC = "/market/ticker";
const HOT = ["BTC-USDT", "ETH-USDT"]; /// only #1 wants these
const BUNCH = ["SOL-USDT", "XRP-USDT", "ADA-USDT", "DOGE-USDT"];
const BUNCH_HEAD = BUNCH.slice(0, 2); /// #1 takes only a part of the bunch

const STYLE_1 = "background:#0b7a3b;color:#ffffff;font-weight:bold";
const STYLE_2 = "background:#1257c9;color:#ffffff;font-weight:bold";
const STYLE_DIM = "color:#8a8a8a";
const STYLE_OFF = "";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const topic_of = (symbols: string[]) => `${TOPIC}:${symbols.join(",")}`;
const cell = (v: unknown, w: number, right = false) => {
  const s = String(v ?? "-").slice(0, w);
  return right ? s.padStart(w) : s.padEnd(w);
};

/// tiny banner: a few empty lines + one inverted label line
const banner = (label: string, note: string, style: string) => {
  console.log(`\n\n%c ${label} %c ${note}\n`, style, STYLE_DIM);
};

/// compact one-liner per tick, throttled per symbol so the log stays readable
const make_feed = (tag: string, style: string, throttle_ms = 1200) => {
  const last_at = new Map<string, number>();
  const skipped = new Map<string, number>();
  const totals = new Map<string, number>();

  return {
    totals,
    on_data: (j: { topic?: string; data?: Record<string, unknown> }) => {
      const symbol = String(j.topic ?? "").split(":")[1] ?? "?";
      totals.set(symbol, (totals.get(symbol) ?? 0) + 1);

      const now = Date.now();
      if (now - (last_at.get(symbol) ?? 0) < throttle_ms) {
        skipped.set(symbol, (skipped.get(symbol) ?? 0) + 1);
        return;
      }
      last_at.set(symbol, now);

      const d = j.data ?? {};
      const line = [
        cell(symbol, 9),
        cell(d.price, 11, true),
        cell(d.bestBid, 11, true),
        cell(d.bestAsk, 11, true),
        cell(`x${totals.get(symbol)}`, 6, true),
        cell(`~${skipped.get(symbol) ?? 0}`, 5, true),
      ].join(" ");
      skipped.set(symbol, 0);

      console.log(`%c ${tag} %c ${line}`, style, STYLE_DIM);
    },
  };
};

const table = (title: string, totals: Map<string, number>, style: string) => {
  const rows = [...totals].sort((a, b) => b[1] - a[1])
    .map(([s, n]) => `${cell(s, 9)} ${cell(n, 6, true)}`)
    .join("\n      ");
  console.log(`%c ${title} %c\n      ${rows || "-"}`, style, STYLE_OFF);
};

if (import.meta.main) {
  /// `build_unsubscribe` pushes full `topic:symbol` keys into the frame, so the
  /// server keeps streaming, while the group is already deleted locally and the
  /// dispatcher's `_subscribers.get(topic)!` throws - collapse that noise into
  /// one throttled counter, the demo is about the flow
  let orphans = 0;
  let orphans_at = 0;
  globalThis.addEventListener("error", (ev) => {
    ev.preventDefault();
    orphans++;
    const now = Date.now();
    if (now - orphans_at < 2_000) return;
    orphans_at = now;
    console.log(
      `%c ! %c orphan frames: ${orphans} (unsubscribe sent a double-prefixed ` +
        `topic, server still streams)`,
      "background:#8a1f1f;color:#ffffff;font-weight:bold",
      STYLE_DIM,
    );
  });

  const ws = await make_ws();
  const feed_1 = make_feed("1", STYLE_1);
  const feed_2 = make_feed("2", STYLE_2);

  banner(
    "#1 SUBSCRIBE",
    `${HOT.join(" ")} + ${BUNCH_HEAD.join(" ")}   (green = subscriber #1)`,
    STYLE_1,
  );
  const sub_1 = await ws.subscribe({
    topic: topic_of([...HOT, ...BUNCH_HEAD]),
    is_parsed_data_expected: true,
    on_data: feed_1.on_data,
  });
  await sleep(6_000);

  banner(
    "#2 SUBSCRIBE",
    `whole bunch ${BUNCH.join(" ")}   (blue = subscriber #2, ` +
      `${BUNCH_HEAD.join(" ")} are now shared)`,
    STYLE_2,
  );
  const sub_2 = await ws.subscribe({
    topic: topic_of(BUNCH),
    is_parsed_data_expected: true,
    on_data: feed_2.on_data,
  });
  await sleep(6_000);

  banner(
    "#1 UNSUBSCRIBE",
    `${HOT.join(" ")} only - #1 keeps ${BUNCH_HEAD.join(" ")}, ` +
      `server stops those two groups`,
    STYLE_1,
  );
  await sub_1.unsubscribe(topic_of(HOT));
  await sleep(6_000);

  banner(
    "#2 UNSUBSCRIBE",
    `whole bunch - but ${BUNCH_HEAD.join(" ")} stay alive for #1 (ref count)`,
    STYLE_2,
  );
  await sub_2.unsubscribe();
  await sleep(6_000);

  banner("PAUSE", `who received what   (orphan frames: ${orphans})`, STYLE_DIM);
  table("#1 totals", feed_1.totals, STYLE_1);
  table("#2 totals", feed_2.totals, STYLE_2);

  Deno.exit(0);
}
