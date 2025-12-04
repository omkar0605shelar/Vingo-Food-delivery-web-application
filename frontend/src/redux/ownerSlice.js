import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  myShopData: null,
};

const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {
    setMyShopData: (state, action) => {
      state.myShopData = action.payload;
    },

    addItemToShop: (state, action) => {
      if (state.myShopData) {
        state.myShopData.items.push(action.payload);
      }
    },

    updateShopItems: (state, action) => {
      if (state.myShopData) {
        state.myShopData.items = action.payload;
      }
    },

    updateSingleItem: (state, action) => {
      if (state.myShopData) {
        const index = state.myShopData.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.myShopData.items[index] = action.payload;
        }
      }
    },
  },
});

export const {
  setMyShopData,
  addItemToShop,
  updateShopItems,
  updateSingleItem,
} = ownerSlice.actions;
export default ownerSlice.reducer;
