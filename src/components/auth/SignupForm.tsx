"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  college: z.string().min(2, "College name is required"),
  branch: z.string().min(2, "Branch/Major is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  subjects: z.string().optional(),
  skills: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      academicYear: "",
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Something went wrong");
      }

      // Auto login after signup
      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError("Account created, but auto-login failed. Please log in manually.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
      <CardHeader className="space-y-2 sticky top-0 bg-[#111111]/95 backdrop-blur z-10 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-white">Join DoubtConnect</CardTitle>
        <CardDescription className="text-center text-[#A1A1AA]">
          Create your account to start learning and helping peers.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Full Name</label>
              <Input 
                {...register("fullName")}
                placeholder="John Doe" 
                className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 h-11"
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Email / College ID</label>
              <Input 
                {...register("email")}
                type="email" 
                placeholder="you@college.edu" 
                className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 h-11"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Password</label>
              <div className="relative">
                <Input 
                  {...register("password")}
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Confirm Password</label>
              <Input 
                {...register("confirmPassword")}
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 h-11"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1AA]">College</label>
              <Input 
                {...register("college")}
                placeholder="MIT" 
                className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 h-11"
              />
              {errors.college && <p className="text-xs text-red-500">{errors.college.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Branch</label>
              <Input 
                {...register("branch")}
                placeholder="Computer Science" 
                className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 h-11"
              />
              {errors.branch && <p className="text-xs text-red-500">{errors.branch.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Academic Year</label>
              <Controller
                control={control}
                name="academicYear"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-[#070707] border-white/10 text-white h-11 focus:ring-white/20 focus:ring-offset-0">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-white/10 text-white">
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.academicYear && <p className="text-xs text-red-500">{errors.academicYear.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Favorite Subjects (Optional)</label>
              <Input 
                {...register("subjects")}
                placeholder="Data Structures, ML..." 
                className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Skills (Optional)</label>
              <Input 
                {...register("skills")}
                placeholder="React, Python, Figma..." 
                className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 h-11"
              />
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <Button 
              type="submit" 
              className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#111111] px-2 text-[#71717A]">Or register with</span>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              disabled={isLoading}
              variant="outline" 
              className="w-full h-11 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.7 1 4 3.5 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5 12 5z" />
                <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3l3.6 2.8c2.1-1.9 3.3-4.7 3.3-8.1z" />
                <path fill="#FBBC05" d="M5.8 14.1c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1L2.2 7.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.2 4.9l3.6-2.8z" />
                <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5L2.2 16.9C4 20.5 7.7 23 12 23z" />
              </svg>
              Sign up with Google
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/5 pt-4">
        <p className="text-sm text-[#A1A1AA]">
          Already have an account?{" "}
          <Link href="/login" className="text-white font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
