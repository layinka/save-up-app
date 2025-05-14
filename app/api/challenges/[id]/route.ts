import { NextRequest, NextResponse } from 'next/server';
import { validateFrameMessage } from '@/lib/auth';
import { Challenge } from '@/entities/Challenge';
import { Participant } from '@/entities/Participant';
import { getEm, withRequestContext } from '@/lib/db';

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

      // Get participants from Participant table with their user details
      const participants = await em.find(Participant, {
          challenge: {
            id: challenge.id
          } 
        }, 
        {
          populate: ['user']
        });
      
      const participantsWithDetails = participants.map(participant => ({
        fid: participant.user.id,
        username: participant.user.username,
        displayName: participant.user.displayName,
        profilePictureUrl: participant.user.profilePictureUrl,
        amountContributed: participant.amountContributed,
        pfpUrl: participant.user.profilePictureUrl, // Use the actual profile picture URL
        currentAmount: participant.amountContributed
      }));

      // Return challenge with participant details
      return NextResponse.json({
        ...challenge,
        participants: participantsWithDetails,
        // currentAmount: 0, // TODO: Calculate from actual savings
      });
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}
