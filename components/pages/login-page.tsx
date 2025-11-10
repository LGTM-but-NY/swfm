"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeaterIcon as WaterIcon, Eye, EyeOff } from "lucide-react"

interface LoginPageProps {
  onLogin: (role: "guest" | "expert" | "admin") => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [step, setStep] = useState<"role-select" | "credentials">("role-select")
  const [selectedRole, setSelectedRole] = useState<"guest" | "expert" | "admin" | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    // Mock authentication - in production, call API
    console.log(`[v0] Authenticating ${selectedRole} with email: ${email}`)
    if (selectedRole) {
      onLogin(selectedRole)
    }
  }

  const handleRoleSelect = (role: "guest" | "expert" | "admin") => {
    if (role === "guest") {
      // Guest can access directly without credentials
      onLogin("guest")
    } else {
      // Expert and Admin require credential login
      setSelectedRole(role)
      setStep("credentials")
    }
  }

  const handleBackToRoles = () => {
    setStep("role-select")
    setSelectedRole(null)
    setEmail("")
    setPassword("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <WaterIcon className="w-10 h-10 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">SWFM</h1>
          </div>
          <p className="text-slate-400">Smart Workflow Management</p>
          <p className="text-slate-500 text-sm mt-2">Water Forecasting System</p>
        </div>

        {step === "role-select" ? (
          <>
            {/* Role Selection Card */}
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Select Your Role</CardTitle>
                <CardDescription className="text-slate-400">Choose how you want to access SWFM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleRoleSelect("guest")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue as Guest
                </Button>
                <Button
                  onClick={() => handleRoleSelect("expert")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Login as Expert
                </Button>
                <Button
                  onClick={() => handleRoleSelect("admin")}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Login as Administrator
                </Button>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="space-y-2">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-300 mb-1">Guest Access</p>
                <p className="text-xs text-slate-400">View forecasts and station data (no login required)</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-300 mb-1">Expert Access</p>
                <p className="text-xs text-slate-400">Requires login. Tune models and access ML features</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-300 mb-1">Admin Access</p>
                <p className="text-xs text-slate-400">Requires login. Manage users and data sources</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Credentials Login Card */}
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">
                  Login as {selectedRole === "expert" ? "Expert" : "Administrator"}
                </CardTitle>
                <CardDescription className="text-slate-400">Enter your credentials to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCredentialLogin} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">{error}</div>
                  )}

                  {/* Demo Credentials Hint */}
                  <div className="text-xs text-slate-400 bg-slate-700/50 rounded p-2">
                    <p className="font-semibold mb-1">Demo Credentials:</p>
                    <p>Email: demo@swfm.local</p>
                    <p>Password: demo123</p>
                  </div>

                  {/* Login Button */}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Back Button */}
            <Button
              onClick={handleBackToRoles}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              Back to Role Selection
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
