import { Megaphone } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import UpdateCard from "@/components/news/UpdateCard";
import { usePublishedUpdates } from "@/lib/queries/content";

/**
 * /news — the "What's New" page (nav → News): announcements at the top
 * (space reserved even when empty), then the live Facebook page feed.
 * Facebook hard-caps its embed at 500px wide, so the feed is centered
 * and tall rather than full-width.
 */
const News = () => {
  const updates = usePublishedUpdates();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />

      <main id="main" className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">
            Fresh From The Mountain
          </span>
          <h1 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase">
            What's New
          </h1>
        </div>

        {/* Announcements — reserved space, filled from Admin → What's New */}
        <section className="mb-12 md:mb-16">
          <h2 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-accent" /> Announcements
          </h2>
          {updates.data && updates.data.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {updates.data.map((u) => (
                <UpdateCard key={u.id} update={u} />
              ))}
            </div>
          ) : (
            <div className="glass-card glow-border flex flex-col items-center justify-center text-center gap-3 p-8 min-h-[180px]">
              <Megaphone className="w-8 h-8 text-accent/50" />
              <p className="text-muted-foreground text-sm max-w-xs">
                No announcements right now — specials, route news and trail
                updates will land here.
              </p>
            </div>
          )}
        </section>

        {/* Facebook feed — centered, tall (FB caps the embed at 500px wide) */}
        <section className="max-w-[540px] mx-auto">
          <div className="rounded-xl overflow-hidden glass-card glow-border">
            <div className="p-4 border-b border-border/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="font-heading text-sm font-bold text-foreground tracking-wider uppercase">
                Latest from Facebook
              </span>
              <a
                href="https://www.facebook.com/carrickadventures"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-accent text-xs hover:underline whitespace-nowrap"
              >
                Open page →
              </a>
            </div>
            {/* FB requires the plugin height param to match the rendered box */}
            <div className="flex justify-center p-2 bg-background/50 h-[900px]">
              <iframe
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fcarrickadventures&tabs=timeline&width=500&height=884&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId"
                width="500"
                height="884"
                style={{ border: "none", overflow: "hidden", width: "100%", height: "100%" }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading="lazy"
                title="SummitFit Adventures on Facebook"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default News;
