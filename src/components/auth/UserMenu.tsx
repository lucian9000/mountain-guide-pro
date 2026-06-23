import { Link } from "react-router-dom";
import { CalendarDays, LayoutDashboard, LogOut, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initials = (name?: string | null, email?: string | null) => {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/\s+/);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
};

/** Avatar + dropdown shown in the navbar when the user is signed in. */
const UserMenu = () => {
  const { user, profile, role, signOut } = useAuth();
  if (!user) return null;

  const name = profile?.full_name ?? user.user_metadata?.full_name ?? null;
  const email = profile?.email ?? user.email ?? null;
  const avatarUrl = profile?.avatar_url ?? user.user_metadata?.avatar_url ?? undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-accent">
        <Avatar className="w-9 h-9 ring-2 ring-accent/30 hover:ring-accent/60 transition-all">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "Account"} />}
          <AvatarFallback className="bg-secondary text-accent text-xs font-heading font-bold">
            {initials(name, email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-heading text-sm tracking-wide truncate">
            {name ?? "Adventurer"}
          </span>
          {email && (
            <span className="text-muted-foreground text-xs font-normal truncate">
              {email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/dashboard/bookings" className="cursor-pointer">
            <CalendarDays className="w-4 h-4" /> My Bookings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/account" className="cursor-pointer">
            <User className="w-4 h-4" /> My Account
          </Link>
        </DropdownMenuItem>

        {role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer">
                <Shield className="w-4 h-4" /> Admin Panel
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void signOut()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
