import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './slices/tokenSlice';
import uiReducer from './slices/uiSlice';
import sortReducer from './slices/sortSlice';

export const store = configureStore({
  reducer: {
    tokens: tokenReducer,
    ui: uiReducer,
    sort: sortReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['tokens/updateTokenPrice'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.data.timestamp'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

