import axios from 'axios';

import { API_BASE_URL } from '../constants';

// axoios instance with base URL
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

