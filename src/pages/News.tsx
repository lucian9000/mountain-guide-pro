import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import UpdateCard from "@/components/news/UpdateCard";
import DataState from "@/components/admin/DataState";
import { usePublishedUpdates } from "@/lib/queries/content";

/** /news — every published What's New post, newest first. */
const News = () => {
  const updates = usePublishedUpdates();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">
            Fresh From The Mountain
          </span>
          <h1 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase">
            What's New
          </h1>
        </div>

        <DataState
          loading={updates.isLoading}
          error={updates.error}
          empty={!updates.data || updates.data.length === 0}
          emptyMessage="No news yet — check back soon."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {updates.data?.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        </DataState>
      </main>

      <Footer />
    </div>
  );
};

export default News;
