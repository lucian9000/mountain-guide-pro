import { ArrowUpRight, Mountain, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import cttMember from "@/assets/cape-town-tourism-member.webp";

export default function Footer() {
  return (
    <footer id="contact" className="ex-footer">
      <div className="ex-footer-invite">
        <div>
          <span className="ex-eyebrow">YOUR NEXT ADVENTURE STARTS HERE</span>
          <h2>
            See you
            <br />
            <em>out there.</em>
          </h2>
        </div>
        <a
          className="ex-contact-circle"
          href="https://wa.me/27671301536"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowUpRight size={42} strokeWidth={1} />
          <span>
            LET’S TALK
            <br />
            ADVENTURE
          </span>
        </a>
      </div>
      <div className="ex-footer-grid">
        <div>
          <Link to="/" className="ex-footer-brand">
            <Mountain size={28} />
            <span>
              SUMMITFIT<small>ADVENTURES</small>
            </span>
          </Link>
          <p>
            Professional mountain guiding &amp;
            <br />
            personal training. Cape Town &amp; beyond.
          </p>
          <img
            src={cttMember}
            alt="Cape Town Tourism member"
            width="179"
            height="160"
            className="ex-tourism"
            loading="lazy"
          />
        </div>
        <div>
          <h3>EXPLORE</h3>
          <Link to="/routes">Our routes</Link>
          <Link to="/#challenge">13 Peaks Challenge</Link>
          <Link to="/#fitness">Personal training</Link>
          <Link to="/news">What’s new</Link>
          <Link to="/booking">Book an adventure</Link>
        </div>
        <div>
          <h3>GET IN TOUCH</h3>
          <a href="tel:+27671301536">+27 67 130 1536</a>
          <a href="mailto:info@summitfitadventures.com">
            info@summitfitadventures.com
          </a>
          <a
            href="https://www.instagram.com/summitfitadventures"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={15} /> Instagram <ArrowUpRight size={14} />
          </a>
          <a
            href="https://www.facebook.com/carrickadventures"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook size={15} /> Facebook <ArrowUpRight size={14} />
          </a>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
      <div className="ex-footer-bottom">
        <span>© {new Date().getFullYear()} SUMMITFIT ADVENTURES</span>
        <span>LEAVE ONLY FOOTPRINTS.</span>
        <Link to="/privacy">Privacy policy</Link>
      </div>
    </footer>
  );
}
