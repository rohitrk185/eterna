// WebSocket types are defined in token.ts but not directly used here

/**
 * Mock WebSocket message interface
 */
export interface MockWebSocketMessage {
  type: 'price' | 'tx' | 'ohlcv';
  data: {
    address: string;
    price?: number;
    priceChange24h?: number;
    volume24h?: number;
    timestamp: number;
  };
}

/**
 * Mock WebSocket class that simulates real-time price updates
 * Fetches initial prices from Birdeye API and generates realistic price movements
 */
export class MockWebSocket {
  private url: string;
  private protocols?: string | string[];
  private readyState: number = WebSocket.CONNECTING;
  private messageQueue: MockWebSocketMessage[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private subscribedTokens: string[] = [];
  private tokenPrices: Map<string, number> = new Map();
  private priceHistory: Map<string, number[]> = new Map();
  private volatility: Map<string, number> = new Map();

  // Event handlers (WebSocket-like interface)
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;

  // WebSocket constants
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;

    // Simulate connection delay (100ms)
    setTimeout(() => {
      this.connect();
    }, 100);
  }

  private connect() {
    this.readyState = WebSocket.OPEN;

    // Trigger onopen event
    if (this.onopen) {
      this.onopen(new Event('open'));
    }

    // Start emitting price updates
    this.startPriceUpdates();
  }

  private startPriceUpdates() {
    const emitUpdate = () => {
      if (this.readyState !== WebSocket.OPEN) return;

      this.subscribedTokens.forEach((address) => {
        const currentPrice = this.tokenPrices.get(address) || 0;
        if (currentPrice === 0) return; // Skip if price not initialized

        const history = this.priceHistory.get(address) || [];
        const vol = this.volatility.get(address) || 0.02; // Default 2% volatility

        // Generate realistic price change using random walk
        const changePercent = this.generatePriceChange(vol);
        const newPrice = Math.max(0.000001, currentPrice * (1 + changePercent));

        // Update stored price
        this.tokenPrices.set(address, newPrice);

        // Update history (keep last 10 prices)
        history.push(newPrice);
        if (history.length > 10) history.shift();
        this.priceHistory.set(address, history);

        // Calculate 24h change (simulated based on history)
        const priceChange24h =
          history.length > 1
            ? ((newPrice - history[0]) / history[0]) * 100
            : changePercent * 100;

        // Create message
        const message: MockWebSocketMessage = {
          type: 'price',
          data: {
            address,
            price: newPrice,
            priceChange24h,
            volume24h: currentPrice * (1000 + Math.random() * 5000), // Simulated volume
            timestamp: Date.now(),
          },
        };

        // Emit message
        if (this.onmessage) {
          this.onmessage(
            new MessageEvent('message', {
              data: JSON.stringify(message),
            })
          );
        }
      });

      // Schedule next update (randomized between 1-3 seconds)
      const nextUpdateDelay = 1000 + Math.random() * 2000;
      this.intervalId = setTimeout(emitUpdate, nextUpdateDelay);
    };

    // Start first update after initial delay
    setTimeout(emitUpdate, 1000);
  }

  /**
   * Generate realistic price change using normal distribution
   */
  private generatePriceChange(volatility: number): number {
    // Use Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Apply volatility
    return z0 * volatility;
  }

  /**
   * Send message (handles subscription/unsubscription)
   */
  public send(data: string | ArrayBuffer | Blob) {
    if (this.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not open');
      return;
    }

    try {
      let message: { type?: string; channel?: string; tokens?: string[] };
      if (typeof data === 'string') {
        message = JSON.parse(data);
      } else {
        // For ArrayBuffer/Blob, convert to string first
        const textDecoder = new TextDecoder();
        const text = textDecoder.decode(data as ArrayBuffer);
        message = JSON.parse(text);
      }

      // Handle subscription messages
      if (message.type === 'subscribe' && message.channel === 'price') {
        this.subscribedTokens = message.tokens || [];

        // Initialize prices for subscribed tokens
        message.tokens?.forEach((address: string) => {
          if (!this.tokenPrices.has(address)) {
            // Fetch initial price from Birdeye API
            this.fetchInitialPrice(address);
            // Set volatility based on token (newer tokens = higher volatility)
            this.volatility.set(address, 0.01 + Math.random() * 0.05);
          }
        });
      }

      // Handle unsubscribe
      if (message.type === 'unsubscribe') {
        this.subscribedTokens = this.subscribedTokens.filter(
          (addr) => !message.tokens?.includes(addr)
        );
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Fetch initial price from Birdeye API via Next.js API route
   */
  private async fetchInitialPrice(address: string) {
    try {
      // Use Next.js API route to keep API key server-side
      const response = await fetch(`/api/token/price?address=${address}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const price = data.data?.value;
      
      if (price && price > 0) {
        this.tokenPrices.set(address, price);
      } else {
        throw new Error('Invalid price data');
      }
    } catch (error) {
      console.error(`Failed to fetch initial price for ${address}:`, error);
      // Fallback to random price if API fails
      const fallbackPrice = 0.01 + Math.random() * 100;
      this.tokenPrices.set(address, fallbackPrice);
    }
  }

  /**
   * Close WebSocket connection
   */
  public close(code?: number, reason?: string) {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }

    this.readyState = WebSocket.CLOSED;

    if (this.onclose) {
      this.onclose(
        new CloseEvent('close', {
          code: code || 1000,
          reason: reason || 'Normal closure',
        })
      );
    }
  }
}

