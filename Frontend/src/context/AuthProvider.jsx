import React, { createContext, useCallback, useEffect, useState, useRef } from 'react'
import axiosInstance, { axiosPrivate } from '../api/axios';

export const AuthContext = createContext({
  isAuthenticated: false,
  accessToken: null,
  isLoading: true,
  login: async () => { },
  logout: async () => { },
  getAuthHeader: () => ({}),
})

// Module-level variables persist across re-renders and component instances
let refreshPromise = null;

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const accessTokenRef = useRef(null);

  // Keep Ref in sync with state for interceptor access without re-registration
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  // Sync state between tabs
  useEffect(() => {
    const onStorage = () => {
      const token = localStorage.getItem('accessToken');
      if (token !== accessToken) setAccessToken(token);
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [accessToken])

  // Centralized refresh function to be used by initAuth and interceptors
  const refresh = useCallback(async () => {
    if (refreshPromise) {
      console.log('[Auth] Reusing existing refresh promise...');
      return refreshPromise;
    }

    console.log('[Auth] Starting new refresh token request...');
    refreshPromise = axiosInstance.get('/refreshToken')
      .then(response => {
        const newAccessToken = response.data.accessToken;
        console.log('[Auth] Refresh succeeded, updating state');
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
        refreshPromise = null;
        return newAccessToken;
      })
      .catch(err => {
        console.error('[Auth] Refresh failed:', err.response?.status || err.message);
        refreshPromise = null;
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        // Optional: window.location.href = '/login'; 
        // We'll let the interceptor or RequireAuth handle the redirect
        throw err;
      });

    return refreshPromise;
  }, []);

  // Sync interceptors ONCE on mount
  useEffect(() => {
    console.log('[Auth] Registering stable Axios interceptors');

    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        const token = accessTokenRef.current;
        if (!config.headers['Authorization'] && token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      }, (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      response => response,
      async (error) => {
        const prevRequest = error?.config;
        const status = error?.response?.status;

        // Check for 401 or 403 (backend sometimes returns 403 for expired tokens)
        if ((status === 401 || status === 403) && !prevRequest?.sent) {
          console.log(`[Auth Interceptor] 401 detected for: ${prevRequest.url}`);
          prevRequest.sent = true;

          try {
            const newToken = await refresh();
            console.log(`[Auth Interceptor] Retrying: ${prevRequest.url}`);
            prevRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axiosPrivate(prevRequest);
          } catch (refreshErr) {
            console.error('[Auth Interceptor] Refresh failed during retry, redirecting to login');
            window.location.href = '/login';
            return Promise.reject(refreshErr);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      console.log('[Auth] Cleaning up Axios interceptors');
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    }
  }, [refresh]);

  // Try to restore session on initial load
  useEffect(() => {
    const initAuth = async () => {
      if (localStorage.getItem('accessToken')) {
        console.log('[Auth] Found session in storage, initializing...');
        try {
          await refresh();
          console.log('[Auth] Session initialized successfully');
        } catch (err) {
          console.warn('[Auth] Session initialization failed');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refresh]);


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
