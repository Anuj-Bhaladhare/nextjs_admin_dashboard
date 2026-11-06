import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
    initialState: 0,
    name: "counter",
    reducers: {
        increment: (state) => state += 1,
        decrement: (state) => state -= 1,
        reset: (state) => state = 0
    }
});

// Action creators are generated for each case reducer function
export const { increment, decrement, reset } = counterSlice.actions
export default counterSlice.reducer
