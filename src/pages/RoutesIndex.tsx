import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import RouteExplorer from "@/components/experience/RouteExplorer";

export default function RoutesIndex() {
  return (
    <div className="experience ex-catalogue">
      <SiteHeader variant="solid" />
      <main id="main">
        <RouteExplorer />
      </main>
      <Footer />
    </div>
  );
}
