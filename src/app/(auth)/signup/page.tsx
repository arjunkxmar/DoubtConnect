import { AuthScene } from "@/components/3d/AuthScene";
import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#070707]">
      {/* 3D Scene Container - Hidden on small mobile, half width on desktop */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative bg-[#070707] border-r border-white/10 items-center justify-center overflow-hidden">
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

      {/* Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 max-h-screen overflow-hidden">
        <div className="md:hidden absolute top-6 left-6 z-20">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-white" />
            <span className="text-xl font-bold tracking-tight text-white">
              DoubtConnect
            </span>
          </Link>
        </div>
        <div className="w-full flex justify-center relative z-10 mt-16 md:mt-0 h-full items-center">
          <SignupForm />
        </div>
        {/* Subtle background glow for mobile */}
        <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
