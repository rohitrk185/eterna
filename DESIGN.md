# Design Decisions Documentation

This document explains the key design decisions and architectural choices made in the Eterna Pulse application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Data Fetching Strategy](#data-fetching-strategy)
4. [Real-Time Updates](#real-time-updates)
5. [Performance Optimizations](#performance-optimizations)
6. [Component Architecture](#component-architecture)
7. [API Design](#api-design)
8. [Build & Deployment](#build--deployment)

---

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit + React Query
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Real-Time**: WebSocket (with mock fallback)

---

## State Management

### Redux Store Structure

```typescript
{
  tokens: {
    tokens: Token[],
    priceUpdates: Record<string, number>,
    loading: boolean,
    error: string | null
  },
  ui: {
    isModalOpen: boolean,
    selectedToken: Token | null,
    isPopoverOpen: boolean,
    popoverToken: Token | null,
    hoveredToken: Token | null
  },
  sort: {
    sortConfigs: Record<TokenCategory, SortConfig>
  }
}
```

### Design Decisions

1. **Separate UI State from Data State**
   - UI state (modals, popovers) is separate from token data
   - Allows independent updates without affecting data layer
   - Easier to test and maintain

2. **Price Updates in Separate Map**
   - `priceUpdates` is a separate map keyed by token address
   - Enables efficient price updates without re-rendering entire token list
   - Supports price animation logic

3. **Per-Column Sort Configuration**
   - Each column (category) has its own sort configuration
   - Users can sort different columns independently
   - Stored in Redux for persistence across re-renders

---

## Data Fetching Strategy

### Single API Call Pattern

```typescript
// Only ONE API call is made
const tokensQuery = useTokenData({
  limit: 50,
  enabled: true,
});
```

**Decision**: Fetch all tokens in a single API call, then distribute them across categories client-side.

**Why?**
- Birdeye API doesn't support category filtering
- Reduces API rate limiting issues
- Faster initial load (one request vs. three)
- Simpler error handling

### React Query Configuration

```typescript
{
  staleTime: 60 * 1000,        // Data fresh for 60 seconds
  gcTime: 5 * 60 * 1000,       // Cache for 5 minutes
  retry: 1,                     // Retry once on failure
  refetchOnWindowFocus: false,  // WebSocket handles updates
}
```

**Design Rationale**:
- `staleTime: 60s`: Initial data stays fresh while WebSocket connects
- `refetchOnWindowFocus: false`: WebSocket provides real-time updates, no need to refetch
- `retry: 1`: Balance between reliability and user experience

### Data Flow

```
1. Component mounts → useTokenData hook called
2. React Query fetches from /api/tokens/list
3. API route calls Birdeye API (server-side, keeps API key secure)
4. Data mapped from Birdeye format to internal Token format
5. Redux store updated with all tokens
6. Components read from Redux store (not React Query return value)
```

**Why update Redux instead of using React Query data directly?**
- WebSocket updates need to modify the same data structure
- Multiple components need access to the same token list
- Consistent state management across the app

---

## Real-Time Updates

### WebSocket Architecture

```
WebSocketConnector (deferred load)
  ↓
useWebSocket hook
  ↓
websocket-factory (mock or real)
  ↓
MockWebSocket / Native WebSocket
```

### Mock WebSocket for Development

**Decision**: Use a mock WebSocket in development to:
- Avoid rate limiting during development
- Work offline
- Generate realistic price movements for testing
- No dependency on external WebSocket service

**Implementation**: `MockWebSocket` class simulates:
- Connection lifecycle (connecting → open → close)
- Price updates using random walk algorithm
- Subscription/unsubscription messages
- Initial prices from Redux store (avoids API calls)

### Deferred WebSocket Connection

```typescript
// Loaded after initial render
const WebSocketConnector = dynamic(
  () => import('@/components/pulse/WebSocketConnector'),
  { ssr: false }
);
```

**Why defer?**
- Improves Largest Contentful Paint (LCP)
- Initial page render doesn't wait for WebSocket connection
- Better Lighthouse performance scores

### Price Update Flow

```
1. WebSocket receives price update message
2. useWebSocket hook dispatches updateTokenPrice action
3. Redux store updates priceUpdates map
4. TokenCard components re-render with new prices
5. usePriceAnimation hook animates price changes
```

---

## Performance Optimizations

### Code Splitting

**Dynamic Imports**:
- `TokenModalProvider`: Loaded after initial render
- `WebSocketConnector`: Deferred to improve LCP

**Why?**
- Modal and WebSocket aren't needed for initial page render
- Reduces initial JavaScript bundle size
- Improves Time to Interactive (TTI)

### Component Optimization

**Memoization Strategy**:
```typescript
// TokenCard uses memo + useCallback + useMemo
const TokenCard = memo(({ token }) => {
  const handleClick = useCallback(() => {...}, [dispatch, token]);
  const priceChangeColor = useMemo(() => {...}, [token.priceChange24h]);
});
```

**Why?**
- Prevents unnecessary re-renders when parent updates
- Reduces Total Blocking Time (TBT)
- Better main-thread performance

### Image Optimization

```typescript
<Image
  src={token.imageUrl}
  sizes="32px"
  loading="lazy"
  onError={handleImageError}
/>
```

**Decisions**:
- `sizes="32px"`: Tells Next.js the display size for optimization
- `loading="lazy"`: Defer off-screen images
- Error handling: Fallback to token symbol initials

### Font Loading

```typescript
const geistSans = localFont({
  display: "swap",  // Prevents FOIT (Flash of Invisible Text)
  preload: true,    // Preloads font for faster rendering
});
```

**Why `display: swap`?**
- Shows fallback font immediately
- Prevents layout shift when font loads
- Better Core Web Vitals scores

### Build Optimizations

**Browserslist Configuration**:
```json
{
  "production": [
    "chrome >= 90",
    "firefox >= 88",
    "safari >= 14",
    "edge >= 90"
  ]
}
```

**Why target modern browsers?**
- Removes 11 KiB of legacy JavaScript polyfills
- Smaller bundle size
- Better performance
- Modern browsers support all features we use

**Package Import Optimization**:
```javascript
experimental: {
  optimizePackageImports: [
    '@radix-ui/react-popover',
    '@radix-ui/react-dialog',
    // ...
  ]
}
```

**Why?**
- Tree-shakes unused exports from large UI libraries
- Reduces bundle size significantly
- Faster load times

---

## Component Architecture

### Component Hierarchy

```
PulsePage (client component)
├── TokenColumn (x3) - client component
│   ├── ColumnHeader - client component
│   └── TokenCard (xN) - client component
│       └── TokenPopover - client component
├── TokenModalProvider - lazy loaded
└── WebSocketConnector - lazy loaded
```

### Why All Client Components?

**Decision**: Main page and components are client components (`'use client'`)

**Reasons**:
1. **Redux Integration**: Components use `useAppSelector` and `useAppDispatch`
2. **React Query**: Uses `useQuery` hook
3. **Real-time Updates**: WebSocket requires client-side connection
4. **Interactivity**: Sorting, filtering, modals all require client-side state

**Trade-off**: Larger initial JavaScript bundle, but necessary for functionality.

### Component Patterns

**Container/Presentational Pattern**:
- `PulsePage`: Container (data fetching, state management)
- `TokenColumn`: Presentational (receives props, handles display)
- `TokenCard`: Presentational (displays token data)

**Compound Components**:
- `TokenPopover` wraps `TokenCard` for hover interactions
- Keeps popover logic separate from card display logic

---

## API Design

### Server-Side API Routes

**Why Next.js API Routes?**
- Keep Birdeye API key server-side (security)
- Avoid CORS issues
- Can add caching/rate limiting in the future
- Single point of failure handling

**API Endpoints**:
- `/api/tokens/list`: Fetches token list from Birdeye
- `/api/token/price`: Fetches individual token price (not currently used, WebSocket handles this)

### Error Handling Strategy

```typescript
// API route returns 200 with empty data on error
return NextResponse.json(
  {
    success: true,
    data: { tokens: [] },
    _error: errorMessage, // For debugging
  },
  { status: 200 }
);
```

**Why return 200 on error?**
- UI can still render (shows "No tokens available")
- React Query doesn't treat it as an error
- Better user experience than error screen
- Error message included for debugging

---

## Build & Deployment

### Next.js Configuration

**Production Optimizations**:
- `swcMinify: true`: Faster minification
- `productionBrowserSourceMaps: false`: Smaller bundle
- `compress: true`: Gzip compression
- `removeConsole`: Removes console.log in production

**Caching Strategy**:
```javascript
headers: {
  '/_next/static/:path*': {
    'Cache-Control': 'public, max-age=31536000, immutable'
  }
}
```

**Why?**
- Static assets can be cached forever (they have content hashes)
- Reduces bandwidth and improves repeat visit performance

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"]
  }
}
```

**Why ES2020?**
- Modern JavaScript features without transpilation
- Smaller bundle (no polyfills for modern features)
- Better performance

---

## Trade-offs & Future Considerations

### Current Trade-offs

1. **All Client Components**: Larger bundle, but necessary for Redux/WebSocket
2. **Single API Call**: Simpler, but means we fetch all tokens even if only viewing one category
3. **Mock WebSocket**: Great for development, but different from production behavior
4. **Redux + React Query**: More complexity, but better separation of concerns

### Future Improvements

1. **Server Components**: Could move static parts (header, layout) to server components
2. **Incremental Static Regeneration**: Pre-render token list at build time, update periodically
3. **Service Worker**: Cache token data for offline support
4. **Virtual Scrolling**: For large token lists (currently paginated)
5. **Optimistic Updates**: Update UI immediately, sync with server later

---

## Performance Metrics

### Target Metrics

- **Lighthouse Performance**: >90
- **First Contentful Paint (FCP)**: <1.8s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Total Blocking Time (TBT)**: <200ms
- **Cumulative Layout Shift (CLS)**: <0.1

### Optimizations Applied

- ✅ Font display: swap
- ✅ Image lazy loading
- ✅ Code splitting
- ✅ Modern browser targeting
- ✅ Package import optimization
- ✅ Memoization of components
- ✅ Deferred WebSocket connection

---

## Conclusion

This architecture prioritizes:
1. **Performance**: Fast initial load, optimized rendering
2. **Developer Experience**: Type safety, clear patterns
3. **User Experience**: Real-time updates, smooth interactions
4. **Maintainability**: Clear separation of concerns, testable code

The hybrid approach (Redux + React Query) provides the best of both worlds: powerful state management for complex UI state and excellent server state management with caching and refetching.

