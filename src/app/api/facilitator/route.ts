import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient());

// Update this if you add/remove members
const TEAM_LENGTH = 5;

// GET: Return the current facilitator index
export async function GET() {
  let state = await prisma.facilitatorState.findFirst();
  if (!state) {
    state = await prisma.facilitatorState.create({ data: { index: 0 } });
  }
  return NextResponse.json({ index: state.index });
}

// POST: Advance to the next facilitator
export async function POST() {
  const state = await prisma.facilitatorState.findFirst();
  console.log('Current state:', state);
  
  const newIndex = state ? (state.index + 1) % TEAM_LENGTH : 0;
  console.log('New index calculated:', newIndex);
  
  let updatedState;
  if (state) {
    updatedState = await prisma.facilitatorState.update({ 
      where: { id: state.id }, 
      data: { index: newIndex }
    });
  } else {
    updatedState = await prisma.facilitatorState.create({ 
      data: { index: newIndex }
    });
  }
  console.log('Updated state:', updatedState);
  
  return NextResponse.json({ 
    index: newIndex,
    previousIndex: state?.index ?? null,
    timestamp: new Date().toISOString()
  });
}
