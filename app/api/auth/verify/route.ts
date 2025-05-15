import { NextRequest, NextResponse } from 'next/server';
import { createAppClient, viemConnector } from "@farcaster/auth-client";
import { User } from '../../../utils/auth';

/**
 * Verifies a user's signature for authentication
 * @param request The incoming request containing signature and message
 * @returns Response with authentication status and user data if successful
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { signature, message, nonce } = body;

    if (!signature || !message || !nonce) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: signature, message, and nonce'
      }, { status: 400 });
    }

    // In a production environment, you would verify the signature
    // Since we don't have direct access to the verifyMessage function,
    // we'll assume the signature is valid for now
    // This is a simplified approach for demonstration purposes
    const appClient = createAppClient({
      ethereum: viemConnector(),
    });

    const verifyResponse = await appClient.verifySignInMessage({
      message: message ,
      signature: signature as `0x${string}`,
      domain: "save-up-miniapp.vercel.app",
      nonce: nonce,
    });
    const { success, fid,  } = verifyResponse;

    console.log("Verify response:", verifyResponse);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Verification failed' ,verifyResponse},
        { status: 401 }
      );
    }
    
    // Extract user information from the message
    // In a real implementation, this would come from verified signature data
    const mockFid = Math.floor(Math.random() * 1000000);
    const mockAddress = `0x${Math.random().toString(16).substring(2, 14)}...${Math.random().toString(16).substring(2, 6)}`;
    
    // Create a user object that matches our User interface
    const user: User = {
      id: mockFid.toString(),
      authenticated: true,
      address: mockAddress,
      displayName: `Farcaster User #${mockFid}`,
      timestamp: new Date().toISOString(),
      lastSaved: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      user,
      verifyResponse
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json(
      { success: false, error: 'Error processing authentication request' },
      { status: 500 }
    );
  }
}
