import { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  ShieldCheckIcon, 
  PencilIcon, 
  EyeIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import roleService from '../appwrite/roles';
import Button from '../components/Button';

const AdminRoles = () => {
  const { permissions } = useSelector(state => state.auth);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  const availableRoles = roleService.getAllRoles();
  const allPermissions = [
    'user.create', 'user.read', 'user.update', 'user.delete',
    'post.create', 'post.read', 'post.update', 'post.delete',
    'role.create', 'role.read', 'role.update', 'role.delete',
    'admin.access', 'analytics.view', 'settings.manage'
  ];

  const canManageRoles = roleService.hasPermission(permissions, 'role.update');
  const canViewRoles = roleService.hasPermission(permissions, 'role.read');

  const getPermissionCategory = (permission) => {
    const [category] = permission.split('.');
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getPermissionAction = (permission) => {
    const [, action] = permission.split('.');
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const category = getPermissionCategory(permission);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  if (!canViewRoles) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view roles and permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShieldCheckIcon className="h-8 w-8 mr-3 text-indigo-600" />
                Role Management
              </h1>
              <p className="mt-2 text-gray-600">
                Configure roles and their associated permissions
              </p>
            </div>
            {roleService.hasPermission(permissions, 'role.create') && (
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Role
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roles List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Available Roles</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {availableRoles.map((role) => (
                  <div
                    key={role.name}
                    className={`px-6 py-4 cursor-pointer transition-colors ${
                      selectedRole?.name === role.name
                        ? 'bg-indigo-50 border-r-4 border-indigo-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {role.displayName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {role.permissions.length} permissions
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                        {canManageRoles && (
                          <PencilIcon 
                            className="h-4 w-4 text-gray-400 hover:text-indigo-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRole(role);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Details */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedRole.displayName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Role: {selectedRole.name}
                      </p>
                    </div>
                    {canManageRoles && (
                      <Button
                        onClick={() => setEditingRole(selectedRole)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Role
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">
                    Permissions ({selectedRole.permissions.length})
                  </h4>
                  
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                      const rolePermissions = selectedRole.permissions;
                      const categoryHasPermissions = categoryPermissions.some(perm => 
                        rolePermissions.includes(perm)
                      );

                      if (!categoryHasPermissions) return null;

                      return (
                        <div key={category}>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            {category}
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {categoryPermissions.map((permission) => {
                              const hasPermission = rolePermissions.includes(permission);
                              if (!hasPermission) return null;

                              return (
                                <div
                                  key={permission}
                                  className="flex items-center p-2 rounded-md bg-green-50 border border-green-200"
                                >
                                  <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                                  <span className="text-sm text-green-800">
                                    {getPermissionAction(permission)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg">
                <div className="p-12 text-center">
                  <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Select a Role
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a role from the list to view its permissions and details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Permissions Overview */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Available Permissions
            </h3>
            <p className="text-sm text-gray-500">
              Complete list of permissions that can be assigned to roles
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {category} Permissions
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categoryPermissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center p-3 rounded-md border border-gray-200 bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {getPermissionAction(permission)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {permission}
                          </div>
                        </div>
                        <div className="ml-2">
                          <span className="text-xs text-gray-400">
                            {availableRoles.filter(role => 
                              role.permissions.includes(permission)
                            ).length} roles
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Usage Statistics */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Role Statistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableRoles.map((role) => (
                <div key={role.name} className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {role.permissions.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    {role.displayName} Permissions
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoles;