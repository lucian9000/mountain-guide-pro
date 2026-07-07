import expedition1 from "@/assets/expedition-1.webp";
import expedition2 from "@/assets/expedition-2.webp";
import helderbergDome from "@/assets/helderberg-dome.webp";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import Reveal from "@/components/Reveal";

interface ExpeditionsProps {
  onOpenChat: () => void;
}

const expeditions = [
  {
    image: expedition1,
    title: "Table Mountain India Venster",
    duration: "4 Hours",
    difficulty: "Hard",
    badgeClass: "bg-destructive/20 text-destructive border border-destructive/30",
    description: "A thrilling scramble up Table Mountain's iconic face with exposed ledges.",
  },
  {
    image: expedition2,
    title: "Skeleton Gorge to Maclear's Beacon",
    duration: "6 Hours",
    difficulty: "Hard",
    badgeClass: "bg-destructive/20 text-destructive border border-destructive/30",
    description: "Full-day traverse through ancient forests and ladders to the highest point.",
  },
  {
    image: helderbergDome,
    title: "West Peak, Hottentots Holland",
    duration: "5–7 Hours",
    difficulty: "Hard",
    badgeClass: "bg-destructive/20 text-destructive border border-destructive/30",
    description: "A scenic climb up Helderberg Reserve's iconic peak above Somerset West.",
  },
];

const Expeditions = ({ onOpenChat }: ExpeditionsProps) => (
  <section id="expeditions" className="scroll-mt-20 py-16 md:py-24 bg-muted">
    <div className="container mx-auto px-4">
      <Reveal className="text-center mb-10 md:mb-16">
        <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">Adventures</span>
        <h2 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase">
          Featured Routes
        </h2>
      </Reveal>

      <Reveal className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
        {expeditions.map((exp) => (
          <div
            key={exp.title}
            className="glass-card glow-border glow-border-hover overflow-hidden transition duration-300 hover:-translate-y-2 group"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={exp.image}
                alt={exp.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <span className={`absolute top-3 right-3 ${exp.badgeClass} text-xs font-heading font-bold px-3 py-1 rounded-full tracking-wider uppercase`}>
                {exp.difficulty}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-heading text-lg font-bold text-foreground mb-2 tracking-wider uppercase">{exp.title}</h3>
              <div className="flex items-center gap-4 text-muted-foreground text-sm mb-3">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-accent" /> {exp.duration}</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-gold" /> {exp.difficulty}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{exp.description}</p>
              {/* py-3 -my-3 grows the tap target to ≥44px without shifting layout */}
              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-1 py-3 -my-3 text-accent hover:text-cyan-soft font-heading font-bold text-sm transition-colors tracking-wider uppercase"
              >
                View Details <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </Reveal>

      <div className="text-center">
        <button
          onClick={onOpenChat}
          className="bg-accent hover:bg-cyan-hover text-accent-foreground px-8 py-4 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition hover:scale-105"
        >
          Find Your Adventure
        </button>
      </div>
    </div>
  </section>
);

export default Expeditions;
