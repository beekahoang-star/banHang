import React from 'react';
import { useAuthStore } from '../../stores/authStore';

interface PermissionGateProps {
  permission?: string;
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  role,
  children,
  fallback = null
}) => {
  const { hasPermission, hasRole } = useAuthStore();

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
