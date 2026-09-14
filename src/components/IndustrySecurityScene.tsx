"use client";

import "./IndustrySecurityScene.css";

export default function IndustrySecurityScene() {
  return (
    <div className="cyber-security-scene">

      {/* Background glow */}
      <div className="cyber-bg-glow" />

      {/* Soft grid */}
      <div className="cyber-grid" />

      {/* Orbit rings */}
      <div className="cyber-orbit cyber-orbit-one" />
      <div className="cyber-orbit cyber-orbit-two" />
      <div className="cyber-orbit cyber-orbit-three" />

      {/* ================================
          CENTRAL SHIELD
      ================================= */}

      <div className="cyber-shield-wrap">

        <div className="cyber-shield-glow" />

        <div className="cyber-shield">

          <div className="cyber-shield-inner">

            <div className="shield-check">
              ✓
            </div>

          </div>

        </div>

      </div>


      {/* ================================
          ATTACK 1
      ================================= */}

      <div className="cyber-attack cyber-attack-one">

        <span className="attack-core" />

        <span className="attack-particle attack-particle-one" />
        <span className="attack-particle attack-particle-two" />
        <span className="attack-particle attack-particle-three" />

      </div>


      {/* ================================
          ATTACK 2
      ================================= */}

      <div className="cyber-attack cyber-attack-two">

        <span className="attack-core" />

        <span className="attack-particle attack-particle-one" />
        <span className="attack-particle attack-particle-two" />
        <span className="attack-particle attack-particle-three" />

      </div>


      {/* ================================
          ATTACK 3
      ================================= */}

      <div className="cyber-attack cyber-attack-three">

        <span className="attack-core" />

        <span className="attack-particle attack-particle-one" />
        <span className="attack-particle attack-particle-two" />
        <span className="attack-particle attack-particle-three" />

      </div>


      {/* ================================
          ATTACK 4
      ================================= */}

      <div className="cyber-attack cyber-attack-four">

        <span className="attack-core" />

        <span className="attack-particle attack-particle-one" />
        <span className="attack-particle attack-particle-two" />
        <span className="attack-particle attack-particle-three" />

      </div>


      {/* ================================
          BLOCK IMPACTS
      ================================= */}

      <div className="shield-impact impact-one" />
      <div className="shield-impact impact-two" />
      <div className="shield-impact impact-three" />
      <div className="shield-impact impact-four" />


      {/* ================================
          FLOATING SECURITY STATUS
      ================================= */}

      <div className="cyber-status">

        <span className="status-dot" />

        <div>
          <small>
            SECURITY
          </small>

          <strong>
            PROTECTED
          </strong>
        </div>

      </div>


      {/* ================================
          SMALL PARTICLES
      ================================= */}

      <div className="cyber-particles">

        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} />
        ))}

      </div>

    </div>
  );
}