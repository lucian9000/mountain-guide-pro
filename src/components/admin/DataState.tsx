import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface DataStateProps {
  loading: boolean;
  error: unknown;
  empty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

/** Standard loading / error / empty wrapper for admin data views. */
const DataState = ({
  loading,
  error,
  empty,
  emptyMessage = "Nothing here yet.",
  children,
}: DataStateProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <AlertTriangle className="w-7 h-7 text-destructive" />
        <p className="text-foreground text-sm font-medium">Couldn't load data</p>
        <p className="text-muted-foreground text-xs max-w-sm">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Make sure the Supabase schema has been applied (see supabase/schema.sql).
        </p>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <Inbox className="w-7 h-7 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }
  return <>{children}</>;
};

export default DataState;
