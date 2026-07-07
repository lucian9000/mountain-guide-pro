import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  isSlugTaken,
  useAdminRoute,
  useDeleteRoute,
  useRestoreRouteVersion,
  useUpsertRoute,
} from "@/lib/queries/contentAdmin";
import type { ContentStatus, RouteDifficulty } from "@/lib/types/content";
import { slugify } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import RouteImagesManager from "@/components/admin/RouteImagesManager";
import VersionHistorySheet from "@/components/admin/VersionHistorySheet";
import { StatusPill } from "@/pages/admin/AdminRoutes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

// Code-split: Leaflet loads only when the editor renders.
const AdminRouteMapPicker = lazy(() => import("@/components/maps/AdminRouteMapPicker"));
import type { RouteCoords } from "@/components/maps/AdminRouteMapPicker";
import { Skeleton } from "@/components/ui/skeleton";

const DIFFICULTIES: RouteDifficulty[] = ["easy", "moderate", "challenging", "extreme"];

const EMPTY_COORDS: RouteCoords = {
  latitude: null,
  longitude: null,
  map_zoom: 13,
  meeting_latitude: null,
  meeting_longitude: null,
};

interface FormState {
  name: string;
  slug: string;
  slugTouched: boolean;
  description: string;
  difficulty: RouteDifficulty;
  duration_hours: string;
  distance_km: string;
  elevation_m: string;
  price_rands: string;
  meeting_point: string;
  highlights: string[];
  highlightDraft: string;
  sort_order: string;
}

const EMPTY: FormState = {
  name: "",
  slug: "",
  slugTouched: false,
  description: "",
  difficulty: "moderate",
  duration_hours: "",
  distance_km: "",
  elevation_m: "",
  price_rands: "",
  meeting_point: "",
  highlights: [],
  highlightDraft: "",
  sort_order: "100",
};

const numOrNull = (s: string): number | null => (s.trim() === "" ? null : Number(s));

