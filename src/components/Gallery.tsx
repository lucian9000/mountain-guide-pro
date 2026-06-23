import challengeImage from "@/assets/gallery-challenge.jpg";
import expedition1 from "@/assets/expedition-1.jpg";
import expedition2 from "@/assets/expedition-2.jpg";
import guideImage from "@/assets/guide-portrait.jpg";
import Reveal from "@/components/Reveal";

const Gallery = () => (
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
        {[expedition1, expedition2, guideImage, challengeImage].map((img, i) => (
          <div key={i} className="rounded-xl overflow-hidden aspect-square group glow-border glow-border-hover">
            <img
              src={img}
              alt={`Adventure gallery ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

export default Gallery;
