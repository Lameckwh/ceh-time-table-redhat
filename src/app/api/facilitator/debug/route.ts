import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient());

// GET: Get the current database state
export async function GET() {
  const state = await prisma.facilitatorState.findMany();
  return NextResponse.json({
    records: state,
    count: state.length,
    timestamp: new Date().toISOString()
  });
}

// POST: Reset facilitator state
export async function POST(request: Request) {
  const body = await request.json();
  const resetIndex = body.index ?? 0;
  
  // Delete all existing records
  await prisma.facilitatorState.deleteMany({});
  
  // Create new state
  const newState = await prisma.facilitatorState.create({
    data: { index: resetIndex }
  });
  
  return NextResponse.json({
    message: 'State reset successful',
    newState,
    timestamp: new Date().toISOString()
  });
}

// DELETE: Clear all facilitator states
export async function DELETE() {
  const deleted = await prisma.facilitatorState.deleteMany({});
  
  return NextResponse.json({
    message: 'All states cleared',
    deletedCount: deleted.count,
    timestamp: new Date().toISOString()
  });
}
