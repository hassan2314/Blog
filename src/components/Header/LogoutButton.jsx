import { useState } from "react";
import authService from "../../appwrite/auth";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice.js";

const LogoutButton = ({ className = "" }) => {
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await authService.logout();
      dispatch(logout());
      // You might want to add a success notification here
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          className || "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } ${isLoggingOut ? "opacity-75 cursor-not-allowed" : ""}`}
      >
        {isLoggingOut ? (
          <>
            <svg
              className="animate-spin h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Logging out...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-red-50 text-red-600 text-xs p-2 rounded shadow-lg z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default LogoutButton;
