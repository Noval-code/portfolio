"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  CheckmarkCircle02Icon,
  ChevronDownIcon,
} from "@hugeicons/core-free-icons";
import "./ThoughtLine.css";

export type ThoughtLineGlyph = "sparkle" | "dot" | "none" | ReactNode;

export interface ThoughtLineProps {
  working?: boolean;
  steps?: string[];
  label?: string;
  doneLabel?: string;
  glyph?: ThoughtLineGlyph;
  fontSize?: number;
  breathPeriod?: number;
  breathDepth?: number;
  shimmer?: boolean;
  shimmerDuration?: number;
  settleDuration?: number;
  settleBlur?: number;
  collapsible?: boolean;
  collapseOnSettle?: boolean;
  showTimer?: boolean;
  elapsed?: number;
  settleAfter?: number;
  color?: string;
  glyphColor?: string;
  renderLabel?: (text: string, working: boolean) => ReactNode;
  onSettle?: (seconds: number) => void;
  className?: string;
  style?: CSSProperties;
}

function formatSeconds(s: number) {
  return `${s.toFixed(1)}s`;
}

export default function ThoughtLine({
  working = true,
  steps = [],
  label = "Thinking…",
  doneLabel = "",
  glyph = "sparkle",
  fontSize = 16,
  breathPeriod = 1.6,
  breathDepth = 0.45,
  shimmer = true,
  shimmerDuration = 1.8,
  settleDuration = 350,
  settleBlur = 2,
  collapsible = true,
  collapseOnSettle = true,
  showTimer = true,
  elapsed: elapsedProp,
  settleAfter = 0,
  color = "currentColor",
  glyphColor = "",
  renderLabel,
  onSettle,
  className = "",
  style,
}: ThoughtLineProps) {
  const [internalElapsed, setInternalElapsed] = useState(0);
  const [open, setOpen] = useState(true);
  const [settledOnce, setSettledOnce] = useState(false);
  const settledRef = useRef(false);
  const startRef = useRef<number | null>(null);
  const onSettleRef = useRef(onSettle);
  onSettleRef.current = onSettle;

  const elapsed = elapsedProp ?? internalElapsed;

  // Internal clock: runs while working, freezes on settle.
  useEffect(() => {
    if (elapsedProp !== undefined) return;
    if (!working) return;
    settledRef.current = false;
    setSettledOnce(false);
    startRef.current = performance.now();
    setInternalElapsed(0);
    let raf = 0;
    const tick = (now: number) => {
      if (startRef.current == null) return;
      setInternalElapsed((now - startRef.current) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [working, elapsedProp]);

  // Auto-settle after N seconds (optional).
  useEffect(() => {
    if (!settleAfter || !working) return;
    const t = window.setTimeout(() => {
      // Parent is expected to flip `working` to false; we just stop the clock
      // if they rely on settleAfter alone.
      cancelAnimationFrame(0);
    }, settleAfter * 1000);
    return () => window.clearTimeout(t);
  }, [settleAfter, working]);

  // Fire onSettle once per settle transition.
  useEffect(() => {
    if (working || settledRef.current) return;
    settledRef.current = true;
    setSettledOnce(true);
    if (collapseOnSettle) setOpen(false);
    onSettleRef.current?.(elapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [working]);

  const settledText = showTimer
    ? `${doneLabel || "Thought for"} ${formatSeconds(elapsed)}`
    : doneLabel || "Done thinking";

  const glyphNode = (() => {
    if (glyph === "none") return null;
    if (glyph === "dot") return <span className="tl-dot" aria-hidden="true" />;
    if (glyph === "sparkle")
      return (
        <HugeiconsIcon
          icon={SparklesIcon}
          size={fontSize + 2}
          strokeWidth={2}
          aria-hidden="true"
        />
      );
    return <>{glyph as ReactNode}</>;
  })();

  const visibleSteps = steps.slice(0, Math.max(steps.length, 0));
  const hasTrace = visibleSteps.length > 0;
  const canToggle = collapsible && hasTrace;

  const labelText = working ? label : settledText;

  return (
    <div
      className={`thought-line ${className}`}
      style={{ fontSize, color, ...style } as CSSProperties}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        className={`tl-row ${canToggle ? "is-toggle" : ""}`}
        onClick={() => canToggle && setOpen((o) => !o)}
        aria-expanded={canToggle ? open : undefined}
        disabled={!canToggle}
      >
        {glyphNode && (
          <motion.span
            className="tl-glyph"
            style={{ color: glyphColor || undefined }}
            animate={
              working
                ? { opacity: [1, Math.max(1 - breathDepth, 0.05), 1] }
                : { opacity: 0.55 }
            }
            transition={
              working
                ? { duration: breathPeriod, repeat: Infinity, ease: "easeInOut" }
                : { duration: settleDuration / 1000 }
            }
            aria-hidden="true"
          >
            {glyphNode}
          </motion.span>
        )}

        <span className="tl-label-wrap">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={working ? "working" : "settled"}
              className={`tl-label ${working && shimmer ? "tl-shimmer" : ""}`}
              style={
                {
                  "--tl-shimmer-duration": `${shimmerDuration}s`,
                  "--tl-settle-blur": `${settleBlur}px`,
                } as CSSProperties
              }
              initial={{ opacity: 0, filter: `blur(${settleBlur}px)`, y: 4 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: `blur(${settleBlur}px)`, y: -4 }}
              transition={{ duration: settleDuration / 1000, ease: "easeOut" }}
            >
              {renderLabel ? renderLabel(labelText, working) : labelText}
            </motion.span>
          </AnimatePresence>
          {working && showTimer && (
            <span className="tl-timer" aria-hidden="true">
              {formatSeconds(elapsed)}
            </span>
          )}
        </span>

        {canToggle && (
          <span className={`tl-chevron ${open ? "is-open" : ""}`} aria-hidden="true">
            <HugeiconsIcon icon={ChevronDownIcon} size={16} strokeWidth={2} />
          </span>
        )}
      </button>

      {hasTrace && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              className="tl-steps"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: Math.min(settleDuration / 1000, 0.35), ease: "easeInOut" }}
            >
              {visibleSteps.map((step, i) => {
                const isLast = i === visibleSteps.length - 1;
                const done = !working || !isLast;
                void settledOnce;
                return (
                  <motion.li
                    key={`${step}-${i}`}
                    className={`tl-step ${done ? "is-done" : "is-current"}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span className="tl-step-mark" aria-hidden="true">
                      {done ? (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={15}
                          strokeWidth={2}
                        />
                      ) : (
                        <motion.span
                          className="tl-step-dot"
                          animate={{ opacity: [1, 0.35, 1] }}
                          transition={{
                            duration: breathPeriod,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </span>
                    <span className="tl-step-text">{step}</span>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
