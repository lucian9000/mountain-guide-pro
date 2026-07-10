import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

/**
 * /privacy — static Privacy Policy required by Google OAuth verification
 * (consent screen "Homepage" + "Privacy policy" links must resolve to
 * distinct URLs). Content owned by the business; update the copy here
 * directly rather than pulling it from a CMS.
 */
const Privacy = () => {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <SiteHeader variant="solid" />

      <main id="main" className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-gradient-gold text-sm font-heading font-bold tracking-[0.2em] uppercase mb-3 block">
              Legal
            </span>
            <h1 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-wider uppercase">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm mt-4">Last Updated: July 2026</p>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <p>
              SummitFit Adventures ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we handle information when you use our
              administrative dashboard.
            </p>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground tracking-wide uppercase mb-3">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                We only collect minimal information necessary to authenticate platform
                administrators. When you log in via Google Single Sign-On (SSO), we receive:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your email address</li>
                <li>Your name</li>
                <li>Your public profile picture URL</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground tracking-wide uppercase mb-3">
                2. How We Use Your Information
              </h2>
              <p className="mb-3">The collected information is used strictly to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verify your identity as an authorized administrator.</li>
                <li>Grant secure access to the booking and scheduling dashboard.</li>
                <li>Maintain the backend calendar synchronization workflows.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground tracking-wide uppercase mb-3">
                3. Data Protection and Sharing
              </h2>
              <p>
                We do not sell, trade, rent, or share your personal information with third
                parties. All authentication data is handled securely through encrypted
                connections via Supabase.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground tracking-wide uppercase mb-3">
                4. Contact Us
              </h2>
              <p>
                If you have any questions regarding this policy, please contact us at:{" "}
                <a
                  href="mailto:info@summitfitadventures.com"
                  className="text-accent hover:underline"
                >
                  info@summitfitadventures.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
