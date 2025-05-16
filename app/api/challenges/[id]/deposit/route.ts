import { NextRequest, NextResponse } from 'next/server';
import { getEm } from '@/lib/db';
import { Challenge } from '@/entities/Challenge';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { amount } = await request.json();

    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const challengeId = params.id;

    // Get the EntityManager
    const em = await getEm();

    // Find the challenge
    const challenge = await em.findOne(Challenge, { id: challengeId });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Update the challenge's current amount
    challenge.currentAmount += parseFloat(amount);

    // Persist the changes
    await em.flush();

    return NextResponse.json(challenge, { status: 200 });
  } catch (error) {
    console.error('Error updating challenge amount:', error);
    return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 });
  }
}
