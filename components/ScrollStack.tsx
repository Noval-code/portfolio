"use client";

// Adapted from React Bits ScrollStack (MIT License, https://reactbits.dev)
// Ported to TypeScript. Two adaptations for this site:
// 1. The window-scroll path listens to the page's existing Lenis-driven scroll
//    instead of creating a second Lenis instance, which would hijack wheel
//    events twice.
// 2. Card offsets are measured from layout (offsetTop chain) and cached
//    instead of getBoundingClientRect per frame, because rect includes the
//    component's own transforms and feeds back into itself, making the cards
//    jitter under smooth scrolling.

import { useCallback, useLayoutEffect, useRef, type ReactNode } from "react";

type ScrollStackProps = {
  children?: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
  onStackComplete?: () => void;
};

type CardTransform = {
  translateY: number;
  scale: number;
  rotation: number;
  blur: number;
};

export const ScrollStackItem = ({
  children,
  itemClassName = "",
}: {
  children?: ReactNode;
  itemClassName?: string;
}) => <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>;

const getLayoutTop = (element: HTMLElement) => {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
};

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  onStackComplete,
}: ScrollStackProps) {
  const stackCompletedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const offsetsRef = useRef<number[]>([]);
  const endOffsetRef = useRef(0);
  const lastTransformsRef = useRef(new Map<number, CardTransform>());
  const rafRef = useRef(0);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string, containerHeight: number) => {
    if (value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }, []);

  const measureOffsets = useCallback(() => {
    offsetsRef.current = cardsRef.current.map((card) => (card ? getLayoutTop(card) : 0));
    const endElement = rootRef.current?.querySelector<HTMLElement>(".scroll-stack-end");
    endOffsetRef.current = endElement ? getLayoutTop(endElement) : 0;
  }, []);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length) return;

    // Respect users who prefer reduced motion: no pinning/scaling, plain stack.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        card.style.transform = "";
        card.style.filter = "";
      });
      lastTransformsRef.current.clear();
      return;
    }

    const scrollTop = window.scrollY;
    const containerHeight = window.innerHeight;
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    const endElementTop = endOffsetRef.current;
    const offsets = offsetsRef.current;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = offsets[i] ?? 0;
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jTriggerStart = (offsets[j] ?? 0) - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      // Quantize to coarse steps so sub-pixel style writes don't shimmer.
      const newTransform: CardTransform = {
        translateY: Math.round(translateY * 2) / 2,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 2) / 2,
        blur: Math.round(blur * 2) / 2,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.25 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.25 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.25;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "";

        card.style.transform = transform;
        card.style.filter = filter;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage,
  ]);

  // Coalesce scroll/resize bursts into a single style write per frame.
  // Writing transform/filter on every raw scroll event (esp. under Lenis
  // smooth scroll) is what made the cards vibrate.
  const requestUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const cards = Array.from(root?.querySelectorAll<HTMLDivElement>(".scroll-stack-card") ?? []);

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
    });

    const remeasure = () => {
      measureOffsets();
      requestUpdate();
    };

    measureOffsets();
    requestUpdate();

    // Layout can shift after mount: webfonts, images, language toggle
    // (EN/ID changes text length), or any content change. Without
    // re-measuring, pin math uses stale offsets and cards jump.
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && root
        ? new ResizeObserver(remeasure)
        : null;
    resizeObserver?.observe(root as HTMLElement);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(remeasure).catch(() => {});
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", remeasure);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("load", remeasure);
      resizeObserver?.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    measureOffsets,
    requestUpdate,
  ]);

  return (
    <div ref={rootRef} className={`scroll-stack-scroller ${className}`.trim()}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
}
