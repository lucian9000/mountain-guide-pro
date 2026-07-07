import challengeImage from "@/assets/gallery-challenge.webp";
import galleryPeak1 from "@/assets/gallery-13peaks-1.webp";
import galleryPeak2 from "@/assets/gallery-13peaks-2.webp";
import galleryPeak3 from "@/assets/gallery-13peaks-3.webp";
import galleryPeak4 from "@/assets/gallery-13peaks-4.webp";
import { Mountain } from "lucide-react";
import Reveal from "@/components/Reveal";

interface GalleryProps {
  onOpenChat: () => void;
}

const thirteenPeaks = [
  "Signal Hill",
  "Lion's Head",
  "Maclear's Beacon",
  "Grootkop",
  "Judas Peak",
  "Little Lion's Head",
  "Suther Peak",
  "Chapman's Peak",
  "Noordhoek Peak",
  "Muizenberg Peak",
  "Constantia Berg",
  "Klassen's Kop",
  "Devil's Peak",
];

const Gallery = ({ onOpenChat }: GalleryProps) => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4">
      <Reveal className="text-center mb-10 md:mb-16">
        <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">Gallery</span>
        <h2 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase">
          Adventures Await
        </h2>
      </Reveal>

      <Reveal className="relative rounded-2xl overflow-hidden mb-6 md:mb-8 group glow-border">
        <img
          src={challengeImage}
          alt="The 13 Peak Challenge"
          className="w-full h-56 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent flex items-end p-6 md:p-8">
          <div>
            <span className="text-gradient-gold text-xs font-heading font-bold tracking-[0.2em] uppercase mb-2 block">Featured Challenge</span>
            <h3 className="font-heading text-2xl md:text-3xl font-black text-foreground mb-2 tracking-wider uppercase">
              The 13 Peak Challenge
            </h3>
            <p className="text-muted-foreground">
              Conquering South Africa's most iconic summits
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { src: galleryPeak1, alt: "Three trail runners taking a summit selfie at a peak beacon under a blue morning sky" },
          { src: galleryPeak2, alt: "Two hikers with trekking poles leaping off a rocky summit cairn against a clear sky" },
          { src: galleryPeak3, alt: "Five hikers in winter jackets and beanies showing their 13 Peaks Challenge badges on a windswept summit" },
          { src: galleryPeak4, alt: "Large group of hikers celebrating at a summit marker high above the Cape Peninsula coastline" },
        ].map((img) => (
          <div key={img.src} className="rounded-xl overflow-hidden aspect-square group glow-border glow-border-hover">
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </Reveal>

      <div className="mt-10 md:mt-16">
        {/* Intro + stats split */}
        <Reveal className="grid md:grid-cols-3 gap-8 md:gap-10 items-start mb-10 md:mb-14">
          <div className="md:col-span-2 text-left">
            <span className="inline-block bg-destructive/20 text-destructive border border-destructive/30 text-xs font-heading font-bold px-3 py-1 rounded-full tracking-wider uppercase mb-3">
              Extreme Challenge
            </span>
            <h3 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-2 tracking-wider uppercase">
              The 13 Peaks Challenge
            </h3>
            <p className="text-gradient-gold font-heading font-bold text-lg md:text-xl mb-4">
              Born from a miscalculation. Fueled by pure grit.
            </p>

            <div className="space-y-4 text-muted-foreground text-base md:text-lg max-w-2xl">
              <p>
                When ultra-trail legend Ryan Sandes first sketched a route linking his favorite Cape Peninsula summits in a notepad, he guessed it would be a breezy 55km day out. 19 hours later, with dead headlamps and shattered legs, he realized the truth.
              </p>
              <p className="text-foreground font-heading font-bold tracking-wide">
                The 13 Peaks Challenge was born.
              </p>
              <p>
                This isn't just a trail; it's an absolute monster of a loop that forces you to respect the mountain. You'll tag 13 of the most brutal, beautiful, and prominent peaks across the Table Mountain National Park spine.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-row md:flex-col gap-4">
            <div className="flex-1 bg-secondary rounded-2xl p-5 md:p-6 text-center md:text-left">
              <div className="text-3xl md:text-4xl font-heading font-black text-foreground">106km</div>
              <div className="text-muted-foreground text-xs uppercase tracking-wider mt-1">Relentless, Technical Terrain</div>
            </div>
            <div className="flex-1 bg-secondary rounded-2xl p-5 md:p-6 text-center md:text-left">
              <div className="text-3xl md:text-4xl font-heading font-black text-foreground">6,300m</div>
              <div className="text-muted-foreground text-xs uppercase tracking-wider mt-1">Vertical Gain (Kilimanjaro from sea level)</div>
            </div>
          </div>
        </Reveal>

        {/* Checklist grid */}
        <Reveal className="mb-10 md:mb-14">
          <h4 className="font-heading text-sm font-bold text-foreground mb-4 tracking-[0.2em] uppercase text-left">
            The Checklist (The 13)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3">
            {thirteenPeaks.map((peak) => (
              <div key={peak} className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-muted-foreground text-sm md:text-base">{peak}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Pick your hard */}
        <Reveal className="mb-10 md:mb-14">
          <h4 className="font-heading text-sm font-bold text-foreground mb-4 tracking-[0.2em] uppercase text-left">
            Pick Your Poison
          </h4>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-card glow-border rounded-2xl p-6 md:p-8 text-left">
              <h5 className="font-heading text-xl md:text-2xl font-black text-foreground mb-3 tracking-wide uppercase">
                The 48-Hour Purge
              </h5>
              <p className="text-muted-foreground text-base md:text-lg">
                The clock never stops. Two days to find out what you're truly made of.
              </p>
            </div>
            <div className="glass-card glow-border rounded-2xl p-6 md:p-8 text-left">
              <h5 className="font-heading text-xl md:text-2xl font-black text-foreground mb-3 tracking-wide uppercase">
                The Multi-Day Mission
              </h5>
              <p className="text-muted-foreground text-base md:text-lg">
                Break it down, conquer it piece by piece, and log your time on your own terms.
              </p>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal className="text-center">
          <p className="text-foreground font-heading tracking-wide text-lg md:text-xl mb-6">
            Are you tracking, or are you backing out?
          </p>
          <button
            onClick={onOpenChat}
            className="bg-accent hover:bg-cyan-hover text-accent-foreground px-8 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-all hover:scale-105"
          >
            Learn More
          </button>
        </Reveal>
      </div>
    </div>
  </section>
);

export default Gallery;
