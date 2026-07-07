import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { UpdateWithRoute } from "@/lib/types/content";
import { relativeDate } from "@/lib/format";
import { publicImageUrl } from "@/lib/images";

/**
 * One What's New card. `compact` = homepage variant (one-line body clamp);
 * the /news page uses the full variant (body clamped to a few lines).
 */
const UpdateCard = ({
  update,
  compact = false,
}: {
  update: UpdateWithRoute;
  compact?: boolean;
}) => (
  <article className="glass-card glow-border glow-border-hover overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1">
    {update.image_path && (
      <div className="relative h-44 overflow-hidden shrink-0">
        <img
          src={publicImageUrl(update.image_path)}
          alt={update.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
      </div>
    )}
    <div className="p-5 flex flex-col gap-2 flex-1">
      <div className="text-muted-foreground text-xs">
        {relativeDate(update.publish_at ?? update.created_at)}
      </div>
      <h3 className="font-heading text-base font-bold text-foreground tracking-wider uppercase">
        {update.title}
      </h3>
      {update.body && (
        <p
          className={`text-muted-foreground text-sm whitespace-pre-line ${
            compact ? "line-clamp-1" : "line-clamp-4"
          }`}
        >
          {update.body}
        </p>
      )}
      {update.route && (
        <Link
          to={`/routes/${update.route.slug}`}
          className="mt-auto pt-2 inline-flex items-center gap-1 text-accent hover:text-[hsl(193,100%,70%)] font-heading font-bold text-xs tracking-wider uppercase transition-colors"
        >
          {update.route.name} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  </article>
);

export default UpdateCard;
