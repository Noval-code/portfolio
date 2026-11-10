"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { CalendarHeatmap, CalendarHeatmap3D, type CalendarDay, type Heatmap3DBlockStyle, type Heatmap3DCamera, type Heatmap3DShape, type HeatmapShape } from "@thilakbhat/heatmap-ui";
import "@thilakbhat/heatmap-ui/styles.css";

// Your settings from heatmapui.dev. Change any line to restyle the graph.
const THEME = "light";
const COLORS = ["#e4e4e7","#b4b4bb","#71717a","#3f3f46"];
const EMPTY = "#eae9e6";
const MODE = "3d";
const SHAPE = "rounded";
const BLOCKS = "skyline";
const STATS = "inline";
const FONT = "sans";
const TINT = true;
const DISPLAY = { header: true, year: true, months: true, weekdays: false, legend: true, counts: false };

export type Contribution = { date: string; count: number };
/** "last" is the trailing 12 months; a number is that calendar year. */
export type ActivityPeriod = "last" | number;
export type ActivityMode = "2d" | "3d";
export type ActivityBlocks = keyof typeof BLOCK_STYLES;
export type StatsLayout = "row" | "cards" | "inline" | "none";
export type StatsFont = "sans" | "mono" | "pixel";
export type ActivityDisplay = typeof DISPLAY;
const DAY_MS = 86400000;
const WEEKS = 53;
/** 2D cell and gap: plain, and roomier when each cell shows its count. */
const GRID = { plain: { cell: 13, gap: 4 }, counts: { cell: 16, gap: 3 } };
/** The Mon, Wed, Fri column and its margin, with a little to spare so every week still fits. */
const WEEKDAY_GUTTER = 28;

/** 3D looks, each a pairing of heatmap-ui's block style and column shape. */
export const BLOCK_STYLES = {
  skyline: { blockStyle: "building", shape: "rectangle" },
  lego: { blockStyle: "lego", shape: "rectangle" },
  blocks: { blockStyle: "solid", shape: "rectangle" },
  cylinders: { blockStyle: "solid", shape: "circle" },
  bars: { blockStyle: "solid", shape: "bar" },
} satisfies Record<string, { blockStyle: Heatmap3DBlockStyle; shape: Heatmap3DShape }>;

