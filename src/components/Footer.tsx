import { Phone, Mail, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.webp";

const Footer = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="contact" className="scroll-mt-20 bg-background py-12 md:py-16 border-t border-border/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 md:gap-10 mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="SummitFit Adventures" className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/30" />
              <span className="font-heading font-bold text-foreground text-lg tracking-wider uppercase">SummitFit</span>
            </div>
            <p className="text-muted-foreground text-sm">Professional mountain guiding & elite fitness training in South Africa.</p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-4 tracking-wider uppercase">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/routes"
                className="text-muted-foreground hover:text-accent text-sm text-left transition-colors"
              >
                Routes
              </Link>
              <Link
                to="/news"
                className="text-muted-foreground hover:text-accent text-sm text-left transition-colors"
              >
                What's New
              </Link>
              {[["about", "The Guide"], ["fitness", "Training"]].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-muted-foreground hover:text-accent text-sm text-left transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-4 tracking-wider uppercase">Get in Touch</h3>
            <div className="flex flex-col gap-3">
              <a href="https://wa.me/27671301536?text=Hi!%20I'm%20interested%20in%20learning%20more%20about%20SummitFit%20Adventures." className="flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href="tel:+27671301536" className="flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors">
                <Phone className="w-4 h-4" /> +27 67 130 1536
              </a>
              <a href="mailto:info@summitfitadventures.com" className="flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors">
                <Mail className="w-4 h-4" /> info@summitfitadventures.com
              </a>
              <a href="mailto:bookings@summitfitadventures.com" className="flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors">
                <Mail className="w-4 h-4" /> bookings@summitfitadventures.com
              </a>
              <a href="https://www.instagram.com/summitfitadventures" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors">
                <Instagram className="w-4 h-4" /> @summitfitadventures
              </a>
              <a href="https://www.facebook.com/carrickadventures" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors">
                <Facebook className="w-4 h-4" /> Follow us on Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-6 text-center">
          <p className="text-muted-foreground text-sm">&copy; 2026 SummitFit Adventures. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
