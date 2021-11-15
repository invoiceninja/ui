import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  authenticated: boolean;
}

const initialState: UserState = {
  authenticated: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
});
