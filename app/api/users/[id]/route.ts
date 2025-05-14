import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/entities/User';
import { getEm, withRequestContext } from '@/lib/db';
import { Participant } from '@/entities/Participant';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await withRequestContext(async () => {
      const em = await getEm();
      const userId = Number(params.id);

      // Find user and load their challenges
      const user = await em.findOne(User, { id: userId }, {
        // populate: ['participants', 'creator']
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Get challenges where user is either a participant or creator
      const challengesAsParticipant = await em.count(Participant, {
        user: { id: userId }
      });

      // const challengesAsCreator = await em.count(Participant, {
      //   user: { id: userId },
        
      // });

      // Total number of unique challenges
      const totalChallenges = challengesAsParticipant ; //+ challengesAsCreator;

      return NextResponse.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePictureUrl: user.profilePictureUrl,
        totalChallenges,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
