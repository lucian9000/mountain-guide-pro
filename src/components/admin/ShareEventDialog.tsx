import { useEffect, useState } from "react";
import { Check, Copy, Download, Facebook, Instagram, Share2 } from "lucide-react";
import type { EventItem } from "@/lib/types/db";
import {
  buildEventCaption,
  canNativeShare,
  copyText,
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

  const shareFacebook = () => {
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
            Instagram has no web posting API, so we copy the caption and open the app for
            you — paste and post. Publish the event first so the link works.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareEventDialog;
