import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import roleService from '../appwrite/roles';
import service from '../appwrite/config';
import authService from '../appwrite/auth';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const { userData, userRole, permissions } = useSelector(state => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalRoles: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch posts count
        const posts = await service.getPosts();
        
        // Fetch users with roles
        const usersWithRoles = await roleService.getAllUsersWithRoles();
        
        // Get available roles
        const availableRoles = roleService.getAllRoles();

        setStats({
          totalUsers: usersWithRoles.length,
          totalPosts: posts.documents.length,
          totalRoles: availableRoles.length,
          recentActivity: posts.documents.slice(0, 5) // Recent 5 posts
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: UsersIcon,
      link: '/admin/users',
      permission: 'user.read',
      color: 'bg-blue-500',
      count: stats.totalUsers
    },
    {
      title: 'Content Management',
      description: 'Manage posts and content',
      icon: DocumentTextIcon,
      link: '/admin/posts',
      permission: 'post.read',
      color: 'bg-green-500',
      count: stats.totalPosts
    },
    {
      title: 'Role Management',
      description: 'Configure roles and permissions',
      icon: ShieldCheckIcon,
      link: '/admin/roles',
      permission: 'role.read',
      color: 'bg-purple-500',
      count: stats.totalRoles
    },
    {
      title: 'Analytics',
      description: 'View site analytics and reports',
      icon: ChartBarIcon,
      link: '/admin/analytics',
      permission: 'analytics.view',
      color: 'bg-yellow-500',
      count: '---'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: CogIcon,
      link: '/admin/settings',
      permission: 'settings.manage',
      color: 'bg-red-500',
      count: '---'
    }
  ];

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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {userData?.name}! You are logged in as{' '}
                <span className="font-semibold capitalize text-indigo-600">
                  {userRole?.replace('_', ' ')}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {permissions.length} Permissions
              </span>
            </div>
          </div>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminCards.map((card, index) => {
            const hasPermission = roleService.hasPermission(permissions, card.permission);
            const Icon = card.icon;
            
            return (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 ${
                  hasPermission 
                    ? 'hover:shadow-lg cursor-pointer transform hover:-translate-y-1' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {hasPermission ? (
                  <Link to={card.link} className="block p-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 p-3 rounded-md ${card.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                        <p className="text-sm text-gray-500">{card.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{card.count}</div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="block p-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 p-3 rounded-md bg-gray-400`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-500">{card.title}</h3>
                        <p className="text-sm text-gray-400">{card.description}</p>
                        <p className="text-xs text-red-500 mt-1">Insufficient permissions</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-400">{card.count}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((post, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <EyeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">
                        Created {new Date(post.$createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/post/${post.$id}`}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Permissions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Permissions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {permissions.map((permission, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {permission}
                </span>
              ))}
            </div>
            {permissions.length === 0 && (
              <p className="text-gray-500 text-sm">No permissions assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;