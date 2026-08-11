import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Services from "@/components/Services";
import Expeditions from "@/components/Expeditions";
import About from "@/components/About";
import Fitness from "@/components/Fitness";
import Gallery from "@/components/Gallery";
import Values from "@/components/Values";
import CTASection from "@/components/CTASection";
import SocialFeed from "@/components/SocialFeed";
import DataUsageDisclosure from "@/components/DataUsageDisclosure";
import Footer from "@/components/Footer";
import QuickBookPanel from "@/components/QuickBookPanel";
import EventBanner from "@/components/EventBanner";
import UpcomingAdventures from "@/components/UpcomingAdventures";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const location = useLocation();

  // Land on the right section when arriving via /#<section> (e.g. from a
  // subpage's "Training"/"Contact"/"The Guide" link). Deferred so the target
  // section has mounted before we scroll.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const raf = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [location.hash]);

  return (
    <div className="min-h-dvh">
      <SiteHeader variant="overlay" onOpenBooking={openBooking} />
      <main id="main">
        <Hero onOpenBooking={openBooking} />
        <TrustBar />
        <Services />
        <Expeditions onOpenBooking={openBooking} />
        <UpcomingAdventures />
        <About onOpenBooking={openBooking} />
        <Fitness onOpenBooking={openBooking} />
        <Gallery onOpenBooking={openBooking} />
        <Values />
        <CTASection onOpenBooking={openBooking} />
        <SocialFeed />
        <DataUsageDisclosure />
      </main>
      <Footer />
      <BackToTop />
      <QuickBookPanel
        isOpen={bookingOpen}
        onOpen={openBooking}
        onClose={() => setBookingOpen(false)}
      />
      <EventBanner />
    </div>
  );
};

export default Index;
