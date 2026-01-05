

const host = window.location.hostname;

const BaseUrl = `http://${host}:${import.meta.env.VITE_PORT}`
export const API_BASE_URL = `${BaseUrl}/api`;

// Apis
export const LOGIN_API_URL = `${BaseUrl}/login`;
export const PROFILE_API_URL = `${API_BASE_URL}/user/profile`;
export const CALLBACK_API_URL = `${API_BASE_URL}/user/callback/kite/`;
export const HEALTH_API_URL = `${API_BASE_URL}/health`;
export const PING_API_URL = `${API_BASE_URL}/ping`;
export const WATCH_NIFTY50_OPTION_API_URL = `${API_BASE_URL}/watch-nifty50-option`;
