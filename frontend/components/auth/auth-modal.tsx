"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Sparkles, X, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, UserCheck } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F131C] border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden p-6 text-foreground">
        {/* Glowing top ambient light */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-24 bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === "signin" ? "Welcome back to Claire AI" : "Create your Claire AI Account"}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Access custom AI brand profiles, persistent memory, and multi-channel post generation.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl mb-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-lg font-medium transition ${
              mode === "signin"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-lg font-medium transition ${
              mode === "signup"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {!configured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Demo Mode Active</p>
              <p className="mt-0.5 text-amber-300/80 leading-relaxed">
                Supabase keys are not set in frontend `.env`. You can click below to continue as Guest or test features directly.
              </p>
            </div>
          </div>
        )}

        {/* Error / Success messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500 focus:ring-purple-500/20 text-xs h-10 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 bg-white/[0.04] border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500 focus:ring-purple-500/20 text-xs h-10 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition"
          >
            {loading ? "Processing..." : mode === "signin" ? "Sign In with Email" : "Create Account"}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#0F131C] px-2 text-neutral-500 tracking-wider font-semibold">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        {/* Guest mode option */}
        <button
          type="button"
          onClick={continueAsGuest}
          className="w-full py-2.5 px-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/30 text-white font-medium text-xs rounded-xl flex items-center justify-between transition group"
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Continue as Guest / Demo Mode</span>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* Terms and Privacy Policy footer notice */}
        <p className="mt-5 text-[11px] text-center text-neutral-500 leading-relaxed">
          By continuing, you agree to Claire AI&apos;s{" "}
          <Link
            href="/terms"
            onClick={() => setIsAuthModalOpen(false)}
            className="text-purple-400 hover:underline font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            onClick={() => setIsAuthModalOpen(false)}
            className="text-purple-400 hover:underline font-medium"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