/** /admin/routes/new and /admin/routes/:id — full-page route editor. */
const AdminRouteEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const existing = useAdminRoute(id);
  const upsert = useUpsertRoute();
  const del = useDeleteRoute();
  const restore = useRestoreRouteVersion();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [coords, setCoords] = useState<RouteCoords>(EMPTY_COORDS);
  const [scheduleAt, setScheduleAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const route = existing.data;

  // Hydrate the form when the route loads (and after restores).
  useEffect(() => {
    if (!route) return;
    setForm({
      name: route.name,
      slug: route.slug,
      slugTouched: true,
      description: route.description,
      difficulty: route.difficulty,
      duration_hours: route.duration_hours?.toString() ?? "",
      distance_km: route.distance_km?.toString() ?? "",
      elevation_m: route.elevation_m?.toString() ?? "",
      price_rands: route.price_cents ? String(route.price_cents / 100) : "",
      meeting_point: route.meeting_point ?? "",
      highlights: route.highlights,
      highlightDraft: "",
      sort_order: String(route.sort_order),
    });
    setCoords({
      latitude: route.latitude,
      longitude: route.longitude,
      map_zoom: route.map_zoom,
      meeting_latitude: route.meeting_latitude,
      meeting_longitude: route.meeting_longitude,
    });
  }, [route]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onNameChange = (name: string) =>
    setForm((f) => ({
      ...f,
      name,
      slug: f.slugTouched ? f.slug : slugify(name),
    }));

  const addHighlight = () => {
    const h = form.highlightDraft.trim().slice(0, 60);
    if (!h) return;
    if (form.highlights.length >= 12) {
      toast({ title: "Maximum 12 highlights", variant: "destructive" });
      return;
    }
    if (!form.highlights.includes(h)) set("highlights", [...form.highlights, h]);
    set("highlightDraft", "");
  };

  /** Layout-guard validation mirroring the DB check constraints. */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2 || form.name.trim().length > 90)
      errs.name = "Name must be 2–90 characters.";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug) || form.slug.length > 60)
      errs.slug = "Lowercase letters, numbers and hyphens only (max 60).";
    if (form.description.length > 5000) errs.description = "Max 5 000 characters.";
    if (form.meeting_point.length > 200) errs.meeting_point = "Max 200 characters.";
    for (const key of ["duration_hours", "distance_km", "elevation_m", "price_rands", "sort_order"] as const) {
      if (form[key].trim() !== "" && Number.isNaN(Number(form[key])))
        errs[key] = "Must be a number.";
    }
    if (Number(form.price_rands || 0) < 0) errs.price_rands = "Cannot be negative.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const payload = useMemo(
    () => ({
      name: form.name.trim(),
      slug: form.slug,
      description: form.description,
      difficulty: form.difficulty,
      duration_hours: numOrNull(form.duration_hours),
      distance_km: numOrNull(form.distance_km),
      elevation_m: numOrNull(form.elevation_m),
      price_cents: Math.round(Number(form.price_rands || 0) * 100),
      meeting_point: form.meeting_point.trim() || null,
      highlights: form.highlights,
      sort_order: Number(form.sort_order || 100),
      ...coords,
    }),
    [form, coords]
  );

  const save = async (status?: ContentStatus, publishAt?: string | null) => {
    if (!validate()) return null;
    try {
      if (await isSlugTaken(form.slug, id)) {
        setErrors((e) => ({ ...e, slug: "This slug is already in use." }));
        return null;
      }
      const saved = await upsert.mutateAsync({
        id,
        ...payload,
        ...(status ? { status } : {}),
        ...(publishAt !== undefined ? { publish_at: publishAt } : {}),
      });
      toast({ title: "Saved", description: saved.name });
      if (isNew) navigate(`/admin/routes/${saved.id}`, { replace: true });
      return saved;
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleDelete = async () => {
    if (!route) return;
    try {
      await del.mutateAsync(route);
      toast({ title: "Deleted", description: route.name });
      navigate("/admin/routes");
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  if (!isNew && existing.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading route…</p>;
  }
  if (!isNew && !existing.isLoading && !route) {
    return (
      <div className="text-muted-foreground text-sm">
        Route not found.{" "}
        <Link to="/admin/routes" className="text-accent hover:underline">
          Back to routes
        </Link>
      </div>
    );
  }

  const saving = upsert.isPending;
  const field = (key: string) =>
    errors[key] ? <p className="text-destructive text-xs mt-1">{errors[key]}</p> : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/routes"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All routes
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {route && (
            <>
              <StatusPill status={route.status} publishAt={route.publish_at} />
              <a
                href={`/routes/${route.slug}?preview=1`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-accent hover:border-accent/50 px-3 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors"
              >
                <Eye className="w-4 h-4" /> Preview
              </a>
              <VersionHistorySheet
                entityType="routes"
                entityId={route.id}
                restoring={restore.isPending}
                onRestore={async (v) => {
                  await restore.mutateAsync({ routeId: route.id, snapshot: v.snapshot });
                  toast({ title: "Version restored" });
                }}
              />
            </>
          )}
        </div>
      </div>

      <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-wider uppercase">
        {isNew ? "New Route" : route?.name}
      </h1>

      {/* Form */}
      <div className="glass-card glow-border p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              maxLength={90}
              onChange={(e) => onNameChange(e.target.value)}
              className="mt-1.5"
            />
            {field("name")}
          </div>
          <div>
            <Label>Slug (URL)</Label>
            <Input
              value={form.slug}
              maxLength={60}
              onChange={(e) => {
                set("slugTouched", true);
                set("slug", slugify(e.target.value) || e.target.value.toLowerCase());
              }}
              className="mt-1.5 font-mono text-xs"
            />
            <p className="text-muted-foreground/60 text-xs mt-1">/routes/{form.slug || "…"}</p>
            {field("slug")}
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={form.description}
            maxLength={5000}
            rows={6}
            onChange={(e) => set("description", e.target.value)}
            className="mt-1.5"
            placeholder="Line breaks are preserved on the public page."
          />
          <p className="text-muted-foreground/60 text-xs mt-1">
            {form.description.length} / 5000
          </p>
          {field("description")}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Difficulty</Label>
            <Select
              value={form.difficulty}
              onValueChange={(v) => set("difficulty", v as RouteDifficulty)}
            >
              <SelectTrigger className="mt-1.5 capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d} value={d} className="capitalize">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Duration (hours)</Label>
            <Input
              value={form.duration_hours}
              inputMode="decimal"
              onChange={(e) => set("duration_hours", e.target.value)}
              className="mt-1.5"
              placeholder="e.g. 4"
            />
            {field("duration_hours")}
          </div>
          <div>
            <Label>Distance (km)</Label>
            <Input
              value={form.distance_km}
              inputMode="decimal"
              onChange={(e) => set("distance_km", e.target.value)}
              className="mt-1.5"
              placeholder="e.g. 12.5"
            />
            {field("distance_km")}
          </div>
          <div>
            <Label>Elevation gain (m)</Label>
            <Input
              value={form.elevation_m}
              inputMode="numeric"
              onChange={(e) => set("elevation_m", e.target.value)}
              className="mt-1.5"
              placeholder="e.g. 700"
            />
            {field("elevation_m")}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Price (R, per person)</Label>
            <Input
              value={form.price_rands}
              inputMode="decimal"
              onChange={(e) => set("price_rands", e.target.value)}
              className="mt-1.5"
              placeholder="0 = contact for pricing"
            />
            {field("price_rands")}
            <p className="text-muted-foreground/60 text-xs mt-1">
              If a Pricing entry with this slug exists, the booking price is
              shown instead.
            </p>
          </div>
          <div className="md:col-span-2">
            <Label>Meeting point</Label>
            <Input
              value={form.meeting_point}
              maxLength={200}
              onChange={(e) => set("meeting_point", e.target.value)}
              className="mt-1.5"
            />
            {field("meeting_point")}
          </div>
          <div>
            <Label>Sort order</Label>
            <Input
              value={form.sort_order}
              inputMode="numeric"
              onChange={(e) => set("sort_order", e.target.value)}
              className="mt-1.5"
            />
            {field("sort_order")}
          </div>
        </div>

        {/* Highlights tag input */}
        <div>
          <Label>Highlights ({form.highlights.length}/12)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1.5 bg-secondary/60 border border-border/50 text-foreground text-xs px-3 py-1.5 rounded-full"
              >
                {h}
                <button
                  type="button"
                  onClick={() =>
                    set("highlights", form.highlights.filter((x) => x !== h))
                  }
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${h}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              value={form.highlightDraft}
              maxLength={60}
              placeholder="Add a highlight and press Enter"
              onChange={(e) => set("highlightDraft", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addHighlight();
                }
              }}
            />
            <button
              type="button"
              onClick={addHighlight}
              className="border border-accent/50 text-accent hover:bg-accent/10 px-4 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Location (map picker) */}
      <div className="glass-card glow-border p-6">
        <h2 className="font-heading text-sm font-bold text-foreground tracking-wider uppercase mb-4">
          Location
        </h2>
        <Suspense fallback={<Skeleton className="w-full h-[320px] rounded-xl" />}>
          <AdminRouteMapPicker
            routeName={form.name}
            value={coords}
            onChange={(patch) => setCoords((c) => ({ ...c, ...patch }))}
          />
        </Suspense>
      </div>

      {/* Images */}
      <div className="glass-card glow-border p-6">
        {route ? (
          <RouteImagesManager routeId={route.id} slug={route.slug} images={route.images} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Save the route as a draft first, then add images.
          </p>
        )}
      </div>

      {/* Action bar */}
      <div className="glass-card glow-border p-4 flex flex-wrap items-center gap-2 sticky bottom-4">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save(isNew ? "draft" : undefined)}
          className="inline-flex items-center gap-2 border border-border text-foreground hover:border-accent hover:text-accent px-4 py-2.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isNew ? "Save draft" : "Save"}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => void save("published", null)}
          className="inline-flex items-center gap-2 bg-accent hover:bg-cyan-hover text-accent-foreground px-4 py-2.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-colors disabled:opacity-60"
        >
          <Globe className="w-4 h-4" /> Publish now
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={saving}
              className="inline-flex items-center gap-2 border border-gold/50 text-gold hover:bg-gold/10 px-4 py-2.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-60"
            >
              <CalendarClock className="w-4 h-4" /> Schedule
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto space-y-3" align="start">
            <Label>Go live at</Label>
            <Input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
            <button
              type="button"
              disabled={!scheduleAt || saving}
              onClick={() =>
                void save("published", new Date(scheduleAt).toISOString())
              }
              className="w-full bg-accent text-accent-foreground px-4 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase disabled:opacity-60"
            >
              Schedule publish
            </button>
          </PopoverContent>
        </Popover>

        {route?.status === "hidden" ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => void save("published")}
            className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-accent px-4 py-2.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-60"
          >
            <Eye className="w-4 h-4" /> Unhide
          </button>
        ) : (
          route && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void save("hidden")}
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-60"
            >
              <EyeOff className="w-4 h-4" /> Hide
            </button>
          )
        )}

        {route && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="ml-auto inline-flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{route.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  The route, its images and its public page will be removed. Its
                  history remains in the version log.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleDelete()}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default AdminRouteEditor;
