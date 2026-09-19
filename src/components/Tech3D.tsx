"use client";

import { useEffect, useRef, useState } from "react";
import "./Tech3D.css";

const securityItems = [
  {
    title: "Threat Detection",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="11" r="3" />
      </svg>
    ),
    position: "left",
  },
  {
    title: "Data Protection",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    position: "right",
  },
  {
    title: "Identity Management",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    position: "bottom-left",
  },
  {
    title: "Endpoint Security",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    position: "bottom-right",
  },
];

export default function Tech3D() {
  const [isProtectionOn, setIsProtectionOn] = useState(true);
  const sceneRef = useRef<HTMLDivElement>(null);
  const mouseAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = scene.getBoundingClientRect();

      targetX =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2;

      targetY =
        ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      scene.style.setProperty("--mouse-x", String(currentX));
      scene.style.setProperty("--mouse-y", String(currentY));

      mouseAnimationRef.current =
        requestAnimationFrame(animate);
    };

    scene.addEventListener("mousemove", handleMouseMove);
    scene.addEventListener("mouseleave", handleMouseLeave);

    mouseAnimationRef.current =
      requestAnimationFrame(animate);

    return () => {
      scene.removeEventListener("mousemove", handleMouseMove);
      scene.removeEventListener("mouseleave", handleMouseLeave);

      if (mouseAnimationRef.current !== null) {
        cancelAnimationFrame(mouseAnimationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className={`security-scene ${isProtectionOn ? "powered-on" : ""}`}
    >
      {/* Ambient background */}
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />

      {/* Background grid */}
      <div className="tech-grid" />

      {/* Particles */}
      <div className="particles">
        {Array.from({ length: 22 }).map((_, index) => (
          <span
            key={index}
            className={`particle particle-${index + 1}`}
          />
        ))}
      </div>

      {/* Orbit rings */}
      <div className="orbit-system">
        <div className="orbit orbit-one">
          <span className="orbit-dot" />
        </div>

        <div className="orbit orbit-two">
          <span className="orbit-dot" />
        </div>

        <div className="orbit orbit-three">
          <span className="orbit-dot" />
        </div>
      </div>

      <div className="scene-content">

        {/* =========================
            SERVER RACK
        ========================== */}

        <div className="server-area">
          <div className="server-shadow" />

          <div className="server-rack">

            <div className="server-top">
              <div className="server-top-light" />
            </div>

            {/* Server 1 */}
            <div className="server-unit">
              <div className="server-display">
                <span />
                <span />
                <span />
              </div>

              <div className="waveform-strip">
                <span className="wave-bar wave-bar-1" />
                <span className="wave-bar wave-bar-2" />
                <span className="wave-bar wave-bar-3" />
                <span className="wave-bar wave-bar-4" />
                <span className="wave-bar wave-bar-5" />
              </div>

              <div className="server-label">
                DATA
              </div>

              <div className="server-status">
                <i />
              </div>

              <div className="server-button" />
            </div>

            {/* Server 2 */}
            <div className="server-unit">
              <div className="server-display">
                <span />
                <span />
                <span />
              </div>

              <div className="waveform-strip">
                <span className="wave-bar wave-bar-2" />
                <span className="wave-bar wave-bar-4" />
                <span className="wave-bar wave-bar-1" />
                <span className="wave-bar wave-bar-5" />
                <span className="wave-bar wave-bar-3" />
              </div>

              <div className="server-label">
                CORE
              </div>

              <div className="server-status">
                <i />
              </div>

              <div className="server-button" />
            </div>

            {/* Server 3 */}
            <div className="server-unit">
              <div className="server-display">
                <span />
                <span />
                <span />
              </div>

              <div className="waveform-strip">
                <span className="wave-bar wave-bar-3" />
                <span className="wave-bar wave-bar-1" />
                <span className="wave-bar wave-bar-5" />
                <span className="wave-bar wave-bar-2" />
                <span className="wave-bar wave-bar-4" />
              </div>

              <div className="server-label">
                SECURE
              </div>

              <div className="server-status">
                <i />
              </div>

              <div className="server-button" />
            </div>

            <div className="server-bottom">
              <div className="server-bottom-light" />
            </div>
          </div>

          {/* Platform */}
          <div className="server-platform">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* =========================
            SECURITY FEATURES
        ========================== */}

        <div className="security-features">
          {securityItems.map((item) => (
            <div
              key={item.title}
              className={`security-card ${item.position}`}
            >
              <div className="security-card-icon">
                {item.icon}
              </div>

              <span>
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* =========================
            PROTECTION ON / OFF BUTTON
        ========================== */}

        {isProtectionOn ? (
          <button
            type="button"
            className="power-button power-button-online"
            onClick={() => setIsProtectionOn(false)}
            title="Click to turn Protection Off"
            aria-label="Protection On. Click to turn Protection Off."
          >
            <span className="online-dot" />

            <span className="power-text">
              PROTECTION ON
            </span>

            <span className="power-subtext">
              (CLICK FOR OFF)
            </span>
          </button>
        ) : (
          <button
            type="button"
            className="power-button"
            onClick={() => setIsProtectionOn(true)}
            title="Click to turn Protection On"
            aria-label="Protection Off. Click to turn Protection On."
          >
            <span className="power-icon">
              <span />
            </span>

            <span className="power-text">
              PROTECTION OFF
            </span>

            <span className="power-arrow">
              →
            </span>
          </button>
        )}

        {/* =========================
            TOP STATUS
        ========================== */}

        <div className="system-label">
          <span className={isProtectionOn ? "active" : ""} />
          {isProtectionOn ? "PROTECTION ON • ACTIVE" : "PROTECTION OFF • STANDBY"}
        </div>
      </div>
    </div>
  );
}