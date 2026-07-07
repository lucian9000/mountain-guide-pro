import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Guide } from "@/lib/types/db";

export interface GuideDraft {
  id?: string;
  display_name: string;
  bio: string;
  photo_url: string;
  specialties: string; // comma-separated in the form
  active: boolean;
}

const emptyDraft: GuideDraft = {
  display_name: "",
  bio: "",
  photo_url: "",
  specialties: "",
  active: true,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: Guide | null;
  onSave: (draft: GuideDraft) => Promise<void>;
  saving: boolean;
}

const GuideFormDialog = ({ open, onOpenChange, guide, onSave, saving }: Props) => {
  const [draft, setDraft] = useState<GuideDraft>(emptyDraft);

  useEffect(() => {
    if (open) {
      setDraft(
        guide
          ? {
              id: guide.id,
              display_name: guide.display_name,
              bio: guide.bio ?? "",
              photo_url: guide.photo_url ?? "",
              specialties: (guide.specialties ?? []).join(", "),
              active: guide.active,
            }
          : emptyDraft
      );
    }
  }, [open, guide]);

  const set = <K extends keyof GuideDraft>(k: K, v: GuideDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{guide ? "Edit Guide" : "Add Guide"}</DialogTitle>
          <DialogDescription>Guide profile shown on the public site.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="g-name">Display name</Label>
            <Input
              id="g-name"
              value={draft.display_name}
              onChange={(e) => set("display_name", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-bio">Bio</Label>
            <Textarea
              id="g-bio"
              rows={3}
              value={draft.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-photo">Photo URL</Label>
            <Input
              id="g-photo"
              placeholder="https://…"
              value={draft.photo_url}
              onChange={(e) => set("photo_url", e.target.value)}
            />
            <p className="text-muted-foreground/60 text-xs">
              Phase 3: Supabase Storage upload (bucket: guide-photos).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-spec">Specialties</Label>
            <Input
              id="g-spec"
              placeholder="Scrambling, Trail running, Navigation"
              value={draft.specialties}
              onChange={(e) => set("specialties", e.target.value)}
            />
            <p className="text-muted-foreground/60 text-xs">Comma-separated.</p>
          </div>

          {/* Google Calendar — Phase 3 (read-only placeholder) */}
          <div className="space-y-1.5 rounded-lg border border-border/40 bg-secondary/20 p-3">
            <Label className="text-muted-foreground">Google Calendar ID</Label>
            <Input
              value={guide?.google_calendar_id ?? ""}
              readOnly
              disabled
              placeholder="Configured in Phase 3 — Google Calendar integration"
            />
            <p className="text-muted-foreground/60 text-xs">
              Calendar sync (availability + booking events) is a Phase 3 feature.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="g-active"
              checked={draft.active}
              onCheckedChange={(v) => set("active", v)}
            />
            <Label htmlFor="g-active" className="cursor-pointer">
              Active
            </Label>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={saving || !draft.display_name.trim()}
            className="bg-accent hover:bg-cyan-hover text-accent-foreground px-5 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuideFormDialog;
