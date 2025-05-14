import { NextRequest, NextResponse } from 'next/server';
import { validateFrameMessage } from '@/lib/auth';
import { Challenge } from '@/entities/Challenge';
import { User } from '@/entities/User';
import { Participant } from '@/entities/Participant';
import { getEm, withRequestContext } from '@/lib/db';
import { z } from 'zod';

const addParticipantSchema = z.object({
  fid: z.number(),
  username: z.string(),
  displayName: z.string(),
  profilePictureUrl: z.string(),
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

    const { fid, username, displayName, profilePictureUrl } = validationResult.data;

    return await withRequestContext(async () => {
      const em = await getEm();
      const challenge = await em.findOne(Challenge, { id: parseInt(params.id, 10) });

      if (!challenge) {
        return NextResponse.json(
          { error: 'Challenge not found' },
          { status: 404 }
        );
      }

      // Check if user is already a participant
      const existingParticipant = await em.findOne(Participant, {
        userId: Number(fid),
        challengeId: challenge.id
      });

      if (existingParticipant) {
        return NextResponse.json(
          { error: 'User is already a participant' },
          { status: 400 }
        );
      }

      // Find or create user
      let user = await em.findOne(User, { id: Number(fid) });
      
      if (!user) {
        user = new User(Number(fid), username, displayName, profilePictureUrl);
        em.persist(user);
      }

      // Create new participant
      const participant = em.create(Participant, {
        userId: Number(fid),
        challengeId: challenge.id,
        user,
        challenge,
        amountContributed: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      

      em.persist(participant);
      await em.flush();

      return NextResponse.json(
        { message: 'Successfully joined challenge' },
        { status: 200 }
      );
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
      const participants = await em.find(Participant, { challengeId: challenge.id }, {
        populate: ['user']
      });

      return NextResponse.json(
        {
          participants: participants.map((p) => ({
            userId: p.userId,
            username: p.user.username,
            displayName: p.user.displayName,
            profilePictureUrl: p.user.profilePictureUrl,
            amountContributed: p.amountContributed
          })),
        },
        { status: 200 }
      );
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
