import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { createBrowserRouter, Router } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AuthLayout from "./components/AuthLayout.jsx";
import PermissionGuard from "./components/PermissionGuard.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import AllPosts from "./pages/AllPosts.jsx";
import AddPost from "./pages/AddPost.jsx";
import EditPost from "./pages/EditPost.jsx";
import Post from "./pages/Post.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminRoles from "./pages/AdminRoles.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import { RouterProvider } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: "/signup",
        element: (
          <AuthLayout authentication={false}>
            <Signup />
          </AuthLayout>
        ),
      },
      {
        path: "/all-posts",
        element: (
          <AuthLayout authentication>
            <AllPosts />
          </AuthLayout>
        ),
      },
      {
        path: "/add-post",
        element: (
          <AuthLayout authentication>
            <AddPost />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-post/:slug",
        element: (
          <AuthLayout authentication>
            <EditPost />
          </AuthLayout>
        ),
      },
      {
        path: "/post/:slug",
        element: <Post />,
      },
      // Admin Routes
      {
        path: "/admin",
        element: (
          <AuthLayout authentication>
            <PermissionGuard requiredPermission="admin.access">
              <AdminDashboard />
            </PermissionGuard>
          </AuthLayout>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <AuthLayout authentication>
            <PermissionGuard requiredPermission="user.read">
              <AdminUsers />
            </PermissionGuard>
          </AuthLayout>
        ),
      },
      {
        path: "/admin/roles",
        element: (
          <AuthLayout authentication>
            <PermissionGuard requiredPermission="role.read">
              <AdminRoles />
            </PermissionGuard>
          </AuthLayout>
        ),
      },
      {
        path: "/admin/posts",
        element: (
          <AuthLayout authentication>
            <PermissionGuard requiredPermission="post.read">
              <AllPosts />
            </PermissionGuard>
          </AuthLayout>
        ),
      },
      {
        path: "/admin/analytics",
        element: (
          <AuthLayout authentication>
            <PermissionGuard requiredPermission="analytics.view">
              <AdminAnalytics />
            </PermissionGuard>
          </AuthLayout>
        ),
      },
      {
        path: "/admin/settings",
        element: (
          <AuthLayout authentication>
            <PermissionGuard requiredPermission="settings.manage">
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                  <p className="text-gray-600 mt-2">System settings coming soon...</p>
                </div>
              </div>
            </PermissionGuard>
          </AuthLayout>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </Provider>
  </StrictMode>
);
