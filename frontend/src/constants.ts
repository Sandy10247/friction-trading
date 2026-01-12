const host = window.location.hostname;


console.log("ENV :- ", import.meta.env)

export const BaseUrl = `http://${host}:${import.meta.env.VITE_SERVER_PORT}`
export const API_BASE_URL = `${BaseUrl}/api`;

// Apis
export const LOGIN_API_URL = `${BaseUrl}/login`;
export const CHECK_LOGIN_URL = `${BaseUrl}/check-login`;
export const PROFILE_API_URL = `${API_BASE_URL}/user/profile`;
export const CALLBACK_API_URL = `${API_BASE_URL}/user/callback/kite/`;
export const USER_HOLDINGS = `${API_BASE_URL}/user/holdings`
export const HEALTH_API_URL = `${BaseUrl}/health`;
export const PING_API_URL = `${BaseUrl}/ping`;
export const WATCH_NIFTY50_OPTION_API_URL = `${API_BASE_URL}/watch-nifty50-option`;
export const MY_POSITION = `${API_BASE_URL}/user/positons`


