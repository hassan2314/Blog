import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  TagIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  GlobeAltIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";
import roleService from "../appwrite/roles";
import service from "../appwrite/config";
import authService from "../appwrite/auth";
import categoryService from "../appwrite/categories";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminDashboard = () => {
  const { userData, userRole, permissions } = useSelector(
    (state) => state.auth
  );
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalRoles: 0,
    totalCategories: 0,
    activeUsers: 0,
    publishedPosts: 0,
    draftPosts: 0,
    recentActivity: [],
    systemHealth: {
      database: "healthy",
      storage: "healthy",
      auth: "healthy",
    },
    analytics: {
      postsThisMonth: 0,
      usersThisMonth: 0,
      growthRate: 0,
      engagementRate: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch posts
      const [allPosts, publishedPosts, draftPosts] = await Promise.all([
        service.getPosts([]), // All posts
        service.getPosts([]), // Published posts (you can add status filter)
        service.getPosts([]), // Draft posts (you can add status filter)
      ]);

      // Fetch users with roles
      const usersWithRoles = await roleService.getAllUsersWithRoles();

      // Get available roles
      const availableRoles = roleService.getAllRoles();

      // Get categories
      const categoriesResult = await categoryService.getCategories(false);

      // Calculate analytics
      const now = new Date();
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );

      const recentPosts = allPosts.documents.filter(
        (post) => new Date(post.$createdAt) > lastMonth
      );

      const recentUsers = usersWithRoles.filter(
        (user) => user.createdAt && new Date(user.createdAt) > lastMonth
      );

      // Mock system health check
      const systemHealth = await checkSystemHealth();

      setStats({
        totalUsers: usersWithRoles.length,
        totalPosts: allPosts.documents.length,
        totalRoles: availableRoles.length,
        totalCategories: categoriesResult.documents.length,
        activeUsers: Math.floor(usersWithRoles.length * 0.7), // Mock active users
        publishedPosts: Math.floor(allPosts.documents.length * 0.8),
        draftPosts: Math.floor(allPosts.documents.length * 0.2),
        recentActivity: allPosts.documents.slice(0, 10),
        systemHealth,
        analytics: {
          postsThisMonth: recentPosts.length,
          usersThisMonth: recentUsers.length,
          growthRate: calculateGrowthRate(
            recentPosts.length,
            allPosts.documents.length
          ),
          engagementRate: Math.floor(Math.random() * 30) + 60, // Mock engagement rate
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkSystemHealth = async () => {
    // Mock system health check - in real app, you'd check actual services
    const healthChecks = {
      database: Math.random() > 0.1 ? "healthy" : "warning",
      storage: Math.random() > 0.05 ? "healthy" : "error",
      auth: Math.random() > 0.02 ? "healthy" : "warning",
    };

    return healthChecks;
  };

  const calculateGrowthRate = (recent, total) => {
    if (total === 0) return 0;
    return Math.round((recent / total) * 100);
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case "healthy":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const adminCards = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: UsersIcon,
      link: "/admin/users",
      permission: "user.read",
      color: "bg-blue-500",
      count: stats.totalUsers,
      subtext: `${stats.activeUsers} active`,
      trend: stats.analytics.usersThisMonth > 0 ? "up" : "neutral",
    },
    {
      title: "Content Management",
      description: "Manage posts and content",
      icon: DocumentTextIcon,
      link: "/admin/posts",
      permission: "post.read",
      color: "bg-green-500",
      count: stats.totalPosts,
      subtext: `${stats.publishedPosts} published`,
      trend: stats.analytics.postsThisMonth > 0 ? "up" : "neutral",
    },
    {
      title: "Role Management",
      description: "Configure roles and permissions",
      icon: ShieldCheckIcon,
      link: "/admin/roles",
      permission: "role.read",
      color: "bg-purple-500",
      count: stats.totalRoles,
      subtext: "System roles",
      trend: "neutral",
    },
    {
      title: "Categories",
      description: "Manage post categories",
      icon: TagIcon,
      link: "/admin/categories",
      permission: "category.read",
      color: "bg-teal-500",
      count: stats.totalCategories,
      subtext: "Content categories",
      trend: "neutral",
    },
    {
      title: "Analytics",
      description: "View site analytics and reports",
      icon: ChartBarIcon,
      link: "/admin/analytics",
      permission: "analytics.view",
      color: "bg-yellow-500",
      count: `${stats.analytics.engagementRate}%`,
      subtext: "Engagement rate",
      trend: stats.analytics.engagementRate > 70 ? "up" : "down",
    },
    {
      title: "System Health",
      description: "Monitor system status",
      icon: ServerIcon,
      link: "/admin/system",
      permission: "admin.access",
      color: "bg-indigo-500",
      count: Object.values(stats.systemHealth).filter((s) => s === "healthy")
        .length,
      subtext: `of ${Object.keys(stats.systemHealth).length} services`,
      trend: Object.values(stats.systemHealth).every((s) => s === "healthy")
        ? "up"
        : "warning",
    },
    {
      title: "System Settings",
      description: "Configure system settings",
      icon: CogIcon,
      link: "/admin/settings",
      permission: "settings.manage",
      color: "bg-red-500",
      count: "---",
      subtext: "Configuration",
      trend: "neutral",
    },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case "down":
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {userData?.name}! You are logged in as{" "}
                <span className="font-semibold capitalize text-indigo-600">
                  {userRole?.replace("_", " ")}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {refreshing && (
                <div className="flex items-center text-sm text-gray-500">
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Refreshing...
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {permissions.length} Permissions
                </span>
                <button
                  onClick={() => fetchDashboardData()}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                >
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <div className="mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                System Health
              </h3>
              <div className="flex items-center space-x-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm border-gray-300 rounded-md"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.systemHealth).map(([service, status]) => (
                <div
                  key={service}
                  className={`p-4 rounded-lg ${getHealthColor(status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getHealthIcon(status)}
                      <span className="ml-2 font-medium capitalize">
                        {service}
                      </span>
                    </div>
                    <span className="text-sm font-medium capitalize">
                      {status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {/* <TrendingUpIcon className="h-6 w-6 text-green-600" /> */}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Growth Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.analytics.growthRate}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        This Month
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.analytics.postsThisMonth} posts
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        New Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.analytics.usersThisMonth}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Engagement
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.analytics.engagementRate}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminCards.map((card, index) => {
            const hasPermission = roleService.hasPermission(
              permissions,
              card.permission
            );
            const Icon = card.icon;

            return (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 ${
                  hasPermission
                    ? "hover:shadow-lg cursor-pointer transform hover:-translate-y-1"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                {hasPermission ? (
                  <Link to={card.link} className="block p-6">
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 p-3 rounded-md ${card.color}`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {card.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {card.subtext}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <div className="text-2xl font-bold text-gray-900 mr-2">
                            {card.count}
                          </div>
                          {getTrendIcon(card.trend)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="block p-6">
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 p-3 rounded-md bg-gray-400`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-500">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {card.description}
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                          Insufficient permissions
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-400">
                          {card.count}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Activity
                </h3>
                <Link
                  to="/admin/posts"
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((post, index) => (
                    <div
                      key={index}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <EyeIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {post.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created{" "}
                            {new Date(post.$createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/post/${post.$id}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex-shrink-0"
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
          </div>

          {/* Current Permissions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Your Permissions
              </h3>
              <p className="text-sm text-gray-500">
                Current role: {userRole?.replace("_", " ")}
              </p>
            </div>
            <div className="p-6">
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {permissions.map((permission, index) => {
                    const [category, action] = permission.split(".");
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md bg-green-50 border border-green-200"
                      >
                        <span className="text-sm font-medium text-green-800">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {action}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {permissions.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No permissions assigned
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Dashboard last updated: {new Date().toLocaleString()}</p>
          <p>Auto-refresh enabled (30s intervals)</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
