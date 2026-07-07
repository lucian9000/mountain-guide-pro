import { MessageCircle } from "lucide-react";
import Reveal from "@/components/Reveal";

interface CTAProps {
  onOpenChat: () => void;
}

const CTASection = ({ onOpenChat }: CTAProps) => (
  <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
    <div className="absolute inset-0 bg-[image:var(--glow-cyan-top-right)]" />
    <div className="absolute inset-0 bg-[image:var(--glow-gold-bottom-left)]" />

    <Reveal className="container mx-auto px-4 relative z-10 text-center">
      <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">Get Started</span>
      <h2 className="font-heading text-3xl md:text-5xl font-black text-foreground mb-4 tracking-wider uppercase">
        Ready to Reach<br />the Summit?
      </h2>
      <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-10 max-w-lg mx-auto">
        Whether you're a first-time hiker or seasoned mountaineer, your next adventure starts here.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
        <a
          href="https://wa.me/27671301536?text=Hi!%20I'm%20interested%20in%20learning%20more%20about%20SummitFit%20Adventures."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent hover:bg-cyan-hover text-accent-foreground px-8 md:px-10 py-3.5 md:py-4 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition hover:scale-105 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MessageCircle className="w-5 h-5" /> Contact Now
        </a>
        <button
          onClick={onOpenChat}
          className="border-2 border-foreground/20 text-foreground hover:border-accent hover:text-accent px-8 md:px-10 py-3.5 md:py-4 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Chat with Us
        </button>
      </div>
    </Reveal>
  </section>
);

export default CTASection;
