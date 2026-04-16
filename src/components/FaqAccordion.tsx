"use client";

import { useEffect, useRef, useState } from "react";
import type { FaqItem } from "@/data/faq";

function QuestionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function FaqRow({ faq, index }: { faq: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const answerId = `faq-answer-${index}`;

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div
      className={`faq-item${open ? " faq-open" : ""}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button
        className="faq-summary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={answerId}
      >
        <div className="faq-icon-wrap" aria-hidden="true"><QuestionIcon /></div>
        <h3>{faq.q}</h3>
        <span className={`faq-toggle${open ? " faq-toggle-open" : ""}`} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
      </button>
      <div
        id={answerId}
        className="faq-answer"
        role="region"
        aria-hidden={!open}
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className="faq-answer-inner">
          <p>{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

// Full accordion list — takes the static FAQ data from the server
// component and handles its own interactivity.
export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <>
      {faqs.map((faq, i) => (
        <FaqRow faq={faq} index={i} key={i} />
      ))}
    </>
  );
}
