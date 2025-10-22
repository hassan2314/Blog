import roleService from '../appwrite/roles.js';
import authService from '../appwrite/auth.js';

/**
 * Utility functions to help set up the admin panel
 * This is mainly for demonstration purposes
 */

export const setupInitialAdmin = async (userId) => {
  try {
    // Set the user as super admin
    const result = await roleService.updateUserRole(userId, 'super_admin');
    console.log('Admin setup complete:', result);
    return result;
  } catch (error) {
    console.error('Error setting up admin:', error);
    throw error;
  }
};

export const createSampleRoles = async () => {
  try {
    // This would create sample role assignments in a real app
    // For now, we'll just log the available roles
    const roles = roleService.getAllRoles();
    console.log('Available roles:', roles);
    return roles;
  } catch (error) {
    console.error('Error creating sample roles:', error);
    throw error;
  }
};

export const getUserRoleInfo = async (userId) => {
  try {
    const roleInfo = await roleService.getUserRole(userId);
    console.log('User role info:', roleInfo);
    return roleInfo;
  } catch (error) {
    console.error('Error getting user role info:', error);
    throw error;
  }
};

// Helper function to check if user has admin access
export const checkAdminAccess = (permissions) => {
  return roleService.hasPermission(permissions, 'admin.access');
};

// Helper function to get permission display names
export const getPermissionDisplayName = (permission) => {
  const [category, action] = permission.split('.');
  return `${category.charAt(0).toUpperCase() + category.slice(1)} - ${action.charAt(0).toUpperCase() + action.slice(1)}`;
};