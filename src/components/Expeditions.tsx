import { Link } from "react-router-dom";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import Reveal from "@/components/Reveal";
import { routes } from "@/data/routes";
import { usePublishedRoutes } from "@/lib/queries/content";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDuration } from "@/lib/format";
import { routeCover } from "@/components/routes/RouteCard";
import { routeFallbackImage } from "@/components/routes/routeImageFallbacks";
import DifficultyBadge from "@/components/routes/DifficultyBadge";
import type { RouteDifficulty } from "@/lib/types/content";

interface ExpeditionsProps {
  onOpenBooking: () => void;
}

// Keep the incumbent featured choices when published, then fill from the catalogue.
const FEATURED_SLUGS = ["india-venster", "waterworks", "west-peak"];
const bundledDifficulty = (difficulty: number): RouteDifficulty =>
  difficulty <= 2 ? "easy" : difficulty === 3 ? "moderate" : difficulty === 4 ? "challenging" : "extreme";

const Expeditions = ({ onOpenBooking }: ExpeditionsProps) => {
  const publishedRoutes = usePublishedRoutes();
  const managedRoutes = publishedRoutes.data ?? [];
  const selected = [
    ...FEATURED_SLUGS.flatMap((slug) => managedRoutes.filter((route) => route.slug === slug)),
    ...managedRoutes.filter((route) => !FEATURED_SLUGS.includes(route.slug)),
  ].slice(0, 3);
  const expeditions = isSupabaseConfigured ? selected.map((route) => ({
    slug: route.slug,
    cover: routeCover(route),
    title: route.name,
    duration: route.duration_hours != null ? formatDuration(route.duration_hours) : null,
    difficulty: route.difficulty,
    description: route.description,
  })) : FEATURED_SLUGS.flatMap((slug) => {
    const route = routes.find((route) => route.id === slug);
    return route ? [{
      slug,
      cover: { src: routeFallbackImage(slug), alt: route.name, width: null, height: null },
      title: route.name,
      duration: route.specs.duration,
      difficulty: bundledDifficulty(route.specs.difficulty),
      description: route.specs.terrain,
    }] : [];
  });
  const loading = isSupabaseConfigured && publishedRoutes.isLoading;
  const error = isSupabaseConfigured && publishedRoutes.error;

  return (
    <section id="expeditions" className="scroll-mt-20 py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-10 md:mb-16">
          <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">Adventures</span>
          <h2 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase">
            Featured Routes
          </h2>
        </Reveal>

        {loading || error || expeditions.length === 0 ? (
          <p role="status" className="text-center text-muted-foreground text-sm mb-10 md:mb-12">
            {loading ? "Loading routes…" : error
              ? "Unable to load routes. Please try again later."
              : "No routes published yet — check back soon."}
          </p>
        ) : <Reveal className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
          {expeditions.map((exp) => (
            <div
              key={exp.slug}
              className="glass-card glow-border glow-border-hover overflow-hidden transition duration-300 hover:-translate-y-2 group min-w-0"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={exp.cover.src}
                  alt={exp.cover.alt}
                  width={exp.cover.width ?? undefined}
                  height={exp.cover.height ?? undefined}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <span className="absolute top-3 right-3">
                  <DifficultyBadge difficulty={exp.difficulty} />
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-lg font-bold text-foreground mb-2 tracking-wider uppercase">{exp.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mb-3">
                  {exp.duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-accent" /> {exp.duration}</span>}
                  <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-gold" /> {exp.difficulty}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{exp.description}</p>
                {/* py-3 -my-3 grows the tap target to ≥44px without shifting layout */}
                <Link
                  to={`/routes/${exp.slug}`}
                  className="inline-flex items-center gap-1 py-3 -my-3 text-accent hover:text-cyan-soft font-heading font-bold text-sm transition-colors tracking-wider uppercase rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  View Details <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </Reveal>}

        <div className="text-center">
          <button
            onClick={onOpenBooking}
            className="bg-accent hover:bg-cyan-hover text-accent-foreground px-8 py-4 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Find Your Adventure
          </button>
        </div>
      </div>
    </section>
  );
};

export default Expeditions;
