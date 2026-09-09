import { ArrowUpRight } from "lucide-react";
import { trainingProgrammes } from "@/data/training";
import { Link } from "react-router-dom";
import { useTourPrices, useTourPriceRows } from "@/lib/queries/content";
import { matchTourPrice } from "@/components/routes/RouteCard";

export default function TrainingSection() {
  const prices = useTourPrices();
  const pricingRows = useTourPriceRows();
  return (
    <section id="fitness" className="ex-training ex-section">
      <div className="ex-section-heading">
        <div>
          <span className="ex-eyebrow">
            <span /> BUILT FOR THE CLIMB
          </span>
          <h2>
            Your next summit
            <br />
            <em>starts down here.</em>
          </h2>
        </div>
        <p className="ex-section-aside">
          Strength for the ascent.
          <br />
          Confidence for everything after it.
        </p>
      </div>
      <div className="ex-training-grid">
        {trainingProgrammes.map(
          ({ id, title, description, icon: Icon, contactForPricing }) => {
            const price = prices.data?.[id] ?? matchTourPrice({ slug: id, name: title }, pricingRows.data);
            const content = (
              <>
                <Icon size={28} strokeWidth={1.2} />
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="ex-text-link">
                  {!contactForPricing && price
                    ? "Book training"
                    : "Build your programme"}{" "}
                  <ArrowUpRight size={19} />
                </span>
              </>
            );
            return !contactForPricing && price ? (
              <Link
                key={id}
                className="ex-training-card"
                to={`/booking?tour=${price.id}`}
              >
                {content}
              </Link>
            ) : (
              <a
                key={id}
                className="ex-training-card"
                href={`https://wa.me/27671301536?text=${encodeURIComponent(`Hi Ernest, I'd like to ask about ${title}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            );
          },
        )}
      </div>
    </section>
  );
}
