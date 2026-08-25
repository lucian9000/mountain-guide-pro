import { useEffect, useState } from "react";
import { Check, Copy, Download, ExternalLink, Facebook, Instagram, Link2, Share2 } from "lucide-react";
import type { EventItem } from "@/lib/types/db";
import {
  buildEventCaption,
  canNativeShare,
  copyText,
  eventPageUrl,
  eventShareUrl,
  facebookShareUrl,
  nativeShareEvent,
} from "@/lib/share";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Share an event to Facebook / Instagram.
 *
 * Facebook: opens its public share dialog (no Meta app or token needed).
 * Instagram: has no web-post API, so we make the manual post one-tap easy —
 * copy the caption, download the image, paste in the app. On a phone the
 * native share sheet lists Instagram directly.
 */
const ShareEventDialog = ({
  event,
  open,
  onOpenChange,
}: {
  event: EventItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { toast } = useToast();
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (event) setCaption(buildEventCaption(event));
    setCopied(false);
  }, [event, open]);

  if (!event) return null;

  const copy = async () => {
    const ok = await copyText(caption);
    setCopied(ok);
    toast({
      title: ok ? "Caption copied ✓" : "Could not copy — select the text and copy it",
      variant: ok ? undefined : "destructive",
    });
  };

  const shareFacebook = async () => {
    // Facebook won't let us pre-fill the post text, so put the caption on the
    // clipboard — Ernest just pastes it into the box next to the preview card.
    const ok = await copyText(caption);
    if (ok) toast({ title: "Caption copied — paste it into the Facebook box" });
    window.open(facebookShareUrl(event), "_blank", "noopener,noreferrer,width=640,height=640");
  };

  const shareInstagram = async () => {
    await copyText(caption);
    if (await nativeShareEvent(event)) return;
    toast({
      title: "Caption copied ✓",
      description: event.image_url
        ? "Download the image below, then paste the caption in the Instagram app."
        : "Open the Instagram app, add your photo and paste the caption.",
    });
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Share "{event.title}"</DialogTitle>
          <DialogDescription>
            Post this event to Facebook and Instagram. Edit the caption first if you like.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={12}
            aria-label="Post caption"
            className="text-sm font-mono"
          />

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
            <Link2 className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            <code className="text-xs text-muted-foreground truncate flex-1 min-w-0">
              {eventShareUrl(event)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const ok = await copyText(eventShareUrl(event));
                toast({ title: ok ? "Link copied ✓" : "Could not copy the link" });
              }}
              className="h-8 shrink-0 focus-visible:ring-2 focus-visible:ring-accent"
            >
              Copy link
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 shrink-0 gap-1 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <a href={eventPageUrl(event)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" /> View
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={copy}
              className="h-11 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy caption"}
            </Button>

            {event.image_url ? (
              <Button
                variant="outline"
                asChild
                className="h-11 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <a href={event.image_url} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4" /> Get image
                </a>
              </Button>
            ) : null}

            {canNativeShare() ? (
              <Button
                variant="outline"
                onClick={() => nativeShareEvent(event)}
                className="h-11 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Share2 className="w-4 h-4" /> Share…
              </Button>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              onClick={shareFacebook}
              className="h-12 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Facebook className="w-4 h-4" /> Share to Facebook
            </Button>
            <Button
              variant="secondary"
              onClick={shareInstagram}
              className="h-12 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Instagram className="w-4 h-4" /> Post to Instagram
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            The link shows this event's own photo and details when it's pasted into
            Facebook or WhatsApp. Instagram has no web posting API, so we copy the
            caption and open the app — paste and post.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareEventDialog;
