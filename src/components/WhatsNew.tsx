import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";
import Reveal from "@/components/Reveal";
import UpdateCard from "@/components/news/UpdateCard";
import { usePublishedUpdates } from "@/lib/queries/content";

/**
 * Homepage "What's New" — announcements (latest 3 published updates, managed
 * in Admin → What's New) alongside the live Facebook page feed. The
 * announcements column keeps its space even when empty, so posts published
 * later slot straight in.
 */
const WhatsNew = () => {
  const { data } = usePublishedUpdates(3);

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

        {/* FB page plugin renders 500px wide internally — give its column
            500px + card padding so posts aren't clipped. */}
        <Reveal className="grid lg:grid-cols-[1fr,520px] gap-6 md:gap-8 items-start max-w-6xl mx-auto">
          {/* Announcements — space reserved even while empty */}
          <div className="flex flex-col gap-4 min-w-0">
            <h3 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-accent" /> Announcements
            </h3>
            {data && data.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4 lg:grid-cols-1 xl:grid-cols-2">
                  {data.map((u) => (
                    <UpdateCard key={u.id} update={u} compact />
                  ))}
                </div>
                <Link
                  to="/news"
                  className="inline-flex text-accent hover:text-[hsl(193,100%,70%)] font-heading font-bold text-sm tracking-wider uppercase transition-colors"
                >
                  All news →
                </Link>
              </>
            ) : (
              <div className="glass-card glow-border flex flex-col items-center justify-center text-center gap-3 p-8 min-h-[320px]">
                <Megaphone className="w-8 h-8 text-accent/50" />
                <p className="text-muted-foreground text-sm max-w-xs">
                  No announcements right now — specials, route news and trail
                  updates will land here.
                </p>
              </div>
            )}
          </div>

          {/* Facebook page feed */}
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
            </div>
            <div className="flex justify-center p-2 bg-background/50 h-[500px] md:h-[600px]">
              <iframe
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fcarrickadventures&tabs=timeline&width=500&height=600&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId"
                width="500"
                height="600"
                style={{ border: "none", overflow: "hidden", width: "100%", height: "100%" }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="SummitFit Adventures on Facebook"
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default WhatsNew;
