import { NextRequest, NextResponse } from 'next/server';
import { getBirdeyeAPI } from '@/lib/birdeye-api';

/**
 * API route to fetch token list from Birdeye
 * Keeps API key server-side for security
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chain = searchParams.get('chain') || 'solana';
  const sortBy = searchParams.get('sort_by') || 'market_cap';
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    const api = getBirdeyeAPI();
    const response = await api.getTokenList({
      chain,
      sort_by: sortBy,
      limit,
      offset,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching token list:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tokens',
      },
      { status: 500 }
    );
  }
}

