import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { buildBookingIcs } from "@/lib/ics";

export async function GET() {
    
}