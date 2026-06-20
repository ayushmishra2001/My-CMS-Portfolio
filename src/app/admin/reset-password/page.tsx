"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/shared/button";
import { Input, FormField } from "@/components/shared/form-elements";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstLogin = searchParams.get("firstLogin") === "true";

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to reset your password.");
        router.push("/admin/login");
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
      data: { is_first_login: false },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
      <h1 className="text-lg font-semibold mb-1">
        {isFirstLogin ? "Set Password" : "Reset Password"}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {isFirstLogin
          ? "Since this is your first time logging in, please set a password to secure your account."
          : "Please enter your new password below."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="New Password" required>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            autoFocus
          />
        </FormField>
        <FormField label="Confirm New Password" required>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <Button type="submit" className="w-full" loading={loading}>
          Save Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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

        <Suspense fallback={
          <div className="border border-border rounded-lg p-6 bg-card shadow-sm text-center py-12">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
