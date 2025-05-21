import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { validateEmail } from "../../../utils/validation";

// Utility to prevent duplicate toasts
const shownToasts = new Set<string>();
const showUniqueToast = (
    message: string,
    type: "success" | "error",
    id?: string
) => {
  const toastId = id || message;
  if (!shownToasts.has(toastId)) {
    shownToasts.add(toastId);

    if (type === "success") {
      toast.success(message, { id: toastId });
    } else {
      toast.error(message, { id: toastId });
    }

    // Remove from tracking after some time
    setTimeout(() => {
      shownToasts.delete(toastId);
    }, 5000);
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // Get the redirect path from location state, default to dashboard
  const from =
      (location.state as { from?: { pathname: string } })?.from?.pathname ||
      "/dashboard";

  const validateForm = (): boolean => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // features/auth/pages/Login.tsx - updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Pass false to indicate this is not an admin login
      await signIn(email, password, false);
      // Navigation is handled in AuthProvider
    } catch (error: unknown) {
      const errorMessage =
          error instanceof Error ? error.message : "Invalid email or password";

      if (errorMessage.includes("Admin users must login")) {
        setErrors({
          email: "Admin users must use the admin login page",
          password: ""
        });
      } else if (errorMessage.includes("credentials")) {
        setErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
        });
      } else {
        showUniqueToast(errorMessage, "error", "login-error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-xl shadow-lg">
          <div>
            <Link
                to="/"
                className="inline-flex items-center text-slate-400 hover:text-white mb-8"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to home
            </Link>
            <div className="flex flex-col items-center justify-center">
              <div className="w-28 h-28 relative mb-3 overflow-hidden p-1">
                <img
                    src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//39888c2f-22d0-4a95-85ae-dfa6dc1aae7b.png"
                    alt="MediaTiger Logo"
                    className="w-full h-full object-contain transition-all duration-300 hover:scale-105"
                />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-slate-400">
              Or{" "}
              <Link
                  to="/signup"
                  className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                create a new account
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-300"
                >
                  Email address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={`mt-1 block w-full px-3 py-2 bg-slate-700 border ${
                        errors.email ? "border-red-500" : "border-slate-600"
                    } rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder="Enter your email"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={`mt-1 block w-full px-3 py-2 bg-slate-700 border ${
                        errors.password ? "border-red-500" : "border-slate-600"
                    } rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder="Enter your password"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-600 rounded bg-slate-700"
                />
                <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-300"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                    href="#"
                    className="font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}