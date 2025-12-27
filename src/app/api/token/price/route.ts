import { NextRequest, NextResponse } from 'next/server';

const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

/**
 * API route to proxy Birdeye token price requests
 * Keeps API key server-side for security
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Token address is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.BIRD_EYE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/v1/token/price?address=${address}`,
      {
        headers: {
          'X-API-KEY': apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Birdeye API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching token price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token price' },
      { status: 500 }
    );
  }
}

