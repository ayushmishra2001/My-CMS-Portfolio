"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/shared/button";
import { Input, FormField } from "@/components/shared/form-elements";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic-link" | "password" | "forgot-password">("password");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin/dashboard` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      // If the user logging in is a first-time user, redirect to password reset
      const isFirstLogin = data.user?.user_metadata?.is_first_login !== false;
      if (isFirstLogin) {
        window.location.href = "/admin/reset-password?firstLogin=true";
      } else {
        window.location.href = "/admin/dashboard";
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">D</span>
          </div>
          <div>
            <p className="font-semibold text-sm">DevFolio CMS</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        {/* Tab selection */}
        {mode !== "forgot-password" && (
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => { setMode("password"); setSent(false); }}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                mode === "password"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => { setMode("magic-link"); setSent(false); }}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                mode === "magic-link"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Magic Link
            </button>
          </div>
        )}

        {/* Form Container */}
        <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
          {mode === "forgot-password" ? (
            !sent ? (
              <>
                <h1 className="text-lg font-semibold mb-1">Reset Password</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your email address and we'll send you a password reset link.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <FormField label="Email address" required>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                    />
                  </FormField>
                  <Button type="submit" className="w-full" loading={loading}>
                    Send reset link
                  </Button>
                </form>
                <button
                  onClick={() => setMode("password")}
                  className="mt-4 text-xs text-primary hover:underline block mx-auto text-center"
                >
                  Back to sign in
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="font-semibold mb-1">Check your email</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Reset link sent to <strong>{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Click the link in the email to set your new password.
                </p>
                <button
                  onClick={() => { setSent(false); setMode("password"); }}
                  className="mt-4 text-xs text-muted-foreground underline"
                >
                  Back to sign in
                </button>
              </div>
            )
          ) : mode === "password" ? (
            <>
              <h1 className="text-lg font-semibold mb-1">Sign in</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your credentials to access the admin panel.
              </p>
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <FormField label="Email address" required>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                </FormField>
                <FormField label="Password" required>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </FormField>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setMode("forgot-password"); setSent(false); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  Sign in
                </Button>
              </form>
            </>
          ) : (
            // Magic Link Login
            !sent ? (
              <>
                <h1 className="text-lg font-semibold mb-1">Sign in with Magic Link</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your email to receive a magic link.
                </p>
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <FormField label="Email address" required>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                    />
                  </FormField>
                  <Button type="submit" className="w-full" loading={loading}>
                    Send magic link
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Check your local Supabase inbox at{" "}
                  <a href="http://localhost:54324" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    localhost:54324
                  </a>
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="font-semibold mb-1">Check your email</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Magic link sent to <strong>{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Local dev: open{" "}
                  <a href="http://localhost:54324" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Supabase Inbucket
                  </a>{" "}
                  to find the link.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-xs text-muted-foreground underline"
                >
                  Try a different email
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
