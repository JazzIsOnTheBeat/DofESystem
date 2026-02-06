import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://backenddofe.jass-production.me',
    withCredentials: true
});

export const axiosPrivate = axios.create({
    baseURL: 'https://backenddofe.jass-production.me',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

export default axiosInstance;
