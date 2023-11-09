import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  models: {},
  data: {},
};
export const userSlicer = createSlice({
  name: "user",
  initialState,
  reducers: {
    addModels: (state, action) => {
      state.models = action.payload;
    },
  },
});
export const { addModels } = userSlicer.actions;

export default userSlicer.reducer;
