"use server";

import { prisma } from "../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setBookingStatus(
  status: "CONFIRMED" | "CANCELLED",
  formData: FormData
) {
  const session = await getServerSession(authOptions);

  console.log(session);

  if (!session?.user || session.user.role !== "PROVIDER") {
    redirect("/login");
  }

  const id = String(formData.get("id"));

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true },
  });

  if (!booking || booking.service.providerId !== session.user.id) {
    return;
  }

  await prisma.booking.update({
    where: { id },
    data: { status: status as any },
  });
  revalidatePath("/admin/bookings");
}
