import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import roleService from '../appwrite/roles';

const PermissionGuard = ({ 
  children, 
  requiredPermission, 
  requiredPermissions = [], 
  fallback = null,
  redirectTo = "/",
  requireAll = false 
}) => {
  const { permissions, status } = useSelector(state => state.auth);

  // If user is not authenticated, redirect to login or show fallback
  if (!status) {
    return fallback || <Navigate to="/login" replace />;
  }

  // If no permissions are required, allow access
  if (!requiredPermission && requiredPermissions.length === 0) {
    return children;
  }

  let hasAccess = false;

  if (requiredPermission) {
    hasAccess = roleService.hasPermission(permissions, requiredPermission);
  } else if (requiredPermissions.length > 0) {
    if (requireAll) {
      // User must have ALL required permissions
      hasAccess = requiredPermissions.every(permission => 
        roleService.hasPermission(permissions, permission)
      );
    } else {
      // User must have ANY of the required permissions
      hasAccess = roleService.hasAnyPermission(permissions, requiredPermissions);
    }
  }

  if (!hasAccess) {
    return fallback || <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PermissionGuard;