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
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Left side - Feature showcase with animations */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(236, 72, 153, 0.15) 100%)' }}
      >
        {/* Animated background orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 animate-fade-in-down">
          <h1 className="text-4xl font-bold gradient-text">BudgetBuddy</h1>
          <p className="text-gray-400 mt-2">Your Personal Finance Companion</p>
        </div>
        <div className="space-y-6 relative z-10">
          <div className="glass-card p-6 transform transition-all duration-300 hover:scale-105 animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)' }}>
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Track Expenses</h3>
            </div>
            <p className="text-gray-400">Monitor your spending habits with detailed analytics and insights</p>
          </div>
          <div className="glass-card p-6 transform transition-all duration-300 hover:scale-105 animate-fade-in-left" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Set Budgets</h3>
            </div>
            <p className="text-gray-400">Create category-based budgets and stay on track with your goals</p>
          </div>
          <div className="glass-card p-6 transform transition-all duration-300 hover:scale-105 animate-fade-in-left" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #84cc16 0%, #a3e635 100%)' }}>
                <span className="text-xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Visualize Data</h3>
            </div>
            <p className="text-gray-400">Beautiful charts and reports to understand your finances better</p>
          </div>
        </div>
        <p className="text-emerald-300 text-sm relative z-10 animate-fade-in" style={{ animationDelay: '0.8s' }}>✨ Trusted by thousands of users worldwide</p>
      </div>

      {/* Right side - Login form with animations */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative" style={{ background: '#0a0a0f' }}>
        {/* Floating shapes in background */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text animate-bounce-in">BudgetBuddy</h1>
            <p className="text-gray-500 mt-1">Your Personal Finance Companion</p>
          </div>

          <div className="glass-card p-8 transform transition-all duration-300 hover:shadow-2xl" style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white transition-all duration-300">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-400 mt-2 transition-all duration-300">
                {isLogin ? "Sign in to continue to your dashboard" : "Start your financial journey today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="animate-slide-in" key="name-field">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="modern-input"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="modern-input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="modern-input"
                  placeholder="Enter your password"
                />
              </div>

              {!isLogin && (
                <div className="animate-slide-in" key="confirm-password-field" style={{ animationDelay: '0.3s' }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="modern-input"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm animate-shake flex items-center gap-2 text-rose-300" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <span>❌</span>
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="px-4 py-3 rounded-xl text-sm animate-fade-in flex items-center gap-2 text-emerald-300" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <span>✅</span>
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)', boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.4)' }}
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
                  className="ml-2 font-medium transition-colors duration-300 hover:underline gradient-text"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
