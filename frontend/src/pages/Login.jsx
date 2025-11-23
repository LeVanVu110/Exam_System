"use client"

import { useState } from "react"
import Button from "@/component/ui/button"
import Input from "@/component/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/card"
import Checkbox from "@/component/ui/checkbox"
import Label from "@/component/ui/label"
import { Mail, Lock, Loader2 } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      // Giữ nguyên logic fetch
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.message || "Đăng nhập thất bại")
      } else {
        if (rememberMe) localStorage.setItem("token", data.token)
        sessionStorage.setItem("token", data.token)

        // Redirect theo role (Giữ nguyên logic)
        switch (data.role) {
          case "Admin":
            window.location.href = "/dashboard"
            break
          case "Academic Affairs Office":
            window.location.href = "/Academic Affairs Office"
            break
          default:
            window.location.href = "PDT/ExamManagement" // fallback
        }
      }
    } catch (err) {
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl rounded-2xl">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">Đăng Nhập</CardTitle>
          <CardDescription className="text-gray-500">Nhập thông tin tài khoản để truy cập hệ thống</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@edu.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Mật khẩu
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked)} />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer font-normal">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng Nhập"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-gray-500">© 2025 EduPortal. All rights reserved.</p>
    </div>
  )
}
