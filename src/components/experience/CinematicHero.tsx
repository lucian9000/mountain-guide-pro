import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, Compass } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CinematicHero() {
  const scope = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".ex-hero-line > span", {
          yPercent: 105,
          duration: 1.15,
          stagger: 0.12,
          ease: "power4.out",
          clearProps: "transform",
        });
        gsap.from(".ex-hero-detail", {
          y: 14,
          autoAlpha: 0,
          duration: 0.65,
          delay: 0.55,
          stagger: 0.1,
          clearProps: "all",
        });
        gsap.to(".ex-hero-landscape", {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      className="ex-hero"
      id="top"
      aria-labelledby="hero-title"
    >
      <div className="ex-hero-landscape">
        <img
          src="/hero-mountain.webp"
          alt="Ernest above the Atlantic coast and Cape Town’s mountain ridges"
          width="1600"
          height="1200"
          {...({ fetchpriority: "high" } as Record<string, string>)}
        />
      </div>
      <div className="ex-hero-shade" />
      <div className="ex-hero-grid" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="ex-hero-content">
        <div className="ex-hero-topline ex-hero-detail">
          <span className="ex-eyebrow">
            <span /> CAPE TOWN. SOUTH AFRICA.
          </span>
          <span className="ex-coordinate">33°55′ S &nbsp; 18°25′ E</span>
        </div>
        <h1 id="hero-title">
          <span className="ex-hero-line">
            <span>BEYOND THE</span>
          </span>
          <span className="ex-hero-line ex-hero-line--outline">
            <span>EVERYDAY.</span>
          </span>
        </h1>
        <div className="ex-hero-bottom ex-hero-detail">
          <div>
            <p>Take the trail. Find your perspective.</p>
            <p className="ex-hero-sub">
              Guided mountain adventures &amp; personal training
              <br />
              with Ernest Carrick.
            </p>
            <Link to="/routes" className="ex-button">
              Find your adventure <ArrowUpRight size={20} />
            </Link>
          </div>
          <a href="#expeditions" className="ex-scroll">
            <span>SCROLL TO EXPLORE</span>
            <span className="ex-scroll-circle">
              <ArrowDown size={21} />
            </span>
          </a>
        </div>
      </div>
      <div className="ex-hero-footer">
        <span>
          <Compass size={16} /> LOCAL KNOWLEDGE. WILD PLACES.
        </span>
        <span>
          WESTERN CAPE &amp; BEYOND <ArrowUpRight size={15} />
        </span>
      </div>
    </section>
  );
}
