import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import  thunk  from "redux-thunk";
// import { composeWithDevTools } from "redux-devtools-extension";
import { biddedproductReducer, deleteProductReducer, newProductReducer, productDetailsReducer, productReducer, sellerproductReducer } from "./reducers/productReducer";

import cartReducer, { getTotals} from "./reducers/cartsSlice";
// import { curryGetDefaultMiddleware } from "@reduxjs/toolkit/dist/getDefaultMiddleware";

const reducer = combineReducers({
    products: productReducer,
    productDetails: productDetailsReducer,
    newProduct: newProductReducer,
    myproducts: biddedproductReducer,
    sellerproducts: sellerproductReducer,
    deleteProduct: deleteProductReducer,
    cart: cartReducer,  
});

let initialState = {};

const middleware = [thunk];


const store = configureStore({
    reducer,
    initialState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),

})
store.dispatch(getTotals());




export default store;