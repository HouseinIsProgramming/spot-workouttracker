import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();

  const signInWithGitHub = () => {
    signIn("github");
  };

  const signInWithPassword = async (email: string, password: string) => {
    await signIn("password", { email, password, flow: "signIn" });
  };

  const signUpWithPassword = async (email: string, password: string) => {
    await signIn("password", { email, password, flow: "signUp" });
  };

  return {
    isLoading,
    isAuthenticated,
    signIn: signInWithGitHub,
    signInWithPassword,
    signUpWithPassword,
    signOut,
  };
}
