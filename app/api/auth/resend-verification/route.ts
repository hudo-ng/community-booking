import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { createEmailVerificationToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/mailer";
import { tooManyRecent, hashIp, logResend } from "@/lib/rateLimit";
import { authOptions } from "@/auth.config";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email as string | undefined;
    const email = sessionEmail;
    if (!email) {
      return NextResponse.json({
        ok: true,
        message: "If an account exists, we sent a verification email.",
      });
    }

    const h = headers();
    const ip =
      (await h).get("x-forwarded-for")?.split(",")[0]?.trim() ||
      (await h).get("x-real-ip") ||
      null;
    const ipHash = hashIp(ip);
    if (
      await tooManyRecent({
        email,
        ipHash,
        perMinute: 100,
        perHour: 200,
        perDay: 250,
      })
    ) {
      return NextResponse.json({
        ok: true,
        message: "If an account exists, we sent a verification email.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { UserId: true, emailVerified: true, name: true },
    });
    await logResend(email, ipHash);

    if (user && !user.emailVerified) {
      const raw = await createEmailVerificationToken(user.UserId);
      const verifyUrl = `${process.env.APP_URL}/verify/${raw}`;
      await sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto">
            <p>Hi${user.name ? " " + user.name : ""},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="${verifyUrl}">${verifyUrl}</a></p>
            <p>This link expires in 24 hours.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists, we sent a verification email.",
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      message: "If an account exists, we sent a verification email.",
    });
  }
}
