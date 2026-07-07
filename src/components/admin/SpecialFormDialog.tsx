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
import type { Special } from "@/lib/types/db";

export interface SpecialDraft {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  discount_percent: number | null;
  valid_from: string;
  valid_until: string;
  active: boolean;
}

const emptyDraft: SpecialDraft = {
  title: "",
  description: "",
  image_url: "",
  discount_percent: null,
  valid_from: "",
  valid_until: "",
  active: false,
};

const toDateInput = (v: string | null) => (v ? v.slice(0, 10) : "");

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  special: Special | null;
  onSave: (draft: SpecialDraft) => Promise<void>;
  saving: boolean;
}

const SpecialFormDialog = ({ open, onOpenChange, special, onSave, saving }: Props) => {
  const [draft, setDraft] = useState<SpecialDraft>(emptyDraft);

  useEffect(() => {
    if (open) {
      setDraft(
        special
          ? {
              id: special.id,
              title: special.title,
              description: special.description ?? "",
              image_url: special.image_url ?? "",
              discount_percent: special.discount_percent,
              valid_from: toDateInput(special.valid_from),
              valid_until: toDateInput(special.valid_until),
              active: special.active,
            }
          : emptyDraft
      );
    }
  }, [open, special]);

  const set = <K extends keyof SpecialDraft>(k: K, v: SpecialDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{special ? "Edit Special" : "New Special"}</DialogTitle>
          <DialogDescription>
            Promotional banner content for the homepage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="sp-title">Title</Label>
            <Input
              id="sp-title"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-desc">Description</Label>
            <Textarea
              id="sp-desc"
              rows={3}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-img">Image URL</Label>
            <Input
              id="sp-img"
              placeholder="https://…"
              value={draft.image_url}
              onChange={(e) => set("image_url", e.target.value)}
            />
            <p className="text-muted-foreground/60 text-xs">
              Phase 3: this becomes a Supabase Storage upload (bucket: specials-images).
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sp-disc">Discount %</Label>
              <Input
                id="sp-disc"
                type="number"
                value={draft.discount_percent ?? ""}
                onChange={(e) =>
                  set("discount_percent", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sp-from">Valid from</Label>
              <Input
                id="sp-from"
                type="date"
                value={draft.valid_from}
                onChange={(e) => set("valid_from", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sp-until">Valid until</Label>
              <Input
                id="sp-until"
                type="date"
                value={draft.valid_until}
                onChange={(e) => set("valid_until", e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="sp-active"
              checked={draft.active}
              onCheckedChange={(v) => set("active", v)}
            />
            <Label htmlFor="sp-active" className="cursor-pointer">
              Active (activating this deactivates all others)
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
            disabled={saving || !draft.title.trim()}
            className="bg-accent hover:bg-cyan-hover text-accent-foreground px-5 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-all disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpecialFormDialog;
