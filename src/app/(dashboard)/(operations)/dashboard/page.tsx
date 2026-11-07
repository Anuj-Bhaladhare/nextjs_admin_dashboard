"use client";   

import React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { increment, decrement, reset } from "@/redux/slices/counterSlice";

const Dashboard = () => {

    const dispatch = useAppDispatch();
    const count: number = useAppSelector( (state) => state.counter );

    const handlerIncrement = () => {
        dispatch(increment());
    }

    const handlerDecrement = () => {
        dispatch(decrement());
    }
    
    return (
        <div>
            <div>Dashboard</div>

            <button onClick={() => handlerDecrement()}>----</button>
            <h1> {count} </h1>
            <button onClick={() => handlerIncrement()}>+++++</button>


        </div>
    )
}

export default Dashboard;