/** Today in the viewer's time zone, as YYYY-MM-DD. */
function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function parseGithubUsername(value: string) {
  const match = value.trim().match(/^https?:\/\/(?:www\.)?github\.com\/([^/?#]+)/i);
  const username = (match?.[1] ?? value.trim()).replace(/^@/, "");
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
    throw new Error("Enter a valid GitHub username or profile URL.");
  }
  return username;
}

/** Every public contribution day since the account began, up to today. */
export async function fetchGithubContributions(username: string, signal?: AbortSignal): Promise<Contribution[]> {
  const handle = parseGithubUsername(username);
  const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(handle)}?y=all`, { signal });
  if (!response.ok) throw new Error(response.status === 404 ? "That GitHub profile could not be found." : "The contribution service is unavailable. Please try again.");
  const body = await response.json();
  if (!Array.isArray(body.contributions)) throw new Error("No contribution calendar was returned for this profile.");
  const until = today();
  const byDate = new Map<string, Contribution>();
  for (const day of body.contributions) {
    if (typeof day?.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || day.date > until || !Number.isSafeInteger(day.count) || day.count < 0) continue;
    const time = Date.parse(day.date + "T00:00:00Z");
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== day.date) continue;
    byDate.set(day.date, { date: day.date, count: day.count });
  }
  const days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  if (!days.length) throw new Error("No public contribution data was returned.");
  return days;
}

/** Exactly matches CalendarHeatmap's Sunday-aligned columns, including a partial last week. */
export function activityRange(contributions: readonly Contribution[], to: string, weeks: number) {
  const end = new Date(to + "T00:00:00Z");
  const start = new Date(end.getTime() - (end.getUTCDay() + (weeks - 1) * 7) * DAY_MS);
  const from = start.toISOString().slice(0, 10);
  return { from, to, days: contributions.filter(day => day.date >= from && day.date <= to) };
}

/** The dates a period covers. A calendar year stops at `to` while it is still under way. */
export function periodRange(contributions: readonly Contribution[], period: ActivityPeriod, to: string) {
  if (period === "last") return activityRange(contributions, to, WEEKS);
  const from = `${period}-01-01`;
  const end = `${period}-12-31` < to ? `${period}-12-31` : to;
  return { from, to: end, days: contributions.filter(day => day.date >= from && day.date <= end) };
}

/** Years with data, newest first. */
export function activityYears(contributions: readonly Contribution[], to: string) {
  return [...new Set(contributions.filter(day => day.date <= to).map(day => Number(day.date.slice(0, 4))))].sort((a, b) => b - a);
}

export function activityStats(days: readonly Contribution[]) {
  let total = 0, activeDays = 0, peak = 0, peakDate = "", longestStreak = 0, streak = 0, streakFrom = "", streakTo = "", runFrom = "";
  let previous = 0;
  for (const day of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    const time = Date.parse(day.date + "T00:00:00Z");
    total += day.count;
    if (day.count > peak) { peak = day.count; peakDate = day.date; }
    if (day.count > 0) {
      activeDays += 1;
      if (time - previous === DAY_MS && streak > 0) streak += 1;
      else { streak = 1; runFrom = day.date; }
      if (streak > longestStreak) { longestStreak = streak; streakFrom = runFrom; streakTo = day.date; }
    } else streak = 0;
    previous = time;
  }
  return { total, activeDays, dayCount: days.length, longestStreak, streakFrom, streakTo, peak, peakDate };
}

/** A 3×5 digit font. Pixel stats are drawn with the graph's own cells. */
const DIGITS: Record<string, string[]> = {
  "0": ["###", "#.#", "#.#", "#.#", "###"], "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["###", "..#", "###", "#..", "###"], "3": ["###", "..#", ".##", "..#", "###"],
  "4": ["#.#", "#.#", "###", "..#", "..#"], "5": ["###", "#..", "###", "..#", "###"],
  "6": ["###", "#..", "###", "#.#", "###"], "7": ["###", "..#", "..#", ".#.", ".#."],
  "8": ["###", "#.#", "###", "#.#", "###"], "9": ["###", "#.#", "###", "..#", "###"],
  ",": [".", ".", ".", ".", "#"],
};

function PixelNumber({ text, cell, on, off, round }: { text: string; cell: number; on: string; off: string; round: boolean }) {
  const gap = Math.max(1, Math.round(cell * 0.28 * 10) / 10);
  const step = cell + gap;
  const dots: { x: number; y: number; lit: boolean }[] = [];
  let column = 0;
  for (const char of text) {
    const glyph = DIGITS[char];
    if (!glyph) continue;
    glyph.forEach((row, y) => [...row].forEach((pixel, dx) => dots.push({ x: column + dx, y, lit: pixel === "#" })));
    column += glyph[0].length + 1;
  }
  const round1 = (value: number) => Math.round(value * 10) / 10;
  const width = round1(Math.max(0, (column - 1) * step - gap));
  const height = round1(5 * step - gap);
  return (
    <svg role="img" aria-label={text} width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", overflow: "visible" }}>
      {dots.map(dot => <rect key={`${dot.x}:${dot.y}`} x={round1(dot.x * step)} y={round1(dot.y * step)} width={cell} height={cell} rx={round ? cell / 2 : Math.min(2, cell / 4)} fill={dot.lit ? on : off} />)}
    </svg>
  );
}

const Check = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;

/** A small listbox for the period. Built in, so the component needs nothing beyond React and heatmap-ui. */
function PeriodSelect({ value, years, onChange, dark }: { value: ActivityPeriod; years: number[]; onChange: (period: ActivityPeriod) => void; dark: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const options: ActivityPeriod[] = ["last", ...years];
  const label = (period: ActivityPeriod) => period === "last" ? "Last 12 months" : String(period);

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  useEffect(() => {
    if (open) list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const show = () => { setActive(Math.max(0, options.indexOf(value))); setOpen(true); };
  const choose = (period: ActivityPeriod) => { onChange(period); setOpen(false); button.current?.focus(); };
  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: options.length - 1 };
    if (event.key in moves) { event.preventDefault(); setActive(Math.min(options.length - 1, Math.max(0, moves[event.key]))); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(options[active]); }
    else if (event.key === "Escape") { event.preventDefault(); setOpen(false); button.current?.focus(); }
    else if (event.key === "Tab") setOpen(false);
  };

  return (
    <div ref={root} style={{ position: "relative", flexShrink: 0 }}>
      <button
        ref={button} type="button" className="ga-select" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined}
        aria-label={`Period: ${label(value)}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); show(); } }}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 10px 0 12px", borderRadius: 8, border: "1px solid var(--ga-border-strong)", background: "transparent", color: "inherit", font: "inherit", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
      >
        {label(value)}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--ga-muted)", rotate: open ? "180deg" : "0deg", transition: "rotate 200ms cubic-bezier(.2,0,0,1)" }}><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <ul
          ref={list} id={id} role="listbox" tabIndex={-1} aria-label="Period" aria-activedescendant={`${id}-${active}`} className="ga-listbox" onKeyDown={onKeyDown}
          style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 30, minWidth: 168, maxHeight: 280, overflowY: "auto", margin: 0, padding: 4, listStyle: "none", borderRadius: 10, border: "1px solid var(--ga-border-strong)", background: dark ? "#1b1a19" : "#ffffff", boxShadow: dark ? "0 16px 40px -8px #000000b3" : "0 12px 32px -8px #00000040, 0 2px 6px #00000014" }}
        >
          {options.map((period, index) => (
            <li
              key={period} id={`${id}-${index}`} data-index={index} role="option" aria-selected={period === value}
              onPointerMove={() => setActive(index)} onClick={() => choose(period)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "7px 8px 7px 10px", borderRadius: 6, fontSize: 13, cursor: "default", background: index === active ? "var(--ga-hover)" : "transparent" }}
            >
              {label(period)}
              {period === value && <Check />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const STYLES = `
.github-activity{container-type:inline-size}
.github-activity[data-fit]{max-width:var(--ga-fit-max)}
@supports (width:round(down,10px,1px)){.github-activity[data-fit]{max-width:min(var(--ga-fit-max),round(down,100% - var(--ga-fit-gutter) + var(--ga-fit-gap),var(--ga-fit-step)) - var(--ga-fit-gap) + var(--ga-fit-gutter))}}
.github-activity .heatmap{--heatmap-label:var(--ga-muted)}
.github-activity .heatmap__row-labels,.github-activity .heatmap__column-label,.github-activity .heatmap__legend{font-size:11px}
.github-activity .heatmap__legend:not(.heatmap3d__legend){justify-content:flex-end}
.github-activity .heatmap3d__scene{height:340px}
.ga-select{transition:background-color 150ms ease-out}
.ga-select:hover,.ga-select[aria-expanded="true"]{background:var(--ga-hover)!important}
.ga-select:focus-visible,.ga-listbox:focus-visible{outline:2px solid var(--ga-muted);outline-offset:2px}
.ga-listbox{animation:ga-pop 160ms cubic-bezier(.2,0,0,1)}
@keyframes ga-pop{from{opacity:0;transform:translateY(-4px) scale(.97)}}
.ga-stats[data-layout="row"]>div+div{border-left:1px solid var(--ga-border);padding-left:24px}
@container (max-width:620px){
  .ga-stats[data-layout="row"],.ga-stats[data-layout="cards"]{grid-template-columns:repeat(2,minmax(0,1fr))!important;row-gap:20px!important}
  .ga-stats[data-layout="cards"]{row-gap:8px!important}
  .ga-stats[data-layout="row"]>div:nth-child(odd){border-left:0;padding-left:0}
  .github-activity .heatmap3d__scene{height:260px}
}
@media (prefers-reduced-motion:reduce){.ga-listbox{animation:none}}`;

export type GithubActivityProps = {
  contributions: readonly Contribution[];
  /** Latest day to show. Defaults to the newest day in `contributions`. */
  to?: string;
  username?: string;
  theme?: "dark" | "light";
  colors?: readonly string[];
  empty?: string;
  mode?: ActivityMode;
  /** 2D cell shape. */
  shape?: HeatmapShape;
  /** 3D look. */
  blocks?: ActivityBlocks;
  /** Controlled period. Leave unset and the built-in selector manages it. */
  period?: ActivityPeriod;
  onPeriodChange?: (period: ActivityPeriod) => void;
  stats?: StatsLayout;
  font?: StatsFont;
  /** Draws stat figures in the palette's strongest colour. */
  tint?: boolean;
  display?: Partial<ActivityDisplay>;
  showStats?: boolean;
  compact?: boolean;
};

/** Data-driven view: pass daily counts from GitHub or your own backend. */
export function GithubActivity({ contributions, to: toProp, username, theme = THEME, colors = COLORS, empty = EMPTY, mode = MODE, shape = SHAPE, blocks = BLOCKS, period: periodProp, onPeriodChange, stats: layout = STATS, font = FONT, tint = TINT, display: displayProp, showStats = true, compact = false }: GithubActivityProps) {
  const display = { ...DISPLAY, ...displayProp };
  const to = toProp ?? (contributions.reduce((latest, day) => (day.date > latest ? day.date : latest), "") || today());
  const years = useMemo(() => activityYears(contributions, to), [contributions, to]);
  const [ownPeriod, setOwnPeriod] = useState<ActivityPeriod>("last");
  const requested = periodProp ?? ownPeriod;
  const period = compact || (requested !== "last" && !years.includes(requested)) ? "last" : requested;
  const setPeriod = (next: ActivityPeriod) => { setOwnPeriod(next); onPeriodChange?.(next); };
  const range = useMemo(() => periodRange(contributions, period, to), [contributions, period, to]);
  const values = useMemo<CalendarDay[]>(() => range.days.map(day => ({ date: day.date, value: day.count })), [range.days]);
  const stats = useMemo(() => activityStats(range.days), [range.days]);
  const [camera, setCamera] = useState<Heatmap3DCamera>({ yaw: -18, pitch: 38, zoom: 1 });

  const dark = theme === "dark";
  const ink = dark ? "#f4f3f0" : "#181817";
  const muted = dark ? "#a6a39c" : "#66635e";
  const border = dark ? "#ffffff14" : "#00000012";
  const accent = colors[colors.length - 1] ?? ink;
  const figure = tint ? accent : ink;
  const round = shape === "circle" || shape === "ring";
  const format = (value: number) => value.toLocaleString("en-US");
  const short = (date: string, year = false) => new Date(date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: year ? "numeric" : undefined, timeZone: "UTC" });
  const counts = display.counts && mode === "2d";
  const grid = counts ? GRID.counts : GRID.plain;
  // In 2D the whole view is only as wide as its calendar, rounded down to whole
  // weeks in a narrower container, so the header, the year selector, the
  // legend, and the stats line up with the grid rather than the container.
  const first = new Date(range.from + "T00:00:00Z");
  const columns = Math.ceil((first.getUTCDay() + (Date.parse(range.to + "T00:00:00Z") - first.getTime()) / DAY_MS + 1) / 7);
  const gutter = display.weekdays ? WEEKDAY_GUTTER : 0;
  const fit = mode === "2d" && !compact
    ? { "--ga-fit-max": `${columns * (grid.cell + grid.gap) - grid.gap + gutter}px`, "--ga-fit-step": `${grid.cell + grid.gap}px`, "--ga-fit-gap": `${grid.gap}px`, "--ga-fit-gutter": `${gutter}px`, marginInline: "auto" }
    : null;
  const statsOn = showStats && !compact && layout !== "none";
  const within = period === "last" ? "in the last year" : `in ${period}`;
  // A trailing year fits its container: as many weeks as fit, up to 53, and
  // below 27 it scrolls from the latest week. A calendar year is an exact range.
  const span = period === "last" ? { to, weeks: compact ? WEEKS : { min: 27, max: WEEKS } } : { from: range.from, to: range.to };
  const common = {
    values, colors, emptyColor: empty, weekStart: 0 as const,
    showMonthLabels: display.months && !compact, showLegend: display.legend && !compact, unitLabel: "contributions",
    "data-heatmap-theme": theme,
    ariaLabel: username ? `GitHub contributions for ${username}, ${within}` : `Sample contribution calendar, ${within}`,
    tooltip: (day: CalendarDay) => day.known === false ? `No data for ${day.date}` : `${format(day.value)} contributions on ${short(day.date, true)}`,
  };

  const items = [
    { label: "Contributions", short: "contributions", value: stats.total, meta: within[0].toUpperCase() + within.slice(1) },
    { label: "Active days", short: "active days", value: stats.activeDays, meta: `${stats.dayCount ? Math.round((stats.activeDays / stats.dayCount) * 100) : 0}% of days` },
    { label: "Longest streak", short: "day streak", value: stats.longestStreak, unit: "days", meta: stats.longestStreak ? `${short(stats.streakFrom)} – ${short(stats.streakTo)}` : "No streak yet" },
    { label: "Best day", short: "on best day", value: stats.peak, meta: stats.peakDate ? short(stats.peakDate, true) : "No activity yet" },
  ];
  const figureStyle = (size: number): CSSProperties => ({
    margin: 0, color: figure, fontSize: size, lineHeight: 1, fontVariantNumeric: "tabular-nums",
    ...(font === "mono"
      ? { fontFamily: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace', fontWeight: 500, letterSpacing: "-0.03em" }
      : { fontWeight: 560, letterSpacing: "-0.045em" }),
  });
  const renderFigure = (value: number, size: number, cell: number) => font === "pixel"
    ? <PixelNumber text={format(value)} cell={cell} on={figure} off={empty} round={round} />
    : <span style={figureStyle(size)}>{format(value)}</span>;
  const block = BLOCK_STYLES[blocks];

  return (
    <div className="github-activity" data-mode={mode} data-fit={fit ? "" : undefined} style={{ "--ga-muted": muted, "--ga-border": border, "--ga-border-strong": dark ? "#ffffff1f" : "#0000001a", "--ga-hover": dark ? "#ffffff0f" : "#0000000a", color: ink, minWidth: 0, width: "100%", fontFamily: "inherit", ...fit } as CSSProperties}>
      <style>{STYLES}</style>
      {(display.header || display.year) && !compact && (
        <div className="ga-header" style={{ display: "flex", alignItems: "center", justifyContent: display.header ? "space-between" : "flex-end", gap: 16, marginBottom: 4 }}>
          {display.header && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              {username
                ? <img src={`https://github.com/${username}.png?size=64`} alt="" width={32} height={32} style={{ flexShrink: 0, borderRadius: 999, boxShadow: `0 0 0 1px ${border}` }} />
                : <span aria-hidden="true" style={{ display: "grid", flexShrink: 0, gridTemplateColumns: "repeat(2, 6px)", gap: 2, padding: 8, borderRadius: 999, boxShadow: `0 0 0 1px ${border}` }}>{colors.slice(-4).map(color => <i key={color} style={{ width: 6, height: 6, borderRadius: round ? 99 : 2, background: color }} />)}</span>}
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 550, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {username ? <a className="ph-no-capture" href={`https://github.com/${username}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>@{username}</a> : "Contribution activity"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, lineHeight: 1.4, color: muted, textWrap: "pretty" }}>{format(stats.total)} contributions {within}</p>
              </div>
            </div>
          )}
          {display.year && <PeriodSelect value={period} years={years} onChange={setPeriod} dark={dark} />}
        </div>
      )}
      <div className="github-activity-scroll" style={{ padding: compact ? "36px 0 10px" : "40px 0 18px" }}>
        <div style={{ display: "flex", justifyContent: "center", minWidth: 0 }}>
          {mode === "3d" ? (
            <CalendarHeatmap3D {...common} {...span} weeks={WEEKS} theme={dark ? "night" : "color"} blockStyle={block.blockStyle} shape={block.shape} maxHeight={50} yaw={camera.yaw} pitch={camera.pitch} zoom={camera.zoom} onCameraChange={setCamera} animation="none" interactive={!compact} showControls={!compact} style={{ width: "100%" }} />
          ) : (
            <CalendarHeatmap
              {...common}
              {...span}
              style={{ width: compact ? undefined : "100%" }}
              showWeekdayLabels={display.weekdays && !compact}
              shape={shape}
              cellSize={compact ? 7 : grid.cell}
              gap={compact ? 2 : grid.gap}
              cellContent={counts ? cell => cell.known && cell.value > 0 ? <span style={{ fontSize: cell.value > 99 ? 6 : 8, color: cell.level >= 3 ? (dark ? "#1a1917" : "#ffffff") : ink }}>{cell.value}</span> : null : undefined}
            />
          )}
        </div>
      </div>
      {statsOn && layout === "inline" && (
        <dl className="ga-stats" data-layout="inline" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 22px", margin: "6px 0 0", padding: "16px 0 2px", borderTop: `1px solid ${border}` }}>
          {items.map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <dd style={{ margin: 0 }}>{renderFigure(item.value, 15, 2.4)}</dd>
              <dt style={{ fontSize: 13, color: muted }}>{item.short}</dt>
            </div>
          ))}
        </dl>
      )}
      {statsOn && layout !== "inline" && (
        <dl className="ga-stats" data-layout={layout} style={layout === "cards"
          ? { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, margin: "6px 0 0" }
          : { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 24, margin: "6px 0 0", padding: "22px 0 2px", borderTop: `1px solid ${border}` }}>
          {items.map((item, index) => (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0, ...(layout === "cards" ? { padding: "14px 16px 15px", borderRadius: 12, background: dark ? "#ffffff06" : "#0000000a", boxShadow: `inset 0 0 0 1px ${border}` } : null) }}>
              <dt style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12, color: muted }}>
                {item.label}
                {layout === "cards" && <i aria-hidden="true" style={{ width: 8, height: 8, flexShrink: 0, borderRadius: round ? 99 : 2, background: colors[Math.min(index, colors.length - 1)] }} />}
              </dt>
              <dd style={{ display: "flex", alignItems: "flex-end", gap: 6, margin: 0, minHeight: 30 }}>
                {renderFigure(item.value, layout === "cards" ? 26 : 30, layout === "cards" ? 4.4 : 5)}
                {item.unit && <span style={{ fontSize: 12, color: muted, lineHeight: 1.1 }}>{item.unit}</span>}
              </dd>
              <dd style={{ margin: 0, fontSize: 12, color: muted, opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.meta}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/** Drop-in username widget. For controlled data, use GithubActivity instead. */
export default function GithubProfile({ username, ...props }: Omit<GithubActivityProps, "contributions" | "to"> & { username: string }) {
  const [result, setResult] = useState<{ username: string; days: Contribution[] } | null>(null);
  const [error, setError] = useState<{ username: string; message: string } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    const timeout = setTimeout(() => {
      controller.abort();
      setError({ username, message: "The request timed out. Please try again." });
    }, 15000);
    fetchGithubContributions(username, controller.signal)
      .then(days => { if (!controller.signal.aborted) setResult({ username, days }); })
      .catch(reason => { if (reason?.name !== "AbortError") setError({ username, message: reason instanceof Error ? reason.message : "Unable to load contributions." }); })
      .finally(() => clearTimeout(timeout));
    return () => { controller.abort(); clearTimeout(timeout); };
  }, [username]);
  if (error?.username === username && result?.username !== username) return <p role="alert">{error.message}</p>;
  if (!result || result.username !== username) return <p role="status">Loading contributions…</p>;
  return <GithubActivity {...props} username={username} contributions={result.days} to={result.days[result.days.length - 1].date} />;
}
