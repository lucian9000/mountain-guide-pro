import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Services from "@/components/Services";
import Expeditions from "@/components/Expeditions";
import About from "@/components/About";
import Fitness from "@/components/Fitness";
import Gallery from "@/components/Gallery";
import Values from "@/components/Values";
import CTASection from "@/components/CTASection";
import WhatsNew from "@/components/WhatsNew";
import SocialFeed from "@/components/SocialFeed";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const openChat = () => setChatOpen(true);

  return (
    <div className="min-h-screen">
      <Navbar onOpenChat={openChat} />
      <Hero onOpenChat={openChat} />
      <TrustBar />
      <WhatsNew />
      <Services />
      <Expeditions onOpenChat={openChat} />
      <About onOpenChat={openChat} />
      <Fitness onOpenChat={openChat} />
      <Gallery onOpenChat={openChat} />
      <Values />
      <CTASection onOpenChat={openChat} />
      <SocialFeed />
      <Footer />
      <BackToTop />
      <ChatWidget isOpen={chatOpen} onOpen={openChat} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Index;
