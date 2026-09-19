"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in seconds (e.g., 0.1)
  direction?: "up" | "left" | "right" | "fade";
  threshold?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  threshold = 0.1,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = domRef.current;
    if (!element) return;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const getDirectionClass = () => {
    switch (direction) {
      case "left":
        return "zoho-slide-left";
      case "right":
        return "zoho-slide-right";
      case "fade":
      case "up":
      default:
        return "zoho-slide-up";
    }
  };

  return (
    <div
      ref={domRef}
      className={`${getDirectionClass()} ${isVisible ? "zoho-visible" : ""} ${className}`}
      style={{
        transitionDelay: delay > 0 ? `${delay}s` : undefined,
      }}
    >
      {children}
    </div>
  );
}
