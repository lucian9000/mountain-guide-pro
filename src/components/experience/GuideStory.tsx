import { useRef } from "react";
import { ArrowUpRight, ShieldCheck, Leaf, Mountain } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import portrait from "@/assets/meet-ernest.webp";

gsap.registerPlugin(useGSAP, ScrollTrigger);
export default function GuideStory() {
  const scope = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".ex-guide-image img", {
          scale: 1.12,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.from(".ex-guide-copy > *", {
          y: 25,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.7,
          scrollTrigger: {
            trigger: ".ex-guide-copy",
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
    <section id="about" className="ex-guide ex-section" ref={scope}>
      <div className="ex-guide-image">
        <img
          src={portrait}
          alt="Ernest Carrick out in the Cape mountains"
          loading="lazy"
        />
        <div className="ex-guide-caption">
          <span>YOUR GUIDE</span>
          <strong>Ernest Carrick</strong>
          <Mountain size={23} />
        </div>
      </div>
      <div className="ex-guide-copy">
        <span className="ex-eyebrow">
          <span /> GOOD COMPANY. GREAT HEIGHTS.
        </span>
        <h2>
          The mountain
          <br />
          has a story.
          <br />
          <em>I’ll take you there.</em>
        </h2>
        <p>
          Meet Ernest. Mountain guide, personal trainer, and the person who’ll
          stop to show you the fynbos everyone else walked past.
        </p>
        <p>
          From your first scramble to your next big challenge, explore the
          Western Cape with local knowledge, thoughtful preparation, and safety
          at every step.
        </p>
        <div className="ex-guide-proof">
          <span>
            <ShieldCheck size={20} /> CATHSSETA &amp; AQN accredited
          </span>
          <span>
            <Leaf size={20} /> Cape fynbos &amp; local knowledge
          </span>
        </div>
        <a
          className="ex-text-link"
          href="https://wa.me/27671301536"
          target="_blank"
          rel="noopener noreferrer"
        >
          Meet your guide. Start a conversation. <ArrowUpRight size={18} />
        </a>
      </div>
    </section>
  );
}
