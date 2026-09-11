import { Shield, Heart, Trophy } from "lucide-react";
import cttMember from "@/assets/cape-town-tourism-member.webp";

const trustItems = [
  { icon: Shield, label: "CATHSSETA & AQN Accredited" },
  { icon: Heart, label: "First Aid Level 3 – Wilderness First Responder" },
  { icon: Trophy, label: "5+ Years Experience" },
];

/**
 * Credentials strip under the hero.
 *
 * The Cape Town Tourism membership mark leads the row, then the three claims
 * share the remaining width equally. Using a fixed 3-column grid for the
 * claims (rather than letting them size to their text) keeps the icons on a
 * predictable rhythm even though the labels are very different lengths.
 */
const TrustBar = () => (
  <section className="bg-primary py-5 md:py-6 border-y border-border/30">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
        <img
          src={cttMember}
          alt="Cape Town Tourism member"
          width={179}
          height={160}
          className="h-10 md:h-12 w-auto shrink-0 self-center md:self-auto"
        />

        <ul className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {trustItems.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-2.5 text-center sm:text-left"
            >
              <Icon
                className="w-4 h-4 md:w-5 md:h-5 text-gold shrink-0"
                aria-hidden="true"
              />
              <span className="text-foreground/80 text-xs md:text-sm font-medium tracking-wide leading-snug">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default TrustBar;
