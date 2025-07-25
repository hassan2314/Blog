import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import roleService from '../appwrite/roles';
import { updateUserRole } from '../store/authSlice';
import Button from './Button';

const AdminSetupHelper = () => {
  const { userData, userRole, permissions } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Only show for users without admin access
  const hasAdminAccess = roleService.hasPermission(permissions, 'admin.access');
  
  if (!userData || hasAdminAccess || !isVisible) {
    return null;
  }

  const handleMakeAdmin = async () => {
    try {
      setIsLoading(true);
      
      // Set user as super admin
      const result = await roleService.updateUserRole(userData.$id, 'super_admin');
      
      // Update Redux state
      dispatch(updateUserRole({
        role: result.role,
        permissions: result.permissions
      }));
      
      // Hide the helper
      setIsVisible(false);
      
      // Optionally refresh the page to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error setting up admin:', error);
      alert('Failed to set up admin access. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <ShieldCheckIcon className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-indigo-700">
            <strong>Admin Panel Available!</strong> You can set up admin access to manage users, roles, and content.
          </p>
          <div className="mt-4 flex items-center space-x-3">
            <Button
              onClick={handleMakeAdmin}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1"
            >
              {isLoading ? 'Setting up...' : 'Make me Admin'}
            </Button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Maybe later
            </button>
          </div>
          <p className="mt-2 text-xs text-indigo-600">
            This will give you Super Admin privileges to access the admin panel.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex rounded-md p-1.5 text-indigo-500 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-indigo-50"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupHelper;