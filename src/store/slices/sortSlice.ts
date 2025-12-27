import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortConfig, SortField, TokenCategory } from '@/types/token';

interface SortState {
  // Per-column sorting configuration
  sortConfigs: Record<TokenCategory, SortConfig>;
}

const defaultSortConfig: SortConfig = {
  field: 'timeAgo',
  direction: 'desc',
};

const initialState: SortState = {
  sortConfigs: {
    'new-pairs': defaultSortConfig,
    'final-stretch': defaultSortConfig,
    migrated: defaultSortConfig,
  },
};

const sortSlice = createSlice({
  name: 'sort',
  initialState,
  reducers: {
    setSortConfig: (
      state,
      action: PayloadAction<{
        category: TokenCategory;
        config: SortConfig;
      }>
    ) => {
      state.sortConfigs[action.payload.category] = action.payload.config;
    },
    setSortField: (
      state,
      action: PayloadAction<{
        category: TokenCategory;
        field: SortField;
      }>
    ) => {
      const currentConfig = state.sortConfigs[action.payload.category];
      
      // If clicking the same field, toggle direction
      if (currentConfig.field === action.payload.field) {
        currentConfig.direction =
          currentConfig.direction === 'asc' ? 'desc' : 'asc';
      } else {
        // New field, default to descending
        currentConfig.field = action.payload.field;
        currentConfig.direction = 'desc';
      }
    },
    resetSort: (state, action: PayloadAction<TokenCategory>) => {
      state.sortConfigs[action.payload] = defaultSortConfig;
    },
    resetAllSorts: (state) => {
      state.sortConfigs = {
        'new-pairs': defaultSortConfig,
        'final-stretch': defaultSortConfig,
        migrated: defaultSortConfig,
      };
    },
  },
});

export const { setSortConfig, setSortField, resetSort, resetAllSorts } =
  sortSlice.actions;

export default sortSlice.reducer;

