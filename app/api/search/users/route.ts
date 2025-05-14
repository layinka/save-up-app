import { NextRequest, NextResponse } from 'next/server';
import { validateFrameMessage } from '@/lib/auth';

// Mock data for development - replace with actual Farcaster API integration
const mockUsers = [
  {
    fid: '1',
    username: 'dwr',
    displayName: 'Dan Romero',
    pfpUrl: 'https://warpcast.com/~/avatar/dwr.jpg',
    amountSaved: 0
  },
  {
    fid: '2',
    username: 'varunsrin',
    displayName: 'Varun Srinivasan',
    pfpUrl: 'https://warpcast.com/~/avatar/varunsrin.jpg',
    amountSaved: 0
  },
  {
    fid: '3',
    username: 'vitalik',
    displayName: 'Vitalik Buterin',
    pfpUrl: 'https://warpcast.com/~/avatar/vitalik.jpg',
    amountSaved: 0
  }
];

export async function GET(request: NextRequest) {
  // Validate Farcaster Frame message in production
  if (process.env.NODE_ENV === 'production') {
    const { isValid, fid } = await validateFrameMessage(request);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase() || '';

  try {
    // TODO: Replace with actual Farcaster API call using neynar or similar
    // For now, filter mock data
    const results = mockUsers.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.displayName.toLowerCase().includes(query)
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
