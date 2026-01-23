import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();

  const signInWithGitHub = () => {
    signIn("github");
  };

  return {
    isLoading,
    isAuthenticated,
    signIn: signInWithGitHub,
    signOut,
  };
}
