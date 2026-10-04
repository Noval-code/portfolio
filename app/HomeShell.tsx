"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Portfolio from "./portfolio";
import InitialLoader from "../components/InitialLoader";
import type { PortfolioCms } from "../lib/sanity/projects";

export default function HomeShell({ cms }: { cms: PortfolioCms }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  return (
    <>
      <AnimatePresence>
        {loading && <InitialLoader key="loader" onDone={() => setLoading(false)} />}
      </AnimatePresence>
      {!loading && (
        <motion.div
          key="portfolio"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Portfolio cms={cms} />
        </motion.div>
      )}
    </>
  );
}
