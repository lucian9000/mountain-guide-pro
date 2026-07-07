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
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const openChat = () => setChatOpen(true);
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
      <SiteHeader variant="overlay" onOpenChat={openChat} />
      <main id="main">
        <Hero onOpenChat={openChat} />
        <TrustBar />
        <Services />
        <Expeditions onOpenChat={openChat} />
        <About onOpenChat={openChat} />
        <Fitness onOpenChat={openChat} />
        <Gallery onOpenChat={openChat} />
        <Values />
        <CTASection onOpenChat={openChat} />
        <SocialFeed />
      </main>
      <Footer />
      <BackToTop />
      <ChatWidget isOpen={chatOpen} onOpen={openChat} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Index;
