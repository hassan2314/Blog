import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  UsersIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import roleService from '../appwrite/roles';
import authService from '../appwrite/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Select from '../components/Select';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminUsers = () => {
  const { permissions } = useSelector(state => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  const availableRoles = roleService.getAllRoles();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users with roles
      const usersWithRoles = await roleService.getAllUsersWithRoles();
      
      // For each user, we need to get their basic info
      // In a real app, you'd have a users collection with more details
      const enrichedUsers = usersWithRoles.map(userRole => ({
        id: userRole.userId,
        name: `User ${userRole.userId.slice(-8)}`, // Placeholder name
        email: `user${userRole.userId.slice(-4)}@example.com`, // Placeholder email
        role: userRole.role,
        roleDisplay: userRole.roleDisplay,
        permissions: userRole.permissions,
        createdAt: userRole.createdAt,
        updatedAt: userRole.updatedAt,
        status: 'active' // Placeholder status
      }));

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setUpdatingRole(true);
      await roleService.updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              role: newRole,
              roleDisplay: roleService.ROLES[newRole.toUpperCase()]?.displayName || newRole,
              permissions: roleService.ROLES[newRole.toUpperCase()]?.permissions || []
            }
          : user
      ));
      
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // In a real app, you'd have a proper user deletion endpoint
      console.log('Deleting user:', userId);
      
      // Remove from local state for demo
      setUsers(users.filter(user => user.id !== userId));
      setShowDeleteDialog(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const canManageUsers = roleService.hasPermission(permissions, 'user.update');
  const canDeleteUsers = roleService.hasPermission(permissions, 'user.delete');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="w-12 h-12 text-indigo-600" />
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
                <UsersIcon className="h-8 w-8 mr-3 text-indigo-600" />
                User Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage users, assign roles, and configure permissions
              </p>
            </div>
            {roleService.hasPermission(permissions, 'user.create') && (
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <Select
                label=""
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full"
              >
                <option value="all">All Roles</option>
                {availableRoles.map(role => (
                  <option key={role.name} value={role.name}>
                    {role.displayName}
                  </option>
                ))}
              </Select>

              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-500">
                  {filteredUsers.length} of {users.length} users
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  {(canManageUsers || canDeleteUsers) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <Select
                            value={user.role}
                            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                            disabled={updatingRole}
                            className="w-32"
                          >
                            {availableRoles.map(role => (
                              <option key={role.name} value={role.name}>
                                {role.displayName}
                              </option>
                            ))}
                          </Select>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={updatingRole}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {user.roleDisplay}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.slice(0, 3).map((permission, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                          >
                            {permission}
                          </span>
                        ))}
                        {user.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{user.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                    </td>
                    {(canManageUsers || canDeleteUsers) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {canManageUsers && (
                            <button
                              onClick={() => setEditingUser(user.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              disabled={editingUser === user.id}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {canDeleteUsers && (
                            <button
                              onClick={() => setShowDeleteDialog(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding a new user.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <ConfirmDialog
            isOpen={true}
            onClose={() => setShowDeleteDialog(null)}
            onConfirm={() => handleDeleteUser(showDeleteDialog)}
            title="Delete User"
            message="Are you sure you want to delete this user? This action cannot be undone."
            confirmText="Delete"
            confirmButtonClass="bg-red-600 hover:bg-red-700"
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsers;