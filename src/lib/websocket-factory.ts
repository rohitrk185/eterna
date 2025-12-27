import { MockWebSocket } from './websocket-mock';

/**
 * Factory function to create WebSocket (mock or real based on environment)
 */
export function createWebSocket(
  url: string,
  protocols?: string | string[]
): WebSocket {
  // Check if we should use mock (development or env variable)
  const useMock =
    process.env.NEXT_PUBLIC_USE_MOCK_WS === 'true' ||
    process.env.NODE_ENV === 'development';

  if (useMock) {
    // Use mock WebSocket
    return new MockWebSocket(url, protocols) as unknown as WebSocket;
  } else {
    // Use real WebSocket
    return new WebSocket(url, protocols);
  }
}

