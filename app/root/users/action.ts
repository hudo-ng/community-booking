"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ROLES = new Set(["ADMIN", "SUPERADMIN", "CUSTOMER", "PROVIDER"]);

export async function setUserRole(fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPERADMIN") {
    redirect(`/root/users?m=${encodeURIComponent("Forbidden")}&t=error`);
  }

  const targetId = String(fd.get("id") ?? "");
  const nextRole = String(fd.get("role") ?? "");

  if (!targetId || !ROLES.has(nextRole)) {
    redirect(`/root/users?m=${encodeURIComponent("Invalid input")}&t=error`);
  }

  const isDemotingSuperAdmin =
    nextRole !== "SUPERADMIN" &&
    (
      await prisma.user.findUnique({
        where: { UserId: targetId },
        select: { role: true },
      })
    )?.role === "SUPERADMIN";

  if (isDemotingSuperAdmin) {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPERADMIN" },
    });
    if (superAdminCount <= 1)
      redirect(
        `/root/users?m=${encodeURIComponent(
          "At least one SUPERADMIN role required."
        )}&t=error`
      );
  }

  const selfId = session.user.id;
  if (selfId === targetId && nextRole !== "SUPERADMIN") {
    redirect(
      `/root/users?m=${encodeURIComponent(
        "You can’t remove your own SUPERADMIN"
      )}&t=error`
    );
  }

  await prisma.user.update({
    where: { UserId: targetId },
    data: {
      role: nextRole as "ADMIN" || "SUPERADMIN" || "CUSTOMER" || "PROVIDER",
    },
  });

  revalidatePath(
    `/root/users?m=${encodeURIComponent("Role updated")}&t=success`
  );
}

export async function setUserStatus(fd: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPERADMIN") {
    redirect(`/root/users?m=${encodeURIComponent("Forbidden")}&t=error`);
  }

  const userId = String(fd.get("id") || "");
  if (!userId) {
    redirect(
      `/root/users?m=${encodeURIComponent("Provider Id not found")}&t=error`
    );
  }

  const user = await prisma.user.findUnique({ where: { UserId: userId } });
  if (!user) {
    redirect(
      `/root/users?m=${encodeURIComponent("Provider not found")}&t=error`
    );
  }

  await prisma.user.update({
    where: { UserId: userId },
    data: {
      isActive: !user.isActive,
    },
  });
  revalidatePath(
    `/root/users?m=${encodeURIComponent("Status updated")}&t=success`
  );
}
