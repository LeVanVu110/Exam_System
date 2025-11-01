"use client"

import { useState } from "react"

// ✅ đúng với cấu trúc hiện có: src/component/ui/
import Button from "@/component/ui/Button"
import  Input from "@/component/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/Card"

// ✅ nếu bạn có 2 file Checkbox.jsx và Label.jsx thì giữ nguyên,
// nếu chưa có, tạm thời bạn có thể comment 2 dòng dưới hoặc tạo file trống tương ứng
import { Checkbox } from "@/component/ui/Checkbox"
import { Label } from "@/component/ui/Label"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Giả lập API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Login attempt:", { email, password, rememberMe })
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="border-0 shadow-lg w-[380px]">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">V</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Đăng Nhập</CardTitle>
          <CardDescription>Nhập thông tin tài khoản của bạn để tiếp tục</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Ghi nhớ tôi
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline font-medium">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full h-10 font-medium">
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Chưa có tài khoản? </span>
              <a href="#" className="text-primary hover:underline font-medium">
                Đăng ký ngay
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm
