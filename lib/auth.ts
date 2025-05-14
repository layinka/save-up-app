import { NextResponse } from 'next/server';
import { Message } from '@farcaster/core';
import { getSSLHubRpcClient } from '@farcaster/hub-nodejs';
// Development mode constants
const isDev = process.env.NODE_ENV === 'development';
const DEV_FID = '1'; // Default FID for development

const HUB_URL = process.env.FARCASTER_HUB_URL || 'nemes.farcaster.xyz:2283';

export interface AuthenticatedRequest extends Request {
  fid?: number;
}

export async function validateFrameMessage(request: Request): Promise<{ isValid: boolean; fid?: number }> {
  // In development mode, always return success with a test FID
  if (isDev) {
    const devFid = parseInt(process.env.DEV_FID || DEV_FID);
    console.log('🔧 Development mode: Using test FID:', devFid);
    return { isValid: true, fid: devFid };
  }
  
  try {
    const frameTrustedData = request.headers.get('fc-frame');
    if (!frameTrustedData) {
      return { isValid: false };
    }

    const messageBytes = Buffer.from(frameTrustedData, 'base64');
    const message = Message.decode(messageBytes);
    
    // Connect to Farcaster Hub to verify the message
    const client = getSSLHubRpcClient(HUB_URL);
    const validateResponse = await client.validateMessage(message);
    
    if (!validateResponse.isOk()) {
      return { isValid: false };
    }

    // Extract FID from the message
    const fid = message.data?.fid;
    return { isValid: true, fid: fid ?? undefined };
  } catch (error) {
    console.error('Error validating frame message:', error);
    return { isValid: false };
  }
}

export function withFarcasterAuth(handler: (request: AuthenticatedRequest) => Promise<Response>) {
  return async function GET(request: Request) {
    const { isValid, fid } = await validateFrameMessage(request);
    
    if (!isValid || !fid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add FID to the request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.fid = fid;

    return handler(authenticatedRequest);
  };
}
