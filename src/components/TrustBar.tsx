import { Shield, Heart, Trophy } from "lucide-react";
import cttMember from "@/assets/cape-town-tourism-member.webp";

const trustItems = [
  { icon: Shield, label: "CATHSSETA & AQN Accredited" },
  { icon: Heart, label: "First Aid Level 3 – Wilderness First Responder" },
  { icon: Trophy, label: "5+ Years Experience" },
];

/**
 * Credentials strip under the hero: Cape Town Tourism membership, then the
 * three claims.
 *
 * All four sit in ONE `justify-between` row. Equal-width columns look even in
 * the markup but not on screen — the labels run from 19 to 46 characters, so
 * centring each in its own cell leaves visibly different gaps between them.
 * Distributing the leftover space between the items instead makes every gap
 * identical, and anchors the row flush to both container edges.
 */
const TrustBar = () => (
  <section className="bg-primary py-5 md:py-6 border-y border-border/30">
    <div className="container mx-auto">
      <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4 lg:flex-nowrap lg:justify-between lg:gap-6">
        <li className="shrink-0">
          <img
            src={cttMember}
            alt="Cape Town Tourism member"
            width={179}
            height={160}
            className="h-12 lg:h-14 w-auto"
          />
        </li>

        {trustItems.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 shrink-0">
            <Icon
              className="w-4 h-4 lg:w-5 lg:h-5 text-gold shrink-0"
              aria-hidden="true"
            />
            <span className="text-foreground/80 text-xs lg:text-sm font-medium tracking-wide whitespace-nowrap">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TrustBar;
