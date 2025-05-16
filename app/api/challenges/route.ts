import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Challenge } from '@/entities/Challenge';
import { User } from '@/entities/User';
import { Participant } from '@/entities/Participant';
import { getEm, withRequestContext } from '@/lib/db';
import { validateFrameMessage, AuthenticatedRequest } from '@/lib/auth';
import { createPublicClient, decodeEventLog, http } from 'viem';
import { base } from 'wagmi/chains';

// Zod schema for validating the request body (can remain largely the same)
const createChallengeSchema = z.object({
  // User fields
  challengeId: z.number(),
  username: z.string().optional(),
  displayName: z.string().optional(),
  profilePictureUrl: z.string().optional(),
  // Challenge fields
  name: z.string().min(3, { message: "Challenge name must be at least 3 characters long" }).max(256),
  description: z.string().optional(),
  goalAmount: z.number().int().positive({ message: "Goal amount must be a positive integer" }),
  targetDate: z.string().datetime().optional(), // Expect ISO 8601 string
  creatorFid: z.string().optional(),
  // Blockchain fields
  transactionHash: z.string().optional(),
});

async function handleCreateChallenge(request: AuthenticatedRequest) {
  const em = await getEm(); // Get the EntityManager
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createChallengeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }

    // Create a public client to interact with the blockchain
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const receipt = await publicClient.getTransactionReceipt({ hash: '0x0'});
    console.log('Transaction receipt received:', receipt, receipt.logs)
    
    // Define ChallengeCreated event ABI
    const challengeCreatedABI = [
      {
        type: 'event',
        name: 'ChallengeCreated',
        inputs: [
          { name: 'id', type: 'uint256', indexed: true },
          { name: 'creator', type: 'address', indexed: true },
          { name: 'targetAmount', type: 'uint256', indexed: false },
          { name: 'endTime', type: 'uint256', indexed: false }
        ]
      }
    ] as const;

    // Extract challenge ID from transaction receipt
    const challengeEvent = receipt.logs
      .map((log) => {
        try {
          const decoded = decodeEventLog({
            abi: challengeCreatedABI,
            data: log.data,
            topics: log.topics
          });
          return decoded.eventName === 'ChallengeCreated' ? decoded.args : null;
        } catch {
          return null;
        }
      })
      .find((args) => args !== null);

    console.log('Challenge event:', challengeEvent)

    const {challengeId, name, description, goalAmount, targetDate, username, displayName, profilePictureUrl, transactionHash } = validationResult.data;
    const creatorFid = request.fid;
    if (!creatorFid) {
      return NextResponse.json({ error: 'Creator FID is required' }, { status: 400 });
    }

    // Find or create user
    let user = await em.findOne(User, { id: Number(creatorFid) });
    
    if (!user) {
      user = new User(Number(creatorFid), username ?? '', displayName ?? '', profilePictureUrl ?? '');
      em.persist(user);
    }

    // Create challenge
    const challenge = em.create(Challenge, {
      id: challengeId,
      name,
      description: description ?? null, // Ensure null if undefined
      goalAmount,
      targetDate: targetDate ? new Date(targetDate) : null,
      creator: user,
      totalAmountContributed: 0,
      transactionHash: transactionHash ?? null
    });

    // Create participant entry for creator
    const participant = em.create(Participant, {
      // userId: Number(creatorFid),
      // challengeId: challenge.id,
      user,
      challenge,
      amountContributed: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    em.persist(participant);
    await em.flush(); // Save to database
    
    return NextResponse.json(challenge, { status: 201 }); // Return the created challenge
  } catch (error) {
    console.error('Error creating challenge:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { isValid, fid } = await validateFrameMessage(request);
  
  if (!isValid || !fid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // const fid = request.headers.get('fid');

  const authenticatedRequest = request as AuthenticatedRequest;
  authenticatedRequest.fid = fid ? +fid : undefined;

  return await withRequestContext(async () => await handleCreateChallenge(authenticatedRequest));
}

// --- GET Handler --- 
async function handleGetChallenges(userId?: number) {
   // Create a public client to interact with the blockchain
   const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: '0x7c6da4af6395a9c3518527a8198b83c980636dc81d76bad19772dfd21f9de50c'});
    console.log('Transaction receipt received:', receipt, receipt.logs)
    
    // Define ChallengeCreated event ABI
    const challengeCreatedABI = [
      {
        type: 'event',
        name: 'ChallengeCreated',
        inputs: [
          { name: 'id', type: 'uint256', indexed: true },
          { name: 'creator', type: 'address', indexed: true },
          { name: 'targetAmount', type: 'uint256', indexed: false },
          { name: 'endTime', type: 'uint256', indexed: false }
        ]
      }
    ] as const;

    // Extract challenge ID from transaction receipt
    const challengeEvent = receipt.logs
      .map((log) => {
        try {
          const decoded = decodeEventLog({
            abi: challengeCreatedABI,
            data: log.data,
            topics: log.topics
          });
          return decoded.eventName === 'ChallengeCreated' ? decoded.args : null;
        } catch {
          return null;
        }
      })
      .find((args) => args !== null);

    console.log('Challenge event:', challengeEvent)



    
  const em = await getEm(); // Get the EntityManager
  try {
    // Find challenges based on user participation
    if (userId) {
      const participants = await em.find(Participant, { user: { id: userId } }, {
        populate: ['challenge']
      });
      const userChallenges = participants.map(p => p.challenge);
      return NextResponse.json(userChallenges);
    } else {
      // If no user specified, fetch all challenges
      const challenges = await em.find(Challenge, {});
      return NextResponse.json(challenges);
    }
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Temporarily disable frame message validation
  // const { isValid, fid } = await validateFrameMessage(request);
  // if (!isValid || !fid) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  // Get FID from headers
  const fidHeader = request.headers.get('fid');
  const fid = fidHeader ? Number(fidHeader) : undefined;

  return await withRequestContext(async () => await handleGetChallenges(fid));
}