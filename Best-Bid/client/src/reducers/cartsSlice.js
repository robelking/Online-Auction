import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";



const initialState = {
    cartItems: localStorage.getItem("cartItems") ? JSON.parse(localStorage.getItem("cartItems")) : [],
    cartTotalQuantity: 0,

};




const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action) {
            const itemIndex = state.cartItems.findIndex((item) => item._id === action.payload._id);
            console.log("itemIndex Start",itemIndex)
            if (itemIndex >= 0) {
                console.log("itemIndex If",itemIndex)
                    toast.info(`${action.payload.itemName} already exist `, {
                        position: "bottom-right"
                    }) 
            }
            else {
                console.log("itemIndex Else",itemIndex)
                const tempProduct = { ...action.payload, cartQuatity: 1}
                state.cartItems.push(tempProduct)
                toast.success(`${action.payload.itemName} added to cart`, {
                    position: "bottom-right"
                })
                 
            }
            

            localStorage.setItem("cartItems", JSON.stringify(state.cartItems))
        },

        removeFromCart(state, action) {
            const nextCartItems = state.cartItems.filter(
                (cartItem) => cartItem.id !== action.payload.id
            );
            state.cartItems = nextCartItems;
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems))

            toast.error("Item removed from cart", {
                position: "bottom-right"
            })
        },
        getTotals(state, action){
           let {quantity} = state.cartItems.reduce((cartTotal, cartItem)=>{
                const {cartQuatity} = cartItem

                cartTotal.quantity += cartQuatity

                return cartTotal;
            }, 
            {
                quantity:0
            });
            state.cartTotalQuantity = quantity;
        }
    }
});

export const { addToCart, removeFromCart, getTotals } = cartSlice.actions;



export default cartSlice.reducer;