"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, KeyRound, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthScene } from "@/components/3d/AuthScene";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to send reset code.");
      }

      const data = await res.json();
      setSuccessMsg("Verification code sent to your email!");
      if (data.resetCodeDemo) {
        setDemoCode(data.resetCodeDemo);
      }
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Password reset failed.");
      }

      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#070707]">
      {/* Left 3D Scene */}
      <div className="hidden md:flex md:w-1/2 relative bg-[#070707] border-r border-white/10 items-center justify-center overflow-hidden">
        <AuthScene />
        <div className="absolute top-8 left-8 z-10">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-white" />
            <span className="text-xl font-bold tracking-tight text-white">
              DoubtConnect
            </span>
          </Link>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="md:hidden absolute top-8 left-8 z-10">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-white" />
            <span className="text-xl font-bold tracking-tight text-white">
              DoubtConnect
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto relative z-10 mt-16 md:mt-0">
          <Card className="border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 justify-center mb-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                  {step === "request" ? <Mail className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-white">
                {step === "request" ? "Reset Password" : "Set New Password"}
              </CardTitle>
              <CardDescription className="text-center text-[#A1A1AA]">
                {step === "request"
                  ? "Enter your email to receive a 6-digit reset code"
                  : `Enter the verification code sent to ${email}`}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 p-3 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {demoCode && (
                <div className="mb-4 p-3 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
                  🔐 Your Verification Code is: <strong className="text-white text-base tracking-widest">{demoCode}</strong>
                </div>
              )}

              {step === "request" ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@college.edu"
                      required
                      className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-purple-500/50 h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg shadow-purple-600/20"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">6-Digit Verification Code</label>
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      required
                      maxLength={6}
                      className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-purple-500/50 h-11 text-center font-mono text-lg tracking-widest"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-purple-500/50 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-purple-500/50 h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/20"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("request")}
                      className="text-xs text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      Resend code to another email
                    </button>
                  </div>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex justify-center border-t border-white/5 pt-4">
              <Link href="/login" className="text-xs text-[#A1A1AA] hover:text-white flex items-center gap-1.5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign in
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
