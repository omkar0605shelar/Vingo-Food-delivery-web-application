import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: [],
    itemsInMyCity: [],
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
  },

  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setState: (state, action) => {
      state.currentState = action.payload;
    },
    setAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    setAddToCart: (state, action) => {
      const cartItem = action.payload;

      state.cartItems ??= [];

      const existingItem = state.cartItems.find((i) => i._id === cartItem._id);

      if (existingItem) {
        existingItem.quantity += cartItem.quantity || 1;
      } else {
        state.cartItems.push({
          ...cartItem,
          quantity: cartItem.quantity || 1,
        });
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },

    setUpdateQuantity: (state, action) => {
      const { id, quantity } = action.payload;

      state.cartItems ??= [];

      const item = state.cartItems.find((i) => i._id === id);

      if (item) {
        item.quantity = Math.max(1, quantity);
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },

    setRemoveCartItem: (state, action) => {
      state.cartItems ??= [];

      state.cartItems = state.cartItems.filter((i) => i._id !== action.payload);

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },
    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },
    setAddMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders];
    },
    setUpdateOrderStatus: (state, action) => {
      const { orderId, shopId, status, availableBoys } = action.payload;

      const order = state.myOrders.find((o) => o._id === orderId);
      if (!order) return;

      // Update the shopOrder status
      const shopOrder = order.shopOrders.find((s) => s.shop._id === shopId);
      if (shopOrder) shopOrder.status = status;

      // Merge/update availableBoys for this order
      order.availableBoys = {
        ...(order.availableBoys || {}),
        ...availableBoys, // availableBoys should already be { [shopId]: [...] }
      };
    },
  },
});

export const {
  setUserData,
  setCity,
  setState,
  setAddress,
  setShopInMyCity,
  setItemsInMyCity,
  setAddToCart,
  setUpdateQuantity,
  setRemoveCartItem,
  setMyOrders,
  setAddMyOrder,
  setUpdateOrderStatus,
} = userSlice.actions;

export default userSlice.reducer;
