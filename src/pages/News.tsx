import { Megaphone, Instagram, Facebook, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import UpdateCard from "@/components/news/UpdateCard";
import { usePublishedUpdates } from "@/lib/queries/content";

const SOCIAL_LINKS = [
  {
    icon: Instagram,
    label: "Follow on Instagram",
    handle: "@summitfitadventures",
    href: "https://instagram.com/summitfitadventures",
  },
  {
    icon: Facebook,
    label: "Like on Facebook",
    handle: "SummitFit Adventures",
    href: "https://www.facebook.com/carrickadventures",
  },
  {
    icon: MessageCircle,
    label: "Chat on WhatsApp",
    handle: "+27 67 130 1536",
    href: "https://wa.me/27671301536?text=Hi!%20I'm%20interested%20in%20a%20SummitFit%20adventure.",
  },
];

/**
 * /news — the "What's New" page (nav → News): announcements at the top
 * (space reserved even when empty), then the live Facebook page feed.
 * Facebook hard-caps its embed at 500px wide, so the feed is centered
 * and tall rather than full-width.
 */
const News = () => {
  const updates = usePublishedUpdates();

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <SiteHeader variant="solid" />

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

        {/* Social band — an evergreen "Follow" sidebar fills the space beside
            the Facebook feed (FB hard-caps its timeline at 500px, so rather
            than stretch it we pair it with useful CTAs). Stacks on mobile. */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_540px] lg:items-start">
          <aside className="glass-card glow-border rounded-xl p-6 md:p-8 flex flex-col">
            <h2 className="font-heading text-lg font-bold text-foreground tracking-wider uppercase mb-2">
              Follow the Adventure
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Trip photos, trail conditions and the next summit — first on our
              socials. Give us a follow, or reach out directly.
            </p>

            <div className="space-y-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label, handle, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border/50 hover:border-accent p-3 group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-heading font-bold text-foreground tracking-wider uppercase group-hover:text-accent transition-colors">
                      {label}
                    </span>
                    <span className="block text-muted-foreground text-xs truncate">{handle}</span>
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border/40">
              <p className="text-muted-foreground text-sm mb-3">
                Ready to get out there?
              </p>
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Book a tour
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>

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
                style={{ border: "none", overflow: "hidden", width: "500px", maxWidth: "100%", height: "100%" }}
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
