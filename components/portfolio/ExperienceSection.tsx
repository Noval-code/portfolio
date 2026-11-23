"use client";

import { useState } from "react";
import ShinyText from "../ShinyText";

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  points?: string[];
  description?: string;
  stack: string[];
}

interface ExperienceSectionProps {
  kicker: string;
  title: string;
  intro: string;
  experience: ExperienceItem[];
}

export default function ExperienceSection({
  kicker,
  title,
  intro,
  experience,
}: ExperienceSectionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(
    () => new Set(experience.length > 0 ? [0] : []),
  );

  const toggle = (index: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section id="experience" className="section experience">
      <div className="experience-heading reveal">
        <ShinyText
          text={kicker}
          className="experience-work-history"
          speed={4.5}
          color="rgba(176, 182, 191, 0.72)"
          shineColor="rgba(255, 255, 255, 0.95)"
          spread={88}
          yoyo
          delay={0.3}
        />
        <h2 className="experience-title">{title}</h2>
        <p className="experience-intro">{intro}</p>
      </div>
      <div className="experience-layout">
        <div className="experience-animated-list">
          <div className="scroll-list">
            {experience.map((item, index) => {
              const points = item.points ?? (item.description ? [item.description] : []);
              const isOpen = openIndexes.has(index);

              return (
                <div
                  className={`item${isOpen ? " selected" : ""}`}
                  key={item.company}
                >
                  <button
                    type="button"
                    className="experience-item-toggle"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="experience-item-content">
                      <span className="experience-item-head">
                        <span className="experience-list-company">{item.company}</span>
                        <span className="experience-list-period">{item.period}</span>
                      </span>
                      <span className="experience-list-role">{item.role}</span>
                    </span>
                    <span className="experience-item-chevron" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && points.length > 0 && (
                    <ul className="experience-item-points">
                      {points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
