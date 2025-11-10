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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-white">
      <Card className="border-0 shadow-2xl w-[400px] backdrop-blur-sm bg-white/90">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Đăng Nhập</CardTitle>
          <CardDescription className="text-gray-600">Nhập thông tin tài khoản của bạn để tiếp tục</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                  Ghi nhớ tôi
                </Label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full h-11 font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-lg
                ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng Nhập"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm
