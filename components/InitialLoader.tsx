"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import ThoughtLine from "./ThoughtLine";
import "./InitialLoader.css";

interface InitialLoaderProps {
  steps?: string[];
  label?: string;
  doneLabel?: string;
  stepInterval?: number;
  onDone?: () => void;
}

export default function InitialLoader({
  steps = ["Preparing content", "Loading assets", "Polishing the interface"],
  label = "Loading portfolio…",
  doneLabel = "Ready in",
  stepInterval = 350,
  onDone,
}: InitialLoaderProps) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [working, setWorking] = useState(true);
  const onDoneRef = useState(() => onDone)[0];

  useEffect(() => {
    const timers: number[] = [];
    // Reveal steps one by one.
    for (let i = 2; i <= steps.length; i++) {
      timers.push(
        window.setTimeout(() => setVisibleCount(i), (i - 1) * stepInterval)
      );
    }
    // Settle shortly after the last step appears.
    timers.push(
      window.setTimeout(
        () => setWorking(false),
        steps.length * stepInterval + 250
      )
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [steps.length, stepInterval]);

  return (
    <motion.div
      className="initial-loader"
      role="status"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <motion.div
        className="initial-loader-inner"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <ThoughtLine
          working={working}
          steps={steps.slice(0, visibleCount)}
          label={label}
          doneLabel={doneLabel}
          glyph="sparkle"
          fontSize={16}
          breathPeriod={1.6}
          breathDepth={0.45}
          settleDuration={350}
          settleBlur={2}
          collapsible
          collapseOnSettle={false}
          showTimer
          onSettle={() => {
            window.setTimeout(() => onDoneRef?.(), 350);
          }}
        />
        </motion.div>
    </motion.div>
  );
}
