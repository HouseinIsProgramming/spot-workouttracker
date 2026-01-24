import { useEffect } from "react";
import { useMigrationStatus, useMigration } from "@/lib/data/migration";
import { Dumbbell, CloudUpload } from "lucide-react";
import { toast } from "sonner";

export function MigrationHandler({ children }: { children: React.ReactNode }) {
  const { needsMigration, isLoading } = useMigrationStatus();
  const { migrate, isMigrating, error } = useMigration();

  useEffect(() => {
    if (needsMigration && !isMigrating) {
      // Auto-migrate on detection
      migrate()
        .then((result) => {
          if (result?.imported && result.counts) {
            const { completedWorkouts, customExercises } = result.counts;
            if (completedWorkouts > 0 || customExercises > 0) {
              toast.success("Data synced to cloud!", {
                description: `${completedWorkouts} workout${completedWorkouts !== 1 ? "s" : ""} and ${customExercises} custom exercise${customExercises !== 1 ? "s" : ""} imported.`,
              });
            }
          }
        })
        .catch((err) => {
          console.error("Migration failed:", err);
          toast.error("Failed to sync data", {
            description: "Your local data will be synced on next login.",
          });
        });
    }
  }, [needsMigration, isMigrating, migrate]);

  // Show loading state during migration
  if (isLoading || isMigrating) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          {isMigrating ? (
            <>
              <CloudUpload className="h-10 w-10 text-primary mx-auto animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Syncing your data to the cloud...
              </p>
            </>
          ) : (
            <>
              <Dumbbell className="h-10 w-10 text-primary mx-auto animate-pulse" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show error but still render children (migration is non-blocking)
  if (error) {
    console.error("Migration error:", error);
  }

  return <>{children}</>;
}
