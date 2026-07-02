import { Mountain, Dumbbell, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    icon: Mountain,
    title: "Mountain Guiding",
    description: "Safety-first route planning, peak summits, and guided expeditions across the Western Cape's most iconic ranges. CATHSSETA & AQN accredited with full risk assessment on every route.",
    features: ["Route Planning", "Peak Summits", "Safety Protocols", "Weather Monitoring"],
  },
  {
    icon: Dumbbell,
    title: "Fitness Training",
    description: "High-performance coaching for mountain readiness and functional strength. Personalized programs designed to build the endurance, power, and resilience you need on the trail.",
    features: ["Functional Strength", "Endurance Building", "Trail Fitness", "Custom Programs"],
  },
  {
    icon: Users,
    title: "Corporate Events",
    description: "Bespoke team-building experiences that fuse mountain guiding with fitness challenges. Half-day or full-day formats for all fitness levels — energise your team in the mountains.",
    features: ["Team Building", "Custom Challenges", "All Fitness Levels", "Full-Day Options"],
    comingSoon: true,
  },
];

const Services = () => (
  <section id="services" className="scroll-mt-20 py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4">
      <Reveal className="text-center mb-10 md:mb-16">
        <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">What We Do</span>
        <h2 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase">
          Our Expertise
        </h2>
      </Reveal>

      <Reveal className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
        {services.map(({ icon: Icon, title, description, features, comingSoon }) => (
          <div
            key={title}
            className="glass-card glow-border glow-border-hover p-6 md:p-8 transition-all duration-500 hover:-translate-y-1 group"
          >
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
              <Icon className="w-7 h-7 text-accent" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-heading text-xl font-bold text-foreground tracking-wider uppercase">{title}</h3>
              {comingSoon && <Badge variant="secondary" className="whitespace-nowrap">Coming Soon</Badge>}
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <span key={f} className="text-xs font-medium text-accent/80 bg-accent/5 border border-accent/20 px-3 py-1 rounded-full">
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

export default Services;
