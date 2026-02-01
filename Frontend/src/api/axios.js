import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
});

export const axiosPrivate = axios.create({
    baseURL: 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

export default axiosInstance;
