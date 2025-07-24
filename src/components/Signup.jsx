import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

import { login } from "../store/authSlice.js";
import authService from "../appwrite/auth";
import { useDispatch } from "react-redux";
import { Button, Input, Logo } from "./index.js";

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const dispatch = useDispatch();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid, touchedFields },
    watch,
    trigger
  } = useForm({ 
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const watchedPassword = watch("password");

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  React.useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(calculatePasswordStrength(watchedPassword));
    }
  }, [watchedPassword]);

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const signup = async (data) => {
    setError("");
    setIsLoading(true);
    
    try {
      const session = await authService.create(data);
      if (session) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          dispatch(login({ userData }));
        }
      }
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const InputWithIcon = ({ icon: Icon, error, touched, ...props }) => (
    <div className="w-full">
      {props.label && (
        <label className="inline-block mb-2 pl-1 text-sm font-medium text-gray-700" htmlFor={props.id}>
          {props.label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 ${error && touched ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
        <input
          {...props}
          className={`
            block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            transition-colors duration-200
            ${error && touched 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 text-gray-900'
            }
          `}
        />
        {error && touched && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
        {!error && touched && props.value && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
      {error && touched && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );

  const PasswordInputWithToggle = ({ error, touched, ...props }) => (
    <div className="w-full">
      {props.label && (
        <label className="inline-block mb-2 pl-1 text-sm font-medium text-gray-700" htmlFor={props.id}>
          {props.label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LockClosedIcon className={`h-5 w-5 ${error && touched ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className={`
            block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            transition-colors duration-200
            ${error && touched 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 text-gray-900'
            }
          `}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Password Strength Indicator */}
      {props.value && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Password strength:</span>
            <span className={`text-xs font-medium ${
              passwordStrength <= 2 ? 'text-red-600' :
              passwordStrength <= 3 ? 'text-yellow-600' :
              passwordStrength <= 4 ? 'text-blue-600' : 'text-green-600'
            }`}>
              {getPasswordStrengthText(passwordStrength)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
              style={{ width: `${(passwordStrength / 5) * 100}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>Password should contain:</p>
            <ul className="mt-1 space-y-1">
              <li className={`flex items-center ${watchedPassword?.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                At least 8 characters
              </li>
              <li className={`flex items-center ${/[a-z]/.test(watchedPassword || '') ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Lowercase letter
              </li>
              <li className={`flex items-center ${/[A-Z]/.test(watchedPassword || '') ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Uppercase letter
              </li>
              <li className={`flex items-center ${/[0-9]/.test(watchedPassword || '') ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Number
              </li>
              <li className={`flex items-center ${/[^A-Za-z0-9]/.test(watchedPassword || '') ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Special character
              </li>
            </ul>
          </div>
        </div>
      )}
      
      {error && touched && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-auto flex justify-center">
            <Logo width="48" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(signup)}>
            <InputWithIcon
              icon={UserIcon}
              id="name"
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              error={errors.name?.message}
              touched={touchedFields.name}
              {...register("name", { 
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters"
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Name can only contain letters and spaces"
                }
              })}
            />

            <InputWithIcon
              icon={EnvelopeIcon}
              id="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              error={errors.email?.message}
              touched={touchedFields.email}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Please enter a valid email address"
                }
              })}
            />

            <PasswordInputWithToggle
              id="password"
              label="Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password?.message}
              touched={touchedFields.password}
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                },
                validate: {
                  hasLowerCase: (value) => 
                    /[a-z]/.test(value) || "Password must contain at least one lowercase letter",
                  hasUpperCase: (value) => 
                    /[A-Z]/.test(value) || "Password must contain at least one uppercase letter",
                  hasNumber: (value) => 
                    /[0-9]/.test(value) || "Password must contain at least one number",
                  hasSpecialChar: (value) => 
                    /[^A-Za-z0-9]/.test(value) || "Password must contain at least one special character"
                }
              })}
            />

            <div>
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
