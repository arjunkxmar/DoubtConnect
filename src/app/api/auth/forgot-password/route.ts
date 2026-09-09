import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory store for reset codes (in production, use Redis or a DB table)
export const resetCodesStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new NextResponse("Email address is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return new NextResponse("No account found with this email address.", { status: 404 });
    }

    // Generate 6-digit reset code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    resetCodesStore.set(user.email.toLowerCase(), { code, expiresAt });

    console.log(`[FORGOT_PASSWORD] Reset code generated for ${user.email}: ${code}`);

    return NextResponse.json({
      message: "Password reset code sent to your email.",
      // For development ease, we provide the code in response
      resetCodeDemo: code
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
