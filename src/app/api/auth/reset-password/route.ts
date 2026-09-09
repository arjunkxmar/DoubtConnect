import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { resetCodesStore } from "../forgot-password/route";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return new NextResponse("Email, verification code, and new password are required.", { status: 400 });
    }

    if (newPassword.length < 6) {
      return new NextResponse("Password must be at least 6 characters.", { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const storedData = resetCodesStore.get(normalizedEmail);

    // Accept code if it matches stored code or demo code '123456'
    if (!storedData || storedData.code !== code.trim()) {
      if (code.trim() !== "123456") {
        return new NextResponse("Invalid or expired verification code.", { status: 400 });
      }
    }

    if (storedData && Date.now() > storedData.expiresAt && code.trim() !== "123456") {
      resetCodesStore.delete(normalizedEmail);
      return new NextResponse("Verification code has expired. Please request a new one.", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return new NextResponse("User not found.", { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword }
    });

    // Clear reset code store
    resetCodesStore.delete(normalizedEmail);

    return NextResponse.json({ message: "Password updated successfully. You can now log in." });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
