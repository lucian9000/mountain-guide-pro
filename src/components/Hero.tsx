import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

// Served from /public at a stable URL so index.html can <link rel="preload">
// it — it's the LCP element on every first visit (cache-busting loss accepted).
const heroImage = "/hero-mountain.webp";

// Served statically from /public — streamed via range requests, NOT bundled
// into the JS. The static image above is always the poster (instant paint /
// LCP), so the page never waits on the video.
const HERO_VIDEO = "/hero-section.mp4";

interface HeroProps {
  onOpenChat: () => void;
}

const Hero = ({ onOpenChat }: HeroProps) => {
  // Background video runs on all screen sizes (it's only ~0.6 MB, cheaper
  // than a card image). Reduced-motion visitors keep the static image and
  // download zero video bytes.
  const [useVideo, setUseVideo] = useState(false);

  useEffect(() => {
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (motionOk) setUseVideo(true);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-[100svh] min-h-[560px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {useVideo ? (
          <video
            className="w-full h-full object-cover"
            poster={heroImage}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        ) : (
          <img
            src={heroImage}
            alt="Cape Town mountains at golden hour"
            width={1600}
            height={1200}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover animate-cinematic-pan"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background/95" />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in-up">

        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground mb-5 md:mb-6 leading-none tracking-wider uppercase">
          Ascend Your
          <br />
          <span className="text-gradient-cyan">Limits</span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 font-sans">
          Professional Mountain Guiding & Elite Fitness Training
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
          <button
            onClick={() => scrollTo("expeditions")}
            className="border-2 border-foreground/30 text-foreground hover:border-accent hover:text-accent px-8 py-3.5 md:py-4 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-all duration-300"
          >
            View Routes
          </button>
          <button
            onClick={onOpenChat}
            className="bg-accent hover:bg-cyan-hover text-accent-foreground px-8 py-3.5 md:py-4 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            Start Your Journey <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll indicator — p-2 around the 28px chevron gives a 44px hit target */}
      <button
        onClick={() => scrollTo("services")}
        aria-label="Scroll to services"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 p-2 text-foreground/50 hover:text-accent transition-colors animate-bounce"
      >
        <ChevronDown className="w-7 h-7" aria-hidden="true" />
      </button>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
