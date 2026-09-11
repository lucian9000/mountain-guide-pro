import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Mountain, ShieldCheck, Leaf, ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import DataUsageDisclosure from "@/components/DataUsageDisclosure";
import QuickBookPanel from "@/components/QuickBookPanel";
import EventBanner from "@/components/EventBanner";
import CinematicHero from "@/components/experience/CinematicHero";
import RouteExplorer from "@/components/experience/RouteExplorer";
import GuideStory from "@/components/experience/GuideStory";
import PeaksStory from "@/components/experience/PeaksStory";
import ExperienceEvents from "@/components/experience/ExperienceEvents";
import TrainingSection from "@/components/experience/TrainingSection";
import cttMember from "@/assets/cape-town-tourism-member.webp";

export default function Index() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() =>
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        }),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <MotionConfig reducedMotion="user">
      <div className="experience">
        <SiteHeader
          variant="overlay"
          onOpenBooking={() => setBookingOpen(true)}
        />
        <main id="main">
          <CinematicHero />
          <div className="ex-credentials" id="services">
            <img
              className="ex-credentials-badge"
              src={cttMember}
              alt="Cape Town Tourism member"
              width={179}
              height={160}
              loading="lazy"
            />
            <span>
              <Mountain size={20} /> LOCALLY GUIDED
            </span>
            <span>
              <ShieldCheck size={20} /> CATHSSETA &amp; AQN ACCREDITED
            </span>
            <span>
              <Leaf size={20} /> ROOTED IN THE CAPE
            </span>
          </div>
          <section className="ex-intro ex-section">
            <span className="ex-eyebrow">LESS ORDINARY. MORE OUTSIDE.</span>
            <h2>
              Some days stay with you.
              <br />
              <em>Let’s go find one.</em>
            </h2>
            <div>
              <p>
                The first light on a ridge. The silence above the city. That
                moment you realise you’ve gone further than you thought you
                could.
              </p>
              <p>
                This is the Cape through SummitFit. Real mountains, personal
                guidance, and room to discover what you’re capable of.
              </p>
            </div>
          </section>
          <RouteExplorer compact />
          <ExperienceEvents />
          <GuideStory />
          <PeaksStory />
          <TrainingSection />
          <section className="ex-last-light">
            <img
              src="/experience/sunset.webp"
              alt="A hiker looking over Cape Town as the sky turns orange"
              loading="lazy"
            />
            <div>
              <span className="ex-eyebrow">SOME THINGS YOU HAVE TO FEEL.</span>
              <h2>
                This could be
                <br />
                <em>your kind of evening.</em>
              </h2>
              <a
                href="https://www.instagram.com/summitfitadventures"
                target="_blank"
                rel="noopener noreferrer"
                className="ex-text-link"
              >
                Follow the adventures <ArrowUpRight size={20} />
              </a>
            </div>
          </section>
          <div className="ex-disclosure">
            <DataUsageDisclosure />
          </div>
        </main>
        <Footer />
        <QuickBookPanel
          isOpen={bookingOpen}
          onOpen={() => setBookingOpen(true)}
          onClose={() => setBookingOpen(false)}
        />
        <EventBanner />
      </div>
    </MotionConfig>
  );
}
