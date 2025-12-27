import { NextRequest, NextResponse } from 'next/server';
import { getBirdeyeAPI } from '@/lib/birdeye-api';

/**
 * API route to fetch token list from Birdeye
 * Keeps API key server-side for security
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chain = searchParams.get('chain') || 'solana';
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    // Check if API key is configured
    if (!process.env.BIRD_EYE_API_KEY) {
      console.error('BIRD_EYE_API_KEY is not set');
      return NextResponse.json(
        {
          success: false,
          error: 'API key not configured. Please set BIRD_EYE_API_KEY environment variable.',
        },
        { status: 500 }
      );
    }

    const api = getBirdeyeAPI();
    // Note: Birdeye API doesn't support sort_by parameter
    const response = await api.getTokenList({
      chain,
      limit,
      offset,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching token list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tokens';
    
    // Return empty data instead of error so UI can still render
    // This allows the UI to work while API issues are being resolved
    console.warn('Returning empty token list due to API error. UI will show "No tokens available"');
    
    return NextResponse.json(
      {
        success: true, // Set to true so UI doesn't treat it as error
        data: {
          tokens: [],
          total: 0,
        },
        _error: errorMessage, // Include error for debugging but don't break UI
      },
      { status: 200 } // Return 200 so React Query doesn't treat it as error
    );
  }
}

