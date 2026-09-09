import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Search,
  Clock3,
  Mountain,
  ArrowRight,
} from "lucide-react";
import { usePublishedRoutes, useTourPrices, useTourPriceRows } from "@/lib/queries/content";
import { matchTourPrice } from "@/components/routes/RouteCard";
import { publicImageUrl } from "@/lib/images";
import type { RouteDifficulty } from "@/lib/types/content";

const filters: { value: "all" | RouteDifficulty; label: string }[] = [
  { value: "all", label: "All trails" },
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "challenging", label: "Challenging" },
  { value: "extreme", label: "Extreme" },
];

export default function RouteExplorer({
  compact = false,
}: {
  compact?: boolean;
}) {
  const routes = usePublishedRoutes();
  const prices = useTourPrices();
  const pricingRows = useTourPriceRows();
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const reduced = useReducedMotion();
  const inputId = useId();
  const filtered = useMemo(
    () =>
      (routes.data ?? []).filter(
        (route) =>
          (difficulty === "all" || route.difficulty === difficulty) &&
          `${route.name} ${route.description}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [routes.data, difficulty, search],
  );
  const visible =
    compact && difficulty === "all" && !search.trim()
      ? filtered.slice(0, 3)
      : filtered;
  const clear = () => {
    setDifficulty("all");
    setSearch("");
  };

  return (
    <MotionConfig reducedMotion="user">
      <section id="expeditions" className="ex-explorer ex-section">
        <div className="ex-section-heading">
          <div>
            <span className="ex-eyebrow">
              <span /> THE CAPE, ON FOOT
            </span>
            {compact ? (
              <h2>
                Find your
                <br />
                <em>kind of wild.</em>
              </h2>
            ) : (
              <h1>
                Find your
                <br />
                <em>kind of wild.</em>
              </h1>
            )}
          </div>
          <div className="ex-section-aside">
            <p>
              From a first summit to a new limit.
              <br />
              There’s a mountain for the way you move.
            </p>
            {compact && (
              <Link to="/routes" className="ex-text-link">
                Explore all routes <ArrowUpRight size={18} />
              </Link>
            )}
          </div>
        </div>
        <div className="ex-route-toolbar">
          <div
            className="ex-filters"
            role="group"
            aria-label="Filter routes by difficulty"
          >
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={difficulty === f.value}
                onClick={() => setDifficulty(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="ex-search" htmlFor={inputId}>
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search routes</span>
            <input
              id={inputId}
              type="search"
              placeholder="Find a trail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        {routes.isLoading ? (
          <div
            className="ex-route-grid"
            aria-label="Loading routes"
            aria-busy="true"
          >
            {[0, 1, 2].map((n) => (
              <div key={n} className="ex-route-skeleton" />
            ))}
          </div>
        ) : routes.error ? (
          <div className="ex-empty">
            <h3>We couldn’t load the trails.</h3>
            <p>Please try again, or ask Ernest for a recommendation.</p>
            <button className="ex-button" onClick={() => void routes.refetch()}>
              Try again <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <p className="ex-results sr-only" role="status">
              {filtered.length} routes found
              {visible.length < filtered.length
                ? `, showing ${visible.length} featured routes`
                : ""}
            </p>
            <motion.div layout={!reduced} className="ex-route-grid">
              {visible.map((route) => {
                const cover =
                  route.images?.find((i) => i.is_cover) ?? route.images?.[0];
                const price =
                (prices.data?.[route.slug] ?? matchTourPrice(route, pricingRows.data))?.price ?? route.price_cents / 100;
                return (
                  <motion.article
                    layout={!reduced}
                    key={route.id}
                    className="ex-route-card"
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 0.3 }}
                  >
                    <Link
                      to={`/routes/${route.slug}`}
                      aria-label={`Explore ${route.name}`}
                    >
                      <div className="ex-route-image">
                        {cover ? (
                          <img
                            src={publicImageUrl(cover.storage_path)}
                            alt={cover.alt_text || route.name}
                            loading="lazy"
                            width={cover.width || 800}
                            height={cover.height || 1000}
                          />
                        ) : (
                          <div className="ex-image-placeholder">
                            <Mountain size={64} strokeWidth={0.7} />
                            <span>Discover the route</span>
                          </div>
                        )}
                        <span
                          className={`ex-difficulty ex-difficulty--${route.difficulty}`}
                        >
                          <i />
                          {route.difficulty}
                        </span>
                        <span className="ex-route-open">
                          <ArrowUpRight size={22} />
                        </span>
                        <div className="ex-route-overlay">
                          <span className="ex-eyebrow">GUIDED ADVENTURE</span>
                          {compact ? (
                            <h3>{route.name}</h3>
                          ) : (
                            <h2>{route.name}</h2>
                          )}
                        </div>
                      </div>
                      <div className="ex-route-meta">
                        <span>
                          <Clock3 size={14} />
                          {route.duration_hours
                            ? `${route.duration_hours} hrs`
                            : "Ask Ernest"}
                        </span>
                        <span>
                          {route.distance_km
                            ? `${route.distance_km} km`
                            : "Guided route"}
                        </span>
                        <strong>
                          {price > 0
                            ? `R${price.toLocaleString("en-ZA")} pp`
                            : "Price on request"}
                        </strong>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </motion.div>
            {!filtered.length && (
              <div className="ex-empty">
                <h3>
                  {routes.data?.length
                    ? "No trails match your search."
                    : "New adventures are on their way."}
                </h3>
                <p>
                  {routes.data?.length
                    ? "Try a different name or difficulty."
                    : "Ask Ernest to help you plan a guided hike."}
                </p>
                {routes.data?.length ? (
                  <button className="ex-button" onClick={clear}>
                    Clear filters
                  </button>
                ) : (
                  <a className="ex-button" href="https://wa.me/27671301536">
                    Ask Ernest <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            )}
          </>
        )}
        <div className="ex-trail-note">
          <Mountain size={17} />
          <p>
            Not sure where to start?{" "}
            <a
              href="https://wa.me/27671301536?text=Hi%20Ernest%2C%20could%20you%20help%20me%20choose%20a%20route%3F"
              target="_blank"
              rel="noopener noreferrer"
            >
              Let Ernest help you choose.
            </a>
          </p>
          <span>YOUR PACE. YOUR MOUNTAIN.</span>
        </div>
      </section>
    </MotionConfig>
  );
}
