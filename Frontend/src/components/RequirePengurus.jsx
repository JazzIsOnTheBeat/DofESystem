import React, { useContext, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

export default function RequirePengurus({ children }) {
  const { accessToken, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const userRole = useMemo(() => {
    if (!accessToken) return null;
    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload).role;
    } catch {
      return null;
    }
  }, [accessToken]);

  const pengurusRoles = ['ketua', 'wakilKetua', 'sekretaris', 'bendahara'];
  const isPengurus = pengurusRoles.includes(userRole);

  if (!isPengurus) {
    return <Navigate to="/" replace />;
  }

  return children;
}
