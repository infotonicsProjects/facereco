import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slicer";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});
