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
    setLoadingRedux: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});
export const { addModels, setLoadingRedux } = userSlicer.actions;

export default userSlicer.reducer;
