import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import UpdateCard from "@/components/news/UpdateCard";
import { usePublishedUpdates } from "@/lib/queries/content";

/**
 * Homepage "What's New" — latest 3 published updates, directly below the hero.
 * Renders nothing while loading or when there are no published updates, so the
 * homepage never shows an empty box.
 */
const WhatsNew = () => {
  const { data } = usePublishedUpdates(3);

  if (!data || data.length === 0) return null;

  return (
    <section id="whats-new" className="scroll-mt-20 py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-10 md:mb-14">
          <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">
            Fresh From The Mountain
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase">
            What's New
          </h2>
        </Reveal>

        <Reveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {data.map((u) => (
            <UpdateCard key={u.id} update={u} compact />
          ))}
        </Reveal>

        <div className="text-center">
          <Link
            to="/news"
            className="inline-flex text-accent hover:text-[hsl(193,100%,70%)] font-heading font-bold text-sm tracking-wider uppercase transition-colors"
          >
            All news →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhatsNew;
