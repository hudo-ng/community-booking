import { prisma } from "@/lib/db";
import NotFound from "@/app/not-found";
import { redirect } from "next/navigation";
import { consumeEmailVerificationToken } from "@/lib/tokens";

type Params = Promise<{ token: string }>;

export default async function EmailVerificationPage({
  params,
}: {
  params: Params;
}) {
  const { token } = await params;
  if (!token) NotFound();

  const userId = await consumeEmailVerificationToken(token);
  if (!userId) {
    redirect(
      `/login/?toast=error&msg=${encodeURIComponent("Invalid or expired link")}`
    );
  }
  await prisma.user.update({
    where: { UserId: userId },
    data: { emailVerified: new Date() },
  });
  redirect(
    `/login?toast=success&msg=${encodeURIComponent(
      "Email verified. You can sign in now."
    )}`
  );
}
