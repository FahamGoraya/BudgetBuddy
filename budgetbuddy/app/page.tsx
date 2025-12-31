"use client";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    console.log(`🔐 ${isLogin ? "Login" : "Registration"} attempt:`, { 
      email: formData.email, 
      name: isLogin ? "N/A" : formData.name 
    });

    try {
      // Validation
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }

      let success = false;
      
      if (isLogin) {
        // Login API call
        console.log("📡 Calling /api/auth/login...");
        success = await login(formData.email, formData.password);
        if (success) {
          console.log("✅ Login successful!");
          setSuccessMessage("Login successful! Redirecting...");
        } else {
          console.log("❌ Login failed");
          setError("Invalid email or password. Please try again.");
        }
      } else {
        // Registration validation
        if (!formData.name.trim()) {
          setError("Name is required");
          setIsLoading(false);
          return;
        }
        
        if (!formData.email.includes("@")) {
          setError("Please enter a valid email address");
          setIsLoading(false);
          return;
        }
        
        // Registration API call
        console.log("📡 Calling /api/auth/register...");
        success = await register(formData.email, formData.password, formData.name);
        if (success) {
          console.log("✅ Registration successful!");
          setSuccessMessage("Account created successfully! Redirecting...");
        } else {
          console.log("❌ Registration failed");
          setError("Registration failed. This email may already be registered.");
        }
      }

      if (success) {
        // Clear form and redirect after a brief moment
        setTimeout(() => {
          setFormData({ email: "", password: "", confirmPassword: "", name: "" });
          if (isLogin) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        }, 500);
      }
    } catch (err) {
      console.error("💥 Auth error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left side - Feature showcase with animations */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 animate-fade-in-down">
          <h1 className="text-4xl font-bold text-white">BudgetBuddy</h1>
            <p className="text-teal-200 mt-2">Your Personal Finance Companion</p>
        </div>
        <div className="space-y-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:bg-white/20 animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Track Expenses</h3>
            </div>
            <p className="text-teal-200">Monitor your spending habits with detailed analytics and insights</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:bg-white/20 animate-fade-in-left" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Set Budgets</h3>
            </div>
            <p className="text-teal-200">Create category-based budgets and stay on track with your goals</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:bg-white/20 animate-fade-in-left" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Visualize Data</h3>
            </div>
            <p className="text-teal-200">Beautiful charts and reports to understand your finances better</p>
          </div>
        </div>
        <p className="text-teal-300 text-sm relative z-10 animate-fade-in" style={{ animationDelay: '0.8s' }}>✨ Trusted by thousands of users worldwide</p>
      </div>

      {/* Right side - Login form with animations */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative">
        {/* Floating shapes in background */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-teal-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-emerald-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-600 animate-bounce-in">BudgetBuddy</h1>
            <p className="text-gray-500 mt-1">Your Personal Finance Companion</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 transition-all duration-300">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-500 mt-2 transition-all duration-300">
                {isLogin ? "Sign in to continue to your dashboard" : "Start your financial journey today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="animate-slide-in" key="name-field">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300"
                  placeholder="you@example.com"
                />
              </div>

              <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300"
                  placeholder="Enter your password"
                />
              </div>

              {!isLogin && (
                <div className="animate-slide-in" key="confirm-password-field" style={{ animationDelay: '0.3s' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm animate-shake flex items-center gap-2">
                  <span>❌</span>
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm animate-fade-in flex items-center gap-2">
                  <span>✅</span>
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Please wait...
                  </span>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-gray-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="ml-2 text-teal-600 font-medium hover:text-teal-700 transition-colors duration-300 hover:underline"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
