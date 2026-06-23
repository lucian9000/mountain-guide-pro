import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateClient } from "@/lib/queries/admin";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/types/auth";

interface Props {
  client: Profile | null;
  onOpenChange: (open: boolean) => void;
}

const ClientDetailSheet = ({ client, onOpenChange }: Props) => {
  const update = useUpdateClient();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTags(client?.tags ?? []);
    setTagInput("");
  }, [client]);

  if (!client) return null;

  const saveOptIn = async (next: boolean) => {
    try {
      await update.mutateAsync({ id: client.id, patch: { marketing_opt_in: next } });
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const persistTags = async (next: string[]) => {
    setTags(next);
    try {
      await update.mutateAsync({ id: client.id, patch: { tags: next } });
    } catch (e) {
      setTags(client.tags ?? []);
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) {
      setTagInput("");
      return;
    }
    void persistTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => void persistTags(tags.filter((x) => x !== t));

  return (
    <Sheet open={!!client} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Client details</SheetTitle>
          <SheetDescription>Manage this client's preferences and tags.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex items-center gap-4">
          <Avatar className="w-14 h-14 ring-2 ring-accent/30">
            {client.avatar_url && <AvatarImage src={client.avatar_url} alt={client.email} />}
            <AvatarFallback className="bg-secondary text-accent font-heading font-bold">
              {(client.full_name || client.email).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-heading font-bold text-foreground truncate">
              {client.full_name ?? "—"}
            </div>
            <div className="text-muted-foreground text-sm truncate">{client.email}</div>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-border/40 text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-muted-foreground">Signed up</dt>
            <dd className="text-foreground">
              {new Date(client.created_at).toLocaleDateString()}
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="text-foreground capitalize">{client.role}</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-center justify-between rounded-lg border border-border/40 p-3">
          <Label htmlFor="optin" className="cursor-pointer">
            Marketing emails
          </Label>
          <Switch
            id="optin"
            checked={client.marketing_opt_in}
            onCheckedChange={saveOptIn}
          />
        </div>

        <div className="mt-6 space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.length === 0 && (
              <span className="text-muted-foreground text-xs">No tags yet.</span>
            )}
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded-full"
              >
                {t}
                <button onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            placeholder="Add a tag (e.g. VIP) and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ClientDetailSheet;
