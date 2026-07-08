import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import RouteCard from "@/components/routes/RouteCard";
import DataState from "@/components/admin/DataState";
import { usePublishedRoutes, useTourPrices } from "@/lib/queries/content";

// MAP REMOVED — Phase 5: RoutesOverviewMap (@/components/maps/RoutesOverviewMap)
// will be re-added when route mapping is ready. Component file kept in place.

/** /routes — all published routes, card grid, ordered by sort_order, name. */
const RoutesIndex = () => {
  const routes = usePublishedRoutes();
  const prices = useTourPrices();

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <SiteHeader variant="solid" />

      <main id="main" className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">
            Adventures
          </span>
          <h1 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase mb-3">
            Our Routes
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Guided summits, scrambles and traverses across the Cape — pick your
            mountain.
          </p>
        </div>

        {/* MAP REMOVED — Phase 5: will be re-added when route mapping is ready */}

        <DataState
          loading={routes.isLoading}
          error={routes.error}
          empty={!routes.data || routes.data.length === 0}
          emptyMessage="No routes published yet — check back soon."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {routes.data?.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                tourPrice={prices.data?.[route.slug]}
              />
            ))}
          </div>
        </DataState>
      </main>

      <Footer />
    </div>
  );
};

export default RoutesIndex;
