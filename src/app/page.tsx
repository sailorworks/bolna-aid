"use client";

import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="landing-root">
      {/* Background Video */}
      <video
        src="/Hero_video1.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="hero-video"
      />

      {/* Top Navigation Bar */}
      <header className="landing-header">
        <div className="brand">
          <span className="brand-dot"></span>
          <span className="brand-name font-data">BOLNA-AID</span>
        </div>
        <div className="header-status font-data">
          SYSTEM ACTIVE // v1.2.0
        </div>
      </header>

      {/* Hero Content (Centered) */}
      <main className="landing-main">
        <div className="hero-content-box">
          <div className="hero-badge font-data animate-slide-up stagger-1">
            CLINICAL CO-PILOT
          </div>
          <h1 className="hero-title animate-slide-up stagger-2">
            Hands-free triage.<br />
            Zero friction.
          </h1>
          <p className="hero-subtitle animate-slide-up stagger-3">
            Real-time audio intelligence for emergency care departments.
          </p>

          <div className="hero-actions animate-slide-up stagger-4">
            <a href="/triage" className="cta-button">
              <span>Launch Voice Agent</span>
              <ArrowRight size={16} className="cta-icon" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer / Partners & Hospitals */}
      <footer className="landing-footer animate-slide-up stagger-5">
        <div className="footer-inner">
          <span className="footer-label font-data">TRUSTED PARTNERS & HOSPITALS</span>
          <div className="logo-grid">
            <div className="logo-item">
              <span className="logo-prefix font-data">POWERED BY</span>
              <span className="logo-text">BOLNA</span>
            </div>
            <div className="logo-item">
              <span className="logo-prefix font-data">SYNTHESIS BY</span>
              <span className="logo-text">CARTESIA</span>
            </div>
            <div className="logo-divider"></div>
            <div className="logo-item">
              <span className="logo-text font-data">METRO ER</span>
            </div>
            <div className="logo-item">
              <span className="logo-text font-data">SACRED HEART</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .landing-root {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #ffffff; /* White background to match video base */
          color: #000000;
        }

        /* ── Hero Background Video ── */
        .hero-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
          pointer-events: none;
        }

        /* ── Content overlay to sit above the video ── */
        .landing-header,
        .landing-main,
        .landing-footer {
          position: relative;
          z-index: 2;
        }

        /* ── Header ── */
        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-5) var(--space-6);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .brand-dot {
          width: 6px;
          height: 6px;
          background: #000000;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
        }

        .brand-name {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #000000;
        }

        .header-status {
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          color: #555555;
        }

        /* ── Main content (Centered vertically & horizontally) ── */
        .landing-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 var(--space-6);
          margin-top: 10vh;
        }

        .hero-content-box {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-4);
          max-width: 720px;
          padding: var(--space-6) var(--space-8);
        }


        .hero-badge {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: #000000;
          border: 1px solid rgba(0, 0, 0, 0.6);
          background: rgba(255, 255, 255, 0.75);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          backdrop-filter: blur(4px);
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #000000;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          font-weight: 500;
          color: #222222;
          max-width: 520px;
          line-height: 1.5;
        }

        .hero-actions {
          margin-top: var(--space-3);
        }

        /* ── CTA Button (Pure Stark Monochromatic) ── */
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
          background: #000000;
          color: #ffffff;
          padding: 14px 28px;
          border-radius: 100px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .cta-button:hover {
          background: #222222;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
        }

        .cta-icon {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cta-button:hover .cta-icon {
          transform: translateX(4px);
        }

        /* ── Footer / Logos ── */
        .landing-footer {
          padding: var(--space-6);
          width: 100%;
        }

        .footer-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          padding-top: var(--space-4);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .footer-label {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: rgba(0, 0, 0, 0.5);
        }

        .logo-grid {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: var(--space-5);
        }

        .logo-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .logo-prefix {
          font-size: 0.5rem;
          letter-spacing: 0.08em;
          color: rgba(0, 0, 0, 0.5);
        }

        .logo-text {
          font-family: var(--font-display);
          font-weight: 850;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          color: #000000;
        }

        .logo-divider {
          width: 1px;
          height: 24px;
          background: rgba(0, 0, 0, 0.1);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .logo-grid {
            gap: var(--space-4);
          }
          .logo-divider {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
