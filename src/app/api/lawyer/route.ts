import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lawyers } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET: List all lawyers
export async function GET() {
  const result = await db.select().from(lawyers);
  return NextResponse.json(result);
}

// POST: Add new lawyer
export async function POST(req: NextRequest) {
  const { name, email, phone } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }
  try {
    const inserted = await db.insert(lawyers).values({ name, email, phone });
    return NextResponse.json({ success: true, lawyer: inserted });
  } catch (err) {
    return NextResponse.json({ error: "Could not add lawyer", details: String(err) }, { status: 500 });
  }
}

// PUT: Update lawyer
export async function PUT(req: NextRequest) {
  const { id, name, email, phone } = await req.json();
  if (!id || !name || !email) {
    return NextResponse.json({ error: "Id, name, and email required" }, { status: 400 });
  }
  try {
    await db.update(lawyers).set({ name, email, phone }).where(eq(lawyers.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not update lawyer", details: String(err) }, { status: 500 });
  }
}

// DELETE: Remove lawyer
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Id required" }, { status: 400 });
  }
  try {
    await db.delete(lawyers).where(eq(lawyers.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not delete lawyer", details: String(err) }, { status: 500 });
  }
}