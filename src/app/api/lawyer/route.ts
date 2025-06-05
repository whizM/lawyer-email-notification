import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { laywers } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET: List all laywers
export async function GET() {
  const result = await db.select().from(laywers);
  return NextResponse.json(result);
}

// POST: Add new laywer
export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }
  try {
    const inserted = await db.insert(laywers).values({ name, email });
    return NextResponse.json({ success: true, laywer: inserted });
  } catch (err) {
    return NextResponse.json({ error: "Could not add laywer", details: String(err) }, { status: 500 });
  }
}

// PUT: Update laywer
export async function PUT(req: NextRequest) {
  const { id, name, email } = await req.json();
  if (!id || !name || !email) {
    return NextResponse.json({ error: "Id, name, and email required" }, { status: 400 });
  }
  try {
    await db.update(laywers).set({ name, email }).where(eq(laywers.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not update laywer", details: String(err) }, { status: 500 });
  }
}

// DELETE: Remove laywer
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Id required" }, { status: 400 });
  }
  try {
    await db.delete(laywers).where(eq(laywers.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not delete laywer", details: String(err) }, { status: 500 });
  }
}