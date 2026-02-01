import React, { createContext, useCallback, useEffect, useState } from 'react'
import axiosInstance, { axiosPrivate } from '../api/axios';

export const AuthContext = createContext({
  isAuthenticated: false,
  accessToken: null,
  isLoading: true,
  login: async () => { },
  logout: async () => { },
  getAuthHeader: () => ({}),
})

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // Loading state for initial auth check

  // Try to refresh token on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        // Try to refresh the token to validate session
        try {
          const response = await axiosInstance.get('/refreshToken');
          const newToken = response.data.accessToken;
          setAccessToken(newToken);
          localStorage.setItem('accessToken', newToken);
        } catch (err) {
          // Refresh failed - clear invalid token
          console.log('Token refresh failed on init, clearing...');
          localStorage.removeItem('accessToken');
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  useEffect(() => {
    // keep localStorage and state in sync
    const onStorage = () => setAccessToken(localStorage.getItem('accessToken'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Axios Interceptor for Refresh Token
  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        if (!config.headers['Authorization'] && accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      }, (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      response => response,
      async (error) => {
        const prevRequest = error?.config;
        const status = error?.response?.status;
        // Handle both 401 (Unauthorized) and 403 (Forbidden) for token refresh
        if ((status === 401 || status === 403) && !prevRequest?.sent) {
          prevRequest.sent = true;
          try {
            const response = await axiosInstance.get('/refreshToken');
            const newAccessToken = response.data.accessToken;
            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosPrivate(prevRequest);
          } catch (err) {
            // Refresh failed - clear token and redirect to login
            console.log('Session expired, redirecting to login...');
            setAccessToken(null);
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    }
  }, [accessToken])


  const login = useCallback(async ({ nim, password }) => {
    try {
      const res = await axiosInstance.post('/login', JSON.stringify({ nim, password }), {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      const token = res?.data?.accessToken;
      if (token) {
        localStorage.setItem('accessToken', token)
        setAccessToken(token)
        return { success: true }
      }
      return { success: false, error: 'No token returned' }
    } catch (err) {
      console.error('login error', err)
      const msg = err.response?.data?.msg || 'Login failed';
      return { success: false, error: msg }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await axiosInstance.delete('/logout');
    } catch (err) {
      console.error('logout error', err)
    }
    localStorage.removeItem('accessToken')
    setAccessToken(null)
  }, [])

  const getAuthHeader = useCallback(() => ({ Authorization: accessToken ? `Bearer ${accessToken}` : '' }), [accessToken])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--theme-bg-primary, #0f0f1a)',
        color: 'var(--theme-text-muted, #888)'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!accessToken, accessToken, isLoading, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  )
}
