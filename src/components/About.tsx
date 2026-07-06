import guideImage from "@/assets/meet-ernest.webp";
import { Shield, Leaf, Camera } from "lucide-react";
import Reveal from "@/components/Reveal";

interface AboutProps {
  onOpenChat: () => void;
}

const features = [
  { icon: Shield, title: "Safety First, Always", desc: "CATHSSETA & AQN accredited with First Aid Level 3 (Wilderness First Responder). Every route is risk-assessed and weather-monitored." },
  { icon: Leaf, title: "Fynbos Expert", desc: "Deep knowledge of the Cape Floristic Kingdom, a UNESCO World Heritage Site." },
  { icon: Camera, title: "Storytelling & Memories", desc: "Every peak has a story. Ernest weaves narrative into nature." },
];

const About = ({ onOpenChat }: AboutProps) => (
  <section id="about" className="scroll-mt-20 py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        <Reveal className="relative">
          <div className="rounded-2xl overflow-hidden glow-border">
            <img
              src={guideImage}
              alt="Ernest Carrick - Mountain Guide"
              className="w-full object-cover aspect-square"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-gold text-accent-foreground rounded-xl px-6 py-3 font-heading font-bold text-sm tracking-wider uppercase shadow-gold hidden md:flex items-center gap-2">
            <span className="text-lg">★</span> Elite Guide
          </div>
        </Reveal>

        <Reveal delay={120}>
          <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">The Guide</span>
          <h2 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-4 tracking-wider uppercase">
            Meet Ernest Carrick
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            With over 5 years guiding across the Western Cape's most iconic peaks, Ernest brings technical expertise, safety consciousness, and storytelling.
          </p>

          <div className="space-y-6 mb-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/20">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground mb-1 tracking-wider uppercase">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenChat}
              className="bg-accent hover:bg-[hsl(193,100%,42%)] text-accent-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-all hover:scale-105"
            >
              Book with Ernest
            </button>
            <a
              href="https://www.instagram.com/summitfitadventures"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-foreground/20 text-foreground hover:border-accent hover:text-accent px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-all"
            >
              Follow Adventures
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default About;
