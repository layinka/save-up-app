import { NextRequest, NextResponse } from 'next/server';
import { validateFrameMessage } from '@/lib/auth';
import { Challenge } from '@/entities/Challenge';
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

      // Get participant details if available
      const participants = challenge.participants || [];
      
      // TODO: Fetch actual participant data from Farcaster API
      // For now, return mock data for participants
      const participantsWithDetails = participants.map(fid => ({
        fid,
        username: `user${fid}`,
        displayName: `User ${fid}`,
        pfpUrl: `https://warpcast.com/~/avatar/user${fid}.jpg`,
        currentAmount: 0 // TODO: Track individual savings
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
