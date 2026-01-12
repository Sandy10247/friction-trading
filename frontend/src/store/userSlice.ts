import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { apiClient } from '../utils/api'
import {
    LOGIN_API_URL, PROFILE_API_URL, WATCH_NIFTY50_OPTION_API_URL,
    MY_POSITION, USER_HOLDINGS, CHECK_LOGIN_URL
} from '../constants'
import type { UserState } from '../store/types'


export const loginUser = createAsyncThunk('user/login', async () => {
    const response = await apiClient.post(LOGIN_API_URL)

    // open Logn Url
    window.open(response.data.url)
    return response.data
})

export const fetchProfile = createAsyncThunk('user/fetchProfile', async () => {
    const response = await apiClient.get(PROFILE_API_URL)
    return response.data
})

export const watchNifty50Option = createAsyncThunk('user/watchNifty50Option', async () => {
    const response = await apiClient.get(WATCH_NIFTY50_OPTION_API_URL)
    return response.data
})

export const fetchPositions = createAsyncThunk("user/fetchPositons", async () => {
    const response = await apiClient.get(MY_POSITION)
    return response.data
})

export const fetchHoldings = createAsyncThunk("user/fetchHoldings", async () => {
    const response = await apiClient.get(USER_HOLDINGS)
    return response.data
})

export const checkLoginUrl = createAsyncThunk('user/checkLogin', async () => {
    const response = await apiClient.get(CHECK_LOGIN_URL)
    return response.data
})

const initialState: UserState = {
    isLoggedIn: false,
    profile: null,
    positonData: {
        net: [],
        day: []
    },
    holdings: []
}

export const userSlice = createSlice({
    name: 'user',
    initialState: { ...initialState },
    reducers: {
        setLoginState: (state, action) => {
            state.isLoggedIn = action.payload
        },
        setUserProfile: (state, action) => {
            state.profile = action.payload
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(checkLoginUrl.fulfilled, (state, action: PayloadAction<boolean>) => {
                state.isLoggedIn = action.payload
                console.log("Login status updated:", state.isLoggedIn)
            })
            .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<any>) => {
                console.log("Profile fetched:", action.payload)
                state.profile = action.payload
            })
            .addCase(fetchPositions.fulfilled, (state, action: PayloadAction<any>) => {
                console.log("positonData fetched:", action.payload)
                state.positonData = action.payload
            })
            .addCase(fetchHoldings.fulfilled, (state, action: PayloadAction<any>) => {
                console.log("positonData Holdings:", action.payload)
                state.holdings = action.payload
            })
    }
})

// Action creators are generated for each case reducer function
export const { setLoginState, setUserProfile } = userSlice.actions

// isLogged in Selector 
export const selectIsLoggedIn = (state: { user: UserState }) => state.user.isLoggedIn
export const selectUserProfile = (state: { user: UserState }) => state.user.profile
export const selectPositionData = (state: { user: UserState }) => state.user.positonData

export default userSlice.reducer
