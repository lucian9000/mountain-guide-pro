import { Dumbbell, Mountain, Users } from "lucide-react";
import Reveal from "@/components/Reveal";

interface FitnessProps {
  onOpenChat: () => void;
}

const programs = [
  { icon: Dumbbell, title: "Strength Training", desc: "Personalized programs for beginners to advanced athletes." },
  { icon: Mountain, title: "Trail Fitness", desc: "Hybrid outdoor + gym sessions for uphill power and endurance." },
  { icon: Users, title: "Custom Programs", desc: "4-12 week programs tailored to your specific goals." },
];

const Fitness = ({ onOpenChat }: FitnessProps) => (
  <section id="fitness" className="scroll-mt-20 py-16 md:py-24 bg-muted">
    <div className="container mx-auto px-4">
      <Reveal className="text-center mb-10 md:mb-16">
        <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">Training</span>
        <h2 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase">
          Strength for Adventure
        </h2>
      </Reveal>

      <Reveal className="grid md:grid-cols-3 gap-6 md:gap-8">
        {programs.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="glass-card glow-border glow-border-hover p-6 md:p-8 text-center transition-all duration-500 hover:-translate-y-1 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20 group-hover:bg-accent/20 transition-colors">
              <Icon className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-3 tracking-wider uppercase">{title}</h3>
            <p className="text-muted-foreground text-sm mb-6">{desc}</p>
            <button
              onClick={onOpenChat}
              className="text-accent hover:text-[hsl(193,100%,70%)] font-heading font-bold text-sm transition-colors tracking-wider uppercase"
            >
              Learn More →
            </button>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

export default Fitness;
