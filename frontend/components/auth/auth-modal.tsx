"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Sparkles, X, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    continueAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    if (mode === "signin") {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setErrorMsg(error.message || "Invalid credentials. Please try again.");
      }
    } else {
      const { error } = await signUpWithEmail(email, password);
      if (error) {
        setErrorMsg(error.message || "Registration failed. Check your password length.");
      } else {
        setSuccessMsg("Account created! Check your email for confirmation if required.");
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden p-6 text-foreground">
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back to Claire AI" : "Create your Claire AI Account"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Access your custom AI brand profiles, conversation memory, and social media schedules.
          </p>
        </div>

        {!configured && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Demo Mode Active</p>
              <p className="mt-0.5 text-amber-300/80">
                Supabase keys are not set in frontend `.env`. You can click below to continue as Guest or test the backend directly.
              </p>
            </div>
          </div>
        )}

        {/* Google OAuth button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || !configured}
          className="w-full py-2.5 px-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 text-sm font-medium transition flex items-center justify-center gap-3 mb-4 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.3-.8-.5-1.7-.5-2.6z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 22.3z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or email</span>
          </div>
        </div>

        {/* Error / Success messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-secondary/20 text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-secondary/20 text-xs"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs py-2.5 mt-2"
          >
            {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {mode === "signin" ? "Don't have an account?" : "Already registered?"}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-purple-400 hover:underline font-medium"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </div>

        {/* Guest mode option */}
        <button
          type="button"
          onClick={continueAsGuest}
          className="w-full mt-3 py-2 text-center text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition"
        >
          <span>Continue as Guest / Anonymous Demo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
