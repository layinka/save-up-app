import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Challenge } from '@/entities/Challenge';
import { getEm, withRequestContext } from '@/lib/db';
import { withFarcasterAuth, AuthenticatedRequest } from '@/lib/auth';

// Zod schema for validating the request body (can remain largely the same)
const createChallengeSchema = z.object({
  name: z.string().min(3, { message: "Challenge name must be at least 3 characters long" }).max(256),
  description: z.string().optional(),
  goalAmount: z.number().int().positive({ message: "Goal amount must be a positive integer" }),
  targetDate: z.string().datetime().optional(), // Expect ISO 8601 string
  creatorFid: z.string().optional(),
});

export const POST = withFarcasterAuth(async (request: AuthenticatedRequest) => {
  // Wrap the handler logic in withRequestContext
  return withRequestContext(async () => {
    const em = await getEm(); // Get the EntityManager
    try {
      const body = await request.json();

      // Validate request body
      const validationResult = createChallengeSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json({ error: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
      }

      const { name, description, goalAmount, targetDate } = validationResult.data;

      // Create a new Challenge entity instance with authenticated user's FID
      const newChallenge = em.create(Challenge, {
        name,
        description: description ?? null, // Ensure null if undefined
        goalAmount,
        targetDate: targetDate ? new Date(targetDate) : null,
        creatorFid: request.fid?.toString() || '1',
        // currentAmount, participantsCount, createdAt, updatedAt have defaults or onUpdate
      });

      // Persist the new entity to the database
      await em.persistAndFlush(newChallenge);

      return NextResponse.json(newChallenge, { status: 201 }); // Return the created challenge

    } catch (error) {
      console.error("Error creating challenge:", error);
      if (error instanceof z.ZodError) {
          return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
  });
});

// --- GET Handler --- 
export const GET = withFarcasterAuth(async (request: AuthenticatedRequest) => {
  // Wrap the handler logic in withRequestContext
  return withRequestContext(async () => {
    const em = await getEm(); // Get the EntityManager
    try {
      // Fetch all challenges from the database
      const allChallenges = await em.find(Challenge, {}, { orderBy: { createdAt: 'ASC' } });

      return NextResponse.json(allChallenges);

    } catch (error) {
      console.error("Error fetching challenges:", error);
      return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
  });
});
