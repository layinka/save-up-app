import { NextRequest, NextResponse } from 'next/server';
import { validateFrameMessage } from '@/lib/auth';
import { Challenge } from '@/entities/Challenge';
import { getEm, withRequestContext } from '@/lib/db';
import { z } from 'zod';

const addParticipantSchema = z.object({
  fid: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate Farcaster Frame message in production
  if (process.env.NODE_ENV === 'production') {
    const { isValid, fid } = await validateFrameMessage(request);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const validationResult = addParticipantSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { fid } = validationResult.data;

    return await withRequestContext(async () => {
      const em = await getEm();
      const challenge = await em.findOne(Challenge, { id: parseInt(params.id, 10) });

      if (!challenge) {
        return NextResponse.json(
          { error: 'Challenge not found' },
          { status: 404 }
        );
      }

      // Add participant to the challenge
      // TODO: Create a proper Participant entity and handle the relationship
      challenge.participants = challenge.participants || [];
      if (!challenge.participants.includes(fid)) {
        challenge.participants.push(fid);
      }

      await em.flush();

      return NextResponse.json({ success: true });
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate Farcaster Frame message in production
  if (process.env.NODE_ENV === 'production') {
    const { isValid, fid } = await validateFrameMessage(request);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    return await withRequestContext(async () => {
      const em = await getEm();
      const challenge = await em.findOne(Challenge, { id: parseInt(params.id, 10) });

      if (!challenge) {
        return NextResponse.json(
          { error: 'Challenge not found' },
          { status: 404 }
        );
      }

      // TODO: Fetch actual participant data from Farcaster API
      const participants = challenge.participants || [];

      return NextResponse.json(participants);
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
