import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

/**
 * Google OAuth verification disclosure — describes what the app does and why
 * it requests Google SSO data, directly on the homepage (reviewers reject
 * homepages that don't explain the Google-data usage in plain sight).
 * Keep this copy accurate to actual behaviour: BOTH clients and the admin
 * sign in with Google (basic profile scopes); only the admin dashboard can
 * additionally connect Google Calendar (read-only).
 */
const DataUsageDisclosure = () => (
  <section
    aria-labelledby="data-usage-heading"
    className="border-t border-border/40 bg-card/30 px-4 py-10 md:py-12"
  >
    <div className="max-w-3xl mx-auto text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-accent" aria-hidden="true" />
        <h2
          id="data-usage-heading"
          className="font-heading text-sm font-bold text-foreground tracking-wider uppercase"
        >
          SummitFit App Integration &amp; Data Usage
        </h2>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        SummitFit Adventures uses secure Google Single Sign-On (SSO) to let
        clients create an account and book guided tours, and to authenticate
        authorized administrators accessing the internal scheduling and
        booking-management dashboard. We retrieve standard identity data (your
        name and email address) solely to verify your identity, manage your
        bookings, and confirm administrative clearance. Administrators may
        additionally connect Google Calendar (read-only) to manage tour
        availability. We never sell your data or use it for advertising — see
        our{" "}
        <Link
          to="/privacy"
          className="text-accent hover:text-cyan-hover underline underline-offset-4 transition-colors"
        >
          Privacy Policy
        </Link>{" "}
        for full details.
      </p>
    </div>
  </section>
);

export default DataUsageDisclosure;
