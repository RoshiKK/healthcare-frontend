'use client'

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, LogIn, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema } from "@/lib/validations";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { motion } from "framer-motion";

type FormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'doctor' | 'patient';
    specialization?: string;
  };
  accessToken: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: FormData) {
    // Basic rate limiting
    if (loginAttempts >= 5) {
      setError('root', { 
        message: 'Too many login attempts. Please try again in 15 minutes.' 
      });
      return;
    }

    setIsLoading(true);
    setLoginAttempts(prev => prev + 1);

    try {
      console.log("Attempting login...");

      const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", data);
      console.log("Login response:", response);

      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        const { user, accessToken } = responseData.data;
        
        if (user && accessToken) {
          // Reset login attempts on successful login
          setLoginAttempts(0);
          login(user, accessToken);

          if (user.role === 'admin') {
            window.location.href = "/admin";
          } else if (user.role === 'doctor') {
            window.location.href = "/doctor";
          } else {
            window.location.href = "/";
          }
        } else {
          throw new Error("Invalid user data in response");
        }
      } else {
        throw new Error(responseData.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login failed:", error);

      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";

      // Set appropriate error messages
      if (errorMessage.toLowerCase().includes("credentials") || 
          errorMessage.toLowerCase().includes("invalid")) {
        setError('root', { 
          message: 'Invalid email address or password. Please try again.' 
        });
      } else if (errorMessage.includes("disabled")) {
        setError('root', { 
          message: 'This account has been disabled. Please contact support.' 
        });
      } else {
        setError('root', { message: errorMessage });
      }

      // Clear password field on error
      reset({ password: '' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Secure Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Root Error Message */}
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center text-red-800 text-sm">
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{errors.root.message}</span>
                </div>
              </motion.div>
            )}

            {/* Login Attempts Warning */}
            {loginAttempts >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center text-yellow-800 text-sm">
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {loginAttempts >= 5 
                      ? 'Too many failed attempts. Account temporarily locked.'
                      : `Multiple failed login attempts (${loginAttempts}/5)`
                    }
                  </span>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register("email")}
                  disabled={isLoading || loginAttempts >= 5}
                  className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white/50"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 flex items-center gap-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  disabled={isLoading || loginAttempts >= 5}
                  className="h-12 px-4 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white/50"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || loginAttempts >= 5}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 flex items-center gap-1"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Security Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Security Tips
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Never share your login credentials</li>
                <li>• Ensure you're on the official MedConnect website</li>
                <li>• Log out after each session, especially on shared devices</li>
                <li>• Contact support if you suspect unauthorized access</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                disabled={isLoading || loginAttempts >= 5}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {loginAttempts >= 5 ? 'Account Locked' : 'Sign In'}
                  </>
                )}
              </Button>
            </motion.div>

            {/* Support Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-sm text-gray-500"
            >
              <p>
                Need help accessing your account?{" "}
                <a 
                  href="mailto:support@medconnect.com" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contact Support
                </a>
              </p>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-float" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-30 animate-float animation-delay-1000" />
      <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full opacity-40 animate-float animation-delay-2000" />
    </motion.div>
  )
}