"use client";

import { useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";

export type Language = "en" | "id";

type Ripple = { id: number; x: number; y: number; size: number };

const LABELS: Record<Language, string> = { en: "EN", id: "ID" };
const LANGUAGES: Language[] = ["en", "id"];

function rippleAtPoint(element: HTMLButtonElement, clientX: number, clientY: number): Ripple {
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2.2;

  return {
    id: Date.now() + Math.random(),
    x: clientX - rect.left,
    y: clientY - rect.top,
    size,
  };
}

export default function LangToggle({
  language,
  onChange,
}: {
  language: Language;
  onChange: (language: Language) => void;
}) {
  const [ripples, setRipples] = useState<Partial<Record<Language, Ripple>>>({});

  const addRipple = (value: Language, ripple: Ripple) => {
    setRipples((current) => ({ ...current, [value]: ripple }));
  };

  const clearRipple = (value: Language) => {
    setRipples((current) => {
      if (!(value in current)) return current;
      const next = { ...current };
      delete next[value];
      return next;
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, value: Language) => {
    addRipple(value, rippleAtPoint(event.currentTarget, event.clientX, event.clientY));
  };

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>, value: Language) => {
    // Keyboard activation has no pointer position; ripple from the centre.
    if (event.detail === 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      addRipple(value, rippleAtPoint(event.currentTarget, rect.left + rect.width / 2, rect.top + rect.height / 2));
    }
    onChange(value);
  };

  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {LANGUAGES.map((value) => {
        const ripple = ripples[value];

        return (
          <button
            key={value}
            type="button"
            className={`lang-option${language === value ? " is-active" : ""}`}
            aria-pressed={language === value}
            onPointerDown={(event) => handlePointerDown(event, value)}
            onClick={(event) => handleClick(event, value)}
          >
            {ripple && (
              <span
                key={ripple.id}
                className="lang-ripple"
                style={{
                  width: `${ripple.size}px`,
                  height: `${ripple.size}px`,
                  left: `${ripple.x - ripple.size / 2}px`,
                  top: `${ripple.y - ripple.size / 2}px`,
                }}
                onAnimationEnd={() => clearRipple(value)}
                aria-hidden="true"
              />
            )}
            <span className="lang-option-label">{LABELS[value]}</span>
          </button>
        );
      })}
    </div>
  );
}
