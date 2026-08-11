import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  usePricing,
  useUpsertPricing,
  useDeletePricing,
} from "@/lib/queries/admin";
import type { Pricing } from "@/lib/types/db";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/admin/DataState";
import SitePricesSection from "@/components/admin/SitePricesSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Draft = Partial<Pricing> & { _isNew?: boolean };

const DEFAULT_MIN_GROUP = 4;

const blankTour = (order: number): Draft => ({
  _isNew: true,
  name: "",
  price: 0,
  price_group: null,
  group_min_size: DEFAULT_MIN_GROUP,
  currency: "ZAR",
  duration: "",
  difficulty: 1,
  max_participants: 1,
  display_order: order,
  active: true,
});

const money = (v: number | null | undefined) =>
  v == null ? "—" : `R${Number(v).toLocaleString("en-ZA")}`;

const AdminPricing = () => {
  const { data, isLoading, error } = usePricing();
  const upsert = useUpsertPricing();
  const del = useDeletePricing();
  const { toast } = useToast();

  const [editing, setEditing] = useState<Draft | null>(null);
  /** Locally applied edits so the card updates before the refetch lands. */
  const [optimistic, setOptimistic] = useState<Record<string, Partial<Pricing>>>({});

  useEffect(() => {
    // Server data is authoritative once it arrives.
    if (data) setOptimistic({});
  }, [data]);

  const tours = (data ?? []).map((t) => ({ ...t, ...(optimistic[t.id] ?? {}) }));

  const set = (field: keyof Pricing, value: unknown) =>
    setEditing((d) => (d ? { ...d, [field]: value } : d));

  const save = async () => {
    if (!editing) return;
    const { _isNew, ...rest } = editing;
    if (!rest.name?.trim()) {
      toast({ title: "Give the tour a name first", variant: "destructive" });
      return;
    }
    const payload = _isNew ? { ...rest, id: undefined } : rest;
    if (rest.id) setOptimistic((o) => ({ ...o, [rest.id as string]: rest }));
    setEditing(null);
    try {
      await upsert.mutateAsync(payload);
      toast({ title: "Price updated ✓", description: rest.name });
    } catch (e) {
      if (rest.id) {
        setOptimistic((o) => {
          const next = { ...o };
          delete next[rest.id as string];
          return next;
        });
      }
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const remove = async (tour: Pricing) => {
    try {
      await del.mutateAsync(tour.id);
      toast({ title: "Deleted", description: tour.name });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const numberField = (
    id: string,
    label: string,
    field: keyof Pricing,
    value: number | null | undefined,
    hint?: string
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        className="h-12 text-base"
        value={value ?? ""}
        onChange={(e) => set(field, e.target.value === "" ? null : Number(e.target.value))}
      />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Tap Edit on a tour to change its price. Changes go live immediately.
        </p>
        <Button
          onClick={() => setEditing(blankTour((data?.length ?? 0) + 1))}
          className="h-11 gap-2 bg-accent text-accent-foreground hover:bg-cyan-hover focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Plus className="w-4 h-4" /> Add tour
        </Button>
      </div>

      <DataState
        loading={isLoading}
        error={error}
        empty={tours.length === 0}
        emptyMessage="No tours yet. Add your first one."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => (
            <article key={tour.id} className="glass-card glow-border p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading font-bold text-foreground text-lg leading-tight">
                  {tour.name}
                </h2>
                <Badge
                  variant="secondary"
                  className={
                    tour.active ? "bg-success/20 text-success" : "text-muted-foreground"
                  }
                >
                  {tour.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="font-heading text-3xl font-black text-foreground">
                {money(tour.price)}
                <span className="text-muted-foreground text-sm font-normal"> pp</span>
              </div>

              {tour.price_group != null ? (
                <p className="text-accent text-sm">
                  Groups of {tour.group_min_size ?? DEFAULT_MIN_GROUP}+:{" "}
                  {money(tour.price_group)} pp
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">No group rate set</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setEditing({ ...tour })}
                  className="h-11 flex-1 gap-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      aria-label={`Delete ${tour.name}`}
                      className="h-11 w-11 p-0 text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this tour?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{tour.name}" will be permanently removed. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(tour)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </article>
          ))}
        </div>
      </DataState>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?._isNew ? "New tour" : editing?.name}</DialogTitle>
            <DialogDescription>
              Change the price and who gets the group rate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {editing?._isNew ? (
              <div className="space-y-1.5">
                <Label htmlFor="tour-name">Tour name</Label>
                <Input
                  id="tour-name"
                  className="h-12 text-base"
                  value={editing?.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
            ) : null}

            {numberField("tour-price", "Price (per person)", "price", editing?.price)}
            {numberField(
              "tour-price-group",
              "Group price (per person)",
              "price_group",
              editing?.price_group,
              "Leave empty for no group rate."
            )}
            {numberField(
              "tour-group-min",
              "Group applies from (people)",
              "group_min_size",
              editing?.group_min_size ?? DEFAULT_MIN_GROUP
            )}

            <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
              <Label htmlFor="tour-active" className="text-base">
                Show on the website
              </Label>
              <Switch
                id="tour-active"
                checked={!!editing?.active}
                onCheckedChange={(v) => set("active", v)}
              />
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="advanced">
                <AccordionTrigger>Advanced</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-1">
                  {!editing?._isNew ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="tour-name-adv">Tour name</Label>
                      <Input
                        id="tour-name-adv"
                        className="h-12 text-base"
                        value={editing?.name ?? ""}
                        onChange={(e) => set("name", e.target.value)}
                      />
                    </div>
                  ) : null}
                  <div className="space-y-1.5">
                    <Label htmlFor="tour-description">Description</Label>
                    <Input
                      id="tour-description"
                      className="h-12 text-base"
                      value={editing?.description ?? ""}
                      onChange={(e) => set("description", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tour-duration">Duration</Label>
                    <Input
                      id="tour-duration"
                      className="h-12 text-base"
                      value={editing?.duration ?? ""}
                      onChange={(e) => set("duration", e.target.value)}
                    />
                  </div>
                  {numberField(
                    "tour-max",
                    "Max participants",
                    "max_participants",
                    editing?.max_participants
                  )}
                  {numberField(
                    "tour-order",
                    "Display order",
                    "display_order",
                    editing?.display_order
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter>
            <Button
              onClick={save}
              className="h-14 w-full text-base bg-accent text-accent-foreground hover:bg-cyan-hover focus-visible:ring-2 focus-visible:ring-accent"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SitePricesSection />
    </div>
  );
};

export default AdminPricing;
