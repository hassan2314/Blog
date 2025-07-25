import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  ChartBarIcon,
  TrendingUpIcon,
  UsersIcon,
  DocumentTextIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import roleService from "../appwrite/roles";
import service from "../appwrite/config";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminAnalytics = () => {
  const { permissions } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState({
    overview: {
      totalViews: 0,
      totalUsers: 0,
      totalPosts: 0,
      engagementRate: 0,
    },
    trends: {
      viewsGrowth: 0,
      usersGrowth: 0,
      postsGrowth: 0,
      engagementGrowth: 0,
    },
    timeSeriesData: [],
    topContent: [],
    userActivity: [],
    roleDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("views");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch posts and users data
      const [posts, usersWithRoles] = await Promise.all([
        service.getPosts([]),
        roleService.getAllUsersWithRoles(),
      ]);

      // Generate mock analytics data based on real data
      const totalPosts = posts.documents.length;
      const totalUsers = usersWithRoles.length;

      // Mock time series data for the last 30 days
      const timeSeriesData = generateTimeSeriesData(30);

      // Calculate top content
      const topContent = posts.documents.slice(0, 10).map((post) => ({
        id: post.$id,
        title: post.title,
        views: Math.floor(Math.random() * 1000) + 100,
        engagement: Math.floor(Math.random() * 50) + 10,
        createdAt: post.$createdAt,
      }));

      // Mock user activity data
      const userActivity = generateUserActivityData(7);

      // Role distribution
      const roleDistribution = generateRoleDistribution(usersWithRoles);

      setAnalytics({
        overview: {
          totalViews: Math.floor(totalPosts * 150 + Math.random() * 1000),
          totalUsers: totalUsers,
          totalPosts: totalPosts,
          engagementRate: Math.floor(Math.random() * 30) + 60,
        },
        trends: {
          viewsGrowth: Math.floor(Math.random() * 20) + 5,
          usersGrowth: Math.floor(Math.random() * 15) + 2,
          postsGrowth: Math.floor(Math.random() * 25) + 8,
          engagementGrowth: Math.floor(Math.random() * 10) - 5,
        },
        timeSeriesData,
        topContent,
        userActivity,
        roleDistribution,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = (days) => {
    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split("T")[0],
        views: Math.floor(Math.random() * 200) + 50,
        users: Math.floor(Math.random() * 50) + 10,
        posts: Math.floor(Math.random() * 10) + 1,
        engagement: Math.floor(Math.random() * 100) + 20,
      });
    }

    return data;
  };

  const generateUserActivityData = (days) => {
    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString(),
        activeUsers: Math.floor(Math.random() * 100) + 20,
        newUsers: Math.floor(Math.random() * 20) + 2,
        returningUsers: Math.floor(Math.random() * 80) + 15,
      });
    }

    return data;
  };

  const generateRoleDistribution = (users) => {
    const roles = roleService.getAllRoles();
    return roles.map((role) => ({
      role: role.displayName,
      count: Math.floor(Math.random() * Math.max(users.length / 2, 1)) + 1,
      percentage: Math.floor(Math.random() * 30) + 10,
    }));
  };

  const getTrendIcon = (value) => {
    if (value > 0) {
      return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    } else if (value < 0) {
      return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (value) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const metricOptions = [
    { value: "views", label: "Page Views", icon: EyeIcon },
    { value: "users", label: "Users", icon: UsersIcon },
    { value: "posts", label: "Posts", icon: DocumentTextIcon },
    { value: "engagement", label: "Engagement", icon: ChartBarIcon },
  ];

  if (!roleService.hasPermission(permissions, "analytics.view")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view analytics.
          </p>
        </div>
      </div>
    );
  }

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
                <ChartBarIcon className="h-8 w-8 mr-3 text-indigo-600" />
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={fetchAnalyticsData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EyeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Views
                    </dt>
                    <dd className="flex items-center">
                      <div className="text-lg font-medium text-gray-900">
                        {analytics.overview.totalViews.toLocaleString()}
                      </div>
                      <div
                        className={`ml-2 flex items-center text-sm ${getTrendColor(
                          analytics.trends.viewsGrowth
                        )}`}
                      >
                        {getTrendIcon(analytics.trends.viewsGrowth)}
                        <span className="ml-1">
                          {Math.abs(analytics.trends.viewsGrowth)}%
                        </span>
                      </div>
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
                  <UsersIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="flex items-center">
                      <div className="text-lg font-medium text-gray-900">
                        {analytics.overview.totalUsers.toLocaleString()}
                      </div>
                      <div
                        className={`ml-2 flex items-center text-sm ${getTrendColor(
                          analytics.trends.usersGrowth
                        )}`}
                      >
                        {getTrendIcon(analytics.trends.usersGrowth)}
                        <span className="ml-1">
                          {Math.abs(analytics.trends.usersGrowth)}%
                        </span>
                      </div>
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
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Posts
                    </dt>
                    <dd className="flex items-center">
                      <div className="text-lg font-medium text-gray-900">
                        {analytics.overview.totalPosts.toLocaleString()}
                      </div>
                      <div
                        className={`ml-2 flex items-center text-sm ${getTrendColor(
                          analytics.trends.postsGrowth
                        )}`}
                      >
                        {getTrendIcon(analytics.trends.postsGrowth)}
                        <span className="ml-1">
                          {Math.abs(analytics.trends.postsGrowth)}%
                        </span>
                      </div>
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
                      Engagement Rate
                    </dt>
                    <dd className="flex items-center">
                      <div className="text-lg font-medium text-gray-900">
                        {analytics.overview.engagementRate}%
                      </div>
                      <div
                        className={`ml-2 flex items-center text-sm ${getTrendColor(
                          analytics.trends.engagementGrowth
                        )}`}
                      >
                        {getTrendIcon(analytics.trends.engagementGrowth)}
                        <span className="ml-1">
                          {Math.abs(analytics.trends.engagementGrowth)}%
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Time Series Chart */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Trends Over Time
                </h3>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="text-sm border-gray-300 rounded-md"
                >
                  {metricOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-end justify-between space-x-2">
                {analytics.timeSeriesData.slice(-14).map((data, index) => {
                  const value = data[selectedMetric];
                  const maxValue = Math.max(
                    ...analytics.timeSeriesData.map((d) => d[selectedMetric])
                  );
                  const height = (value / maxValue) * 100;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-full bg-indigo-500 rounded-t-sm transition-all duration-300 hover:bg-indigo-600"
                        style={{ height: `${height}%` }}
                        title={`${value} ${selectedMetric}`}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                        {new Date(data.date).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                User Role Distribution
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.roleDistribution.map((role, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-indigo-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {role.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {role.count} users
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${role.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {role.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Content */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Top Performing Content
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {analytics.topContent.slice(0, 8).map((content, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {content.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {content.views} views • {content.engagement}% engagement
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUpIcon className="h-4 w-4 mr-1 text-green-500" />
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                User Activity (Last 7 Days)
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.userActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        {activity.date}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>Active: {activity.activeUsers}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>New: {activity.newUsers}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <span>Returning: {activity.returningUsers}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Analytics data updated in real-time • Last refresh:{" "}
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
