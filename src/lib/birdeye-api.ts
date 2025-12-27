import {
  BirdeyeTokenPrice,
  BirdeyeTokenOverview,
  BirdeyeTokenListResponse,
} from '@/types/token';

const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

/**
 * Birdeye API client for fetching token data
 */
export class BirdeyeAPI {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = BIRDEYE_BASE_URL;
  }

  /**
   * Get token price by address
   */
  async getTokenPrice(tokenAddress: string): Promise<BirdeyeTokenPrice> {
    const response = await fetch(
      `${this.baseURL}/v1/token/price?address=${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get multiple token prices at once
   */
  async getMultiTokenPrice(
    addresses: string[]
  ): Promise<Record<string, BirdeyeTokenPrice>> {
    const listAddress = addresses.join(',');
    const response = await fetch(
      `${this.baseURL}/v1/token/multi_price?list_address=${listAddress}`,
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   *  Get full token data
   */
  async getTokenOverview(tokenAddress: string): Promise<BirdeyeTokenOverview> {
    const response = await fetch(
      `${this.baseURL}/v1/token/overview?address=${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': this.apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get token list
   */
  async getTokenList(params: {
    chain?: string;
    sort_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<BirdeyeTokenListResponse> {
    // Build query params - sort_by is not supported by the API endpoint
    const queryParams = new URLSearchParams({
      chain: params.chain || 'solana',
      limit: String(params.limit || 50),
      offset: String(params.offset || 0),
    });

    // The /defi/tokenlist endpoint works (verified via curl)
    // Use it as the primary endpoint
    const url = `${this.baseURL}/defi/tokenlist?${queryParams}`;
    console.log('Fetching from Birdeye API:', url);

    try {
      const response = await fetch(url, {
        headers: {
          'X-API-KEY': this.apiKey,
        },
      });

      const responseText = await response.text();
      const contentType = response.headers.get('content-type');

      // If we got HTML, the endpoint is wrong or API key is invalid
      if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
        console.error('Birdeye API returned HTML (documentation page)');
        throw new Error('Birdeye API returned HTML. Check API key validity.');
      }

      // Check if response is JSON
      if (contentType && contentType.includes('application/json')) {
        if (!response.ok) {
          // Handle rate limiting (429)
          if (response.status === 429) {
            const errorMsg = 'Rate limit exceeded. Please wait before making more requests.';
            console.warn(errorMsg);
            throw new Error(errorMsg);
          }
          
          // Handle bad request (400) - might be invalid parameters
          if (response.status === 400) {
            try {
              const errorData = JSON.parse(responseText);
              const errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
              console.error('Birdeye API 400 error:', errorMsg);
              console.error('Request URL:', url);
              console.error('Request params:', { chain: params.chain, limit: params.limit, offset: params.offset });
              throw new Error(`Bad request: ${errorMsg}`);
            } catch {
              console.error('Birdeye API 400 error (non-JSON):', responseText.substring(0, 200));
              console.error('Request URL:', url);
              throw new Error(`Bad request - check API parameters. Response: ${responseText.substring(0, 100)}`);
            }
          }
          
          try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
          } catch {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        }
        
        // Parse and return JSON
        try {
          return JSON.parse(responseText);
        } catch {
          throw new Error('Failed to parse JSON response from Birdeye API');
        }
      }

      // If not JSON and not HTML, might be an error message
      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Should not reach here, but handle gracefully
      throw new Error('Unexpected response from Birdeye API');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error fetching from Birdeye API');
    }
  }
}

/**
 * Get Birdeye API instance
 */
let birdeyeAPIInstance: BirdeyeAPI | null = null;

export function getBirdeyeAPI(): BirdeyeAPI {
  if (!birdeyeAPIInstance) {
    const apiKey =
      process.env.BIRD_EYE_API_KEY
    if (!apiKey) {
      throw new Error(
        'BIRD_EYE_API_KEY environment variable is not set'
      );
    }
    birdeyeAPIInstance = new BirdeyeAPI(apiKey);
  }
  return birdeyeAPIInstance;
}

