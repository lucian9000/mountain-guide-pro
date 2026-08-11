import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Send } from "lucide-react";
import {
  useAdminEvent,
  useCreateEvent,
  useUpdateEvent,
  type EventDraft,
} from "@/lib/queries/events";
import { useGuides } from "@/lib/queries/admin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import EventPreviewCard from "@/components/admin/EventPreviewCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STEPS = ["The basics", "Spots & price", "Make it look good"] as const;

const NO_GUIDE = "none";

const emptyDraft = (): EventDraft => ({
  title: "",
  description: "",
  location: "",
  event_date: "",
  start_time: "",
  duration_hours: null,
  capacity: 10,
  price_per_person: 0,
  image_url: "",
  is_published: false,
  guide_id: null,
});

const AdminEventEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const duplicateOf = params.get("duplicate");
  const navigate = useNavigate();
  const { toast } = useToast();

  const sourceId = id ?? duplicateOf;
  const source = useAdminEvent(sourceId ?? null);
  const guides = useGuides();
  const create = useCreateEvent();
  const update = useUpdateEvent();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<EventDraft>(emptyDraft);
  const [loaded, setLoaded] = useState(false);

  const isEditing = Boolean(id);

  // Prefill from the source event (edit) or clear date + publish flag (duplicate).
  useEffect(() => {
    if (loaded || !sourceId || !source.data) return;
    const s = source.data;
    setDraft({
      title: duplicateOf ? `${s.title} (copy)` : s.title,
      description: s.description ?? "",
      location: s.location ?? "",
      event_date: duplicateOf ? "" : s.event_date,
      start_time: s.start_time ? s.start_time.slice(0, 5) : "",
      duration_hours: s.duration_hours,
      capacity: s.capacity,
      price_per_person: s.price_per_person,
      image_url: s.image_url ?? "",
      is_published: duplicateOf ? false : s.is_published,
      guide_id: s.guide_id,
    });
    setLoaded(true);
  }, [loaded, sourceId, source.data, duplicateOf]);

  // Default a brand-new event to the first active guide, when there is one.
  useEffect(() => {
    if (sourceId || draft.guide_id) return;
    const first = (guides.data ?? []).find((g) => g.active);
    if (first) setDraft((d) => ({ ...d, guide_id: first.id }));
  }, [guides.data, sourceId, draft.guide_id]);

  const set = <K extends keyof EventDraft>(field: K, value: EventDraft[K]) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const stepError = (index: number): string | null => {
    if (index === 0) {
      if (!draft.title.trim()) return "Give the event a title.";
      if (!draft.event_date) return "Pick a date.";
      return null;
    }
    if (index === 1) {
      if (!draft.capacity || draft.capacity < 1) return "Capacity must be at least 1.";
      if (draft.price_per_person == null || Number(draft.price_per_person) < 0)
        return "Enter a price (0 is fine for a free event).";
      return null;
    }
    return null;
  };

  const next = () => {
    const err = stepError(step);
    if (err) {
      toast({ title: err, variant: "destructive" });
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const save = async (publish: boolean) => {
    for (let i = 0; i < STEPS.length; i += 1) {
      const err = stepError(i);
      if (err) {
        setStep(i);
        toast({ title: err, variant: "destructive" });
        return;
      }
    }

    const payload: EventDraft = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description?.trim() || null,
      location: draft.location?.trim() || null,
      start_time: draft.start_time ? `${draft.start_time.slice(0, 5)}:00` : null,
      image_url: draft.image_url?.trim() || null,
      capacity: Number(draft.capacity),
      price_per_person: Number(draft.price_per_person),
      is_published: publish,
    };

    try {
      if (isEditing && id) {
        await update.mutateAsync({ id, ...payload });
        toast({
          title: publish ? "Event published ✓" : "Changes saved ✓",
          description: payload.title,
        });
      } else {
        await create.mutateAsync(payload);
        toast({
          title: publish ? "Event published ✓" : "Saved as draft ✓",
          description: payload.title,
        });
      }
      navigate("/admin/events");
    } catch (e) {
      toast({
        title: "Could not save the event",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const activeGuides = (guides.data ?? []).filter((g) => g.active);
  const busy = create.isPending || update.isPending;

  const bumpCapacity = (delta: number) =>
    set("capacity", Math.max(1, Number(draft.capacity || 0) + delta));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading font-bold text-lg text-foreground">
          {isEditing ? "Edit event" : duplicateOf ? "Duplicate event" : "New event"}
        </h2>
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/events")}
          className="h-11 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft className="w-4 h-4" /> All events
        </Button>
      </div>

      {/* Step indicator */}
      <ol className="flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                i <= step ? "bg-accent" : "bg-muted"
              )}
            />
            <span
              className={cn(
                "mt-2 block text-xs font-heading tracking-wider uppercase",
                i === step ? "text-accent" : "text-muted-foreground"
              )}
            >
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="glass-card glow-border p-5 space-y-5">
        {step === 0 ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                className="h-12 text-base"
                placeholder="Sunrise summit hike"
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                className="h-12 text-base"
                value={draft.event_date}
                onChange={(e) => set("event_date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-time">Start time</Label>
              <Input
                id="event-time"
                type="time"
                className="h-12 text-base"
                value={draft.start_time ?? ""}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                className="h-12 text-base"
                placeholder="Platteklip Gorge car park"
                value={draft.location ?? ""}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="event-capacity">How many spots?</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  aria-label="One fewer spot"
                  onClick={() => bumpCapacity(-1)}
                  className="h-12 w-12 p-0 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <Input
                  id="event-capacity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="h-12 w-24 text-center text-base"
                  value={draft.capacity}
                  onChange={(e) => set("capacity", Number(e.target.value))}
                />
                <Button
                  type="button"
                  variant="outline"
                  aria-label="One more spot"
                  onClick={() => bumpCapacity(1)}
                  className="h-12 w-12 p-0 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-price">Price per person (R)</Label>
              <Input
                id="event-price"
                type="number"
                inputMode="numeric"
                min={0}
                className="h-12 text-base"
                value={draft.price_per_person}
                onChange={(e) => set("price_per_person", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-duration">Roughly how long (hours)</Label>
              <Input
                id="event-duration"
                type="number"
                inputMode="numeric"
                min={0}
                className="h-12 text-base"
                value={draft.duration_hours ?? ""}
                onChange={(e) =>
                  set("duration_hours", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                rows={5}
                className="text-base"
                placeholder="What to expect, what to bring, how hard it is."
                value={draft.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-image">Image URL</Label>
              <Input
                id="event-image"
                className="h-12 text-base"
                placeholder="https://…"
                value={draft.image_url ?? ""}
                onChange={(e) => set("image_url", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-guide">Guide</Label>
              {activeGuides.length === 0 ? (
                <p
                  id="event-guide"
                  className="text-muted-foreground text-sm rounded-lg border border-border/40 px-4 py-3"
                >
                  No guides yet — you can assign one later.
                </p>
              ) : (
                <Select
                  value={draft.guide_id ?? NO_GUIDE}
                  onValueChange={(v) => set("guide_id", v === NO_GUIDE ? null : v)}
                >
                  <SelectTrigger id="event-guide" className="h-12 text-base">
                    <SelectValue placeholder="No guide assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_GUIDE}>No guide assigned</SelectItem>
                    {activeGuides.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-heading text-sm font-bold tracking-wider uppercase text-muted-foreground">
                How it will look on the website
              </p>
              <EventPreviewCard
                event={{
                  title: draft.title,
                  description: draft.description ?? null,
                  location: draft.location ?? null,
                  event_date: draft.event_date,
                  start_time: draft.start_time ?? null,
                  capacity: Number(draft.capacity || 0),
                  price_per_person: Number(draft.price_per_person || 0),
                  image_url: draft.image_url || null,
                }}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* Step navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="h-12 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={next}
            className="h-12 flex-1 gap-2 bg-accent text-accent-foreground hover:bg-cyan-hover focus-visible:ring-2 focus-visible:ring-accent"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : null}
      </div>

      {step === STEPS.length - 1 ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => save(false)}
            className="h-14 flex-1 text-base gap-2 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Check className="w-4 h-4" />
            {isEditing
              ? draft.is_published
                ? "Unpublish"
                : "Save changes"
              : "Save as draft"}
          </Button>
          <Button
            disabled={busy}
            onClick={() => save(true)}
            className="h-14 flex-1 text-base gap-2 bg-accent text-accent-foreground hover:bg-cyan-hover focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Send className="w-4 h-4" />
            {isEditing && draft.is_published ? "Save changes" : "Publish now"}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default AdminEventEditor;
