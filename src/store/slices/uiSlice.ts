import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Token } from '@/types/token';

interface UIState {
  selectedToken: Token | null;
  isModalOpen: boolean;
  isPopoverOpen: boolean;
  popoverToken: Token | null;
  hoveredToken: Token | null;
}

const initialState: UIState = {
  selectedToken: null,
  isModalOpen: false,
  isPopoverOpen: false,
  popoverToken: null,
  hoveredToken: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<Token>) => {
      state.selectedToken = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.selectedToken = null;
    },
    openPopover: (state, action: PayloadAction<Token>) => {
      state.popoverToken = action.payload;
      state.isPopoverOpen = true;
    },
    closePopover: (state) => {
      state.isPopoverOpen = false;
      state.popoverToken = null;
    },
    setHoveredToken: (state, action: PayloadAction<Token | null>) => {
      state.hoveredToken = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
  openPopover,
  closePopover,
  setHoveredToken,
} = uiSlice.actions;

export default uiSlice.reducer;

