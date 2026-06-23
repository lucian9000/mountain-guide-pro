import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Account = () => {
  const { user, profile } = useAuth();

  const name = profile?.full_name ?? user?.user_metadata?.full_name ?? "—";
  const email = profile?.email ?? user?.email ?? "—";
  const avatarUrl =
    profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? undefined;

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Role", profile?.role ?? "client"],
    ["Marketing emails", profile?.marketing_opt_in ? "Subscribed" : "Not subscribed"],
  ];

  return (
    <div className="glass-card glow-border p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="w-16 h-16 ring-2 ring-accent/30">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-secondary text-accent font-heading font-bold">
            {(name !== "—" ? name : email).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground tracking-wider uppercase">
            My Account
          </h1>
          <p className="text-muted-foreground text-sm">{email}</p>
        </div>
      </div>

      <dl className="divide-y divide-border/40">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-3">
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="text-foreground text-sm font-medium text-right capitalize">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-muted-foreground/60 text-xs mt-6">
        Editing your profile and marketing preferences will be available in a
        later phase.
      </p>
    </div>
  );
};

export default Account;
