import { Shield, Heart, Mountain, Trophy } from "lucide-react";

const trustItems = [
  { icon: Shield, label: "CATHSSETA Accredited" },
  { icon: Heart, label: "First Aid Level 3" },
  { icon: Mountain, label: "MCSA Member" },
  { icon: Trophy, label: "10+ Years Experience" },
];

const TrustBar = () => (
  <section className="bg-primary py-4 md:py-6 border-y border-border/30">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {trustItems.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center justify-center gap-2 md:gap-3 py-1.5 md:py-2">
            <Icon className="w-4 h-4 md:w-5 md:h-5 text-gold flex-shrink-0" />
            <span className="text-foreground/80 text-xs md:text-sm font-medium tracking-wide">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBar;
