import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Token, WebSocketPriceUpdate } from '@/types/token';

interface TokenState {
  tokens: Token[];
  priceUpdates: Record<string, number>; // address -> latest price
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null;
}

const initialState: TokenState = {
  tokens: [],
  priceUpdates: {},
  isLoading: false,
  error: null,
  lastUpdate: null,
};

const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<Token[]>) => {
      state.tokens = action.payload;
      state.isLoading = false;
      state.error = null;
      state.lastUpdate = Date.now();
    },
    addToken: (state, action: PayloadAction<Token>) => {
      const existingIndex = state.tokens.findIndex(
        (t) => t.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.tokens[existingIndex] = action.payload;
      } else {
        state.tokens.push(action.payload);
      }
    },
    updateTokenPrice: (state, action: PayloadAction<WebSocketPriceUpdate>) => {
      const { address, price } = action.payload.data;
      
      // Update price in priceUpdates map
      state.priceUpdates[address] = price;
      
      // Update price in token object if it exists
      const token = state.tokens.find((t) => t.address === address);
      if (token) {
        const oldPrice = token.price;
        token.price = price;
        
        // Calculate price change if we have old price
        if (oldPrice > 0) {
          token.priceChange24h = ((price - oldPrice) / oldPrice) * 100;
        }
      }
      
      state.lastUpdate = Date.now();
    },
    updateMultipleTokenPrices: (
      state,
      action: PayloadAction<Record<string, number>>
    ) => {
      Object.entries(action.payload).forEach(([address, price]) => {
        state.priceUpdates[address] = price;
        
        const token = state.tokens.find((t) => t.address === address);
        if (token) {
          const oldPrice = token.price;
          token.price = price;
          
          if (oldPrice > 0) {
            token.priceChange24h = ((price - oldPrice) / oldPrice) * 100;
          }
        }
      });
      
      state.lastUpdate = Date.now();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    removeToken: (state, action: PayloadAction<string>) => {
      state.tokens = state.tokens.filter((t) => t.id !== action.payload);
      delete state.priceUpdates[action.payload];
    },
    clearTokens: (state) => {
      state.tokens = [];
      state.priceUpdates = {};
      state.lastUpdate = null;
    },
  },
});

export const {
  setTokens,
  addToken,
  updateTokenPrice,
  updateMultipleTokenPrices,
  setLoading,
  setError,
  removeToken,
  clearTokens,
} = tokenSlice.actions;

export default tokenSlice.reducer;

