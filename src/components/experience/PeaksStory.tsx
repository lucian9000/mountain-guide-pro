import { useRef, useState } from "react";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const peaks = [
  "Signal Hill",
  "Lion’s Head",
  "Maclear’s Beacon",
  "Grootkop",
  "Judas Peak",
  "Little Lion’s Head",
  "Suther Peak",
  "Chapman’s Peak",
  "Noordhoek Peak",
  "Muizenberg Peak",
  "Constantia Berg",
  "Klassen’s Kop",
  "Devil’s Peak",
];
const line =
  "M0 165 L40 130 L70 155 L112 58 L140 110 L165 130 L215 22 L245 75 L275 55 L300 95 L330 63 L365 123 L400 158 L435 111 L470 149 L510 78 L550 140 L585 95 L620 131 L660 40 L700 111 L737 85 L775 155 L810 114 L845 150 L890 35 L930 120 L975 130 L1020 45 L1080 165";

export default function PeaksStory() {
  const [selected, setSelected] = useState(0);
  const scope = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".ex-peak-trace",
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: scope.current,
              start: "top 80%",
              end: "bottom 65%",
              scrub: 0.7,
            },
          },
        );
        gsap.from(".ex-peaks-number", {
          y: 90,
          opacity: 0.2,
          duration: 1.1,
          scrollTrigger: {
            trigger: scope.current,
            start: "top 85%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
  return (
    <section className="ex-peaks" id="challenge" ref={scope}>
      <img
        className="ex-peaks-photo"
        src="/experience/plateau.webp"
        alt="Rugged mountain terrain on the Cape Peninsula"
        loading="lazy"
      />
      <div className="ex-peaks-content ex-section">
        <span className="ex-eyebrow">THE SIGNATURE CHALLENGE</span>
        <div className="ex-peaks-heading">
          <div className="ex-peaks-number" aria-hidden="true">
            13<span>PEAKS</span>
          </div>
          <div>
            <h2>
              One peninsula.
              <br />
              <em>Everything you’ve got.</em>
            </h2>
            <p>
              A journey across the spine of the Cape. Thirteen summits,
              relentless climbs, and a perspective you earn one step at a time.
            </p>
            <a
              className="ex-button ex-button--light"
              href="https://wa.me/27671301536?text=Hi%20Ernest%2C%20I%27d%20like%20to%20plan%20the%2013%20Peaks%20Challenge."
              target="_blank"
              rel="noopener noreferrer"
            >
              Plan your challenge <ArrowUpRight size={19} />
            </a>
          </div>
        </div>
        <div className="ex-peaks-facts">
          <span>
            <strong>±106</strong> KM OF TRAIL
          </span>
          <span>
            <strong>±6,300</strong> M VERTICAL GAIN
          </span>
          <span>
            <strong>YOUR</strong> PACE &amp; PLAN
          </span>
        </div>
        <div className="ex-profile" aria-hidden="true">
          <svg viewBox="0 0 1080 185" preserveAspectRatio="none">
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity=".25"
            />
            <path
              className="ex-peak-trace"
              d={line}
              pathLength="1"
              strokeDasharray="1"
              stroke="var(--ex-cyan)"
              fill="none"
              strokeWidth="2"
            />
          </svg>
          <span>ILLUSTRATED TERRAIN · NOT A NAVIGATION MAP</span>
        </div>
        <div className="ex-peak-browser">
          <span className="ex-eyebrow">EXPLORE THE SUMMITS</span>
          <div className="ex-peak-selected" aria-live="polite">
            <span>{String(selected + 1).padStart(2, "0")} / 13</span>
            <motion.h3
              key={selected}
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {peaks[selected]}
            </motion.h3>
          </div>
          <div className="ex-peak-controls">
            <button
              aria-label="Previous summit"
              disabled={selected === 0}
              onClick={() => setSelected((n) => n - 1)}
            >
              <ArrowLeft size={20} />
            </button>
            <button
              aria-label="Next summit"
              disabled={selected === 12}
              onClick={() => setSelected((n) => n + 1)}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="ex-peak-dots" role="group" aria-label="Choose a summit">
          {peaks.map((peak, i) => (
            <button
              key={peak}
              aria-label={peak}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
