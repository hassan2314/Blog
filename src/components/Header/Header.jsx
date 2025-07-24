import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { LogoutButton, Container, Logo, SearchBar, NotificationCenter } from "../index.js";
import { useNavigate } from "react-router-dom";
import { FiUser } from 'react-icons/fi';

const Header = () => {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Home",
      slug: "/",
      active: true,
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "All Posts",
      slug: "/all-posts",
      active: authStatus,
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
      ),
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
      icon: (
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <Container>
        <nav className="flex items-center justify-between py-3">
          {/* Logo/Branding */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center">
              <Logo
                width="70px"
                className="hover:opacity-80 transition-opacity"
              />
              {authStatus && userData?.name && (
                <span className="ml-4 text-sm font-medium text-gray-600 hidden md:inline">
                  Welcome back, {userData.name.split(" ")[0]}
                </span>
              )}
            </Link>
            
            {/* Search Bar */}
            <div className="ml-8 flex-1 max-w-md hidden sm:block">
              <SearchBar />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            <ul className="flex items-center space-x-1">
              {navItems.map((item) =>
                item.active ? (
                  <li key={item.slug}>
                    <button
                      onClick={() => navigate(item.slug)}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                        ${
                          window.location.pathname === item.slug
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }
                      `}
                      aria-current={
                        window.location.pathname === item.slug
                          ? "page"
                          : undefined
                      }
                    >
                      {item.icon}
                      <span className="hidden sm:inline">{item.name}</span>
                    </button>
                  </li>
                ) : null
              )}

              {/* User dropdown/logout */}
              {authStatus && (
                <>
                  <li>
                    <NotificationCenter />
                  </li>
                  <li>
                    <button
                      onClick={() => navigate(`/profile/${userData.$id}`)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                      title="View Profile"
                    >
                      <FiUser className="w-5 h-5" />
                      <span className="hidden sm:inline ml-2">Profile</span>
                    </button>
                  </li>
                  <li className="ml-2">
                    <div className="relative">
                      <LogoutButton className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200" />
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </Container>
    </header>
  );
};

export default Header;
