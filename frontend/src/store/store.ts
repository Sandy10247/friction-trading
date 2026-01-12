import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'


export default configureStore({
    reducer: {
        // Add slices here
        user: userReducer,
    },
})

