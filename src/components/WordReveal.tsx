"use client";

import React from "react";

interface WordRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  staggerDelay?: number;
  initialDelay?: number;
}

export default function WordReveal({
  text,
  className = "",
  as: Component = "span",
  staggerDelay = 0.06,
  initialDelay = 0.05,
}: WordRevealProps) {
  const words = text.split(" ");

  return (
    <Component className={className}>
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <span
            className="zoho-word-span"
            style={{
              animationDelay: `${initialDelay + index * staggerDelay}s`,
            }}
          >
            {word}
          </span>
          {index < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </Component>
  );
}
