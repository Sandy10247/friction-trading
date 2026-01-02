import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'
import userReducer from './userSlice'


export default configureStore({
    reducer: {
        // Add your slices here
        counter: counterReducer,
        user: userReducer,
    },
})

