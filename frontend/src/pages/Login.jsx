import { useState } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/Card";
import { Checkbox } from "@/component/ui/Checkbox";
import { Label } from "@/component/ui/Label";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Đăng nhập thất bại");
      } else {
        if (rememberMe) localStorage.setItem("token", data.token);
        sessionStorage.setItem("token", data.token);

        // Redirect theo role
        switch (data.role) {
          case "Admin":
            window.location.href = "/dashboard";
            break;
          case "Academic Affairs Office":
            window.location.href = "/Academic Affairs Office";
            break;
          default:
            window.location.href = "/"; // fallback
        }
      }
    } catch (err) {
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-white">
      <Card className="border-0 shadow-2xl w-[400px] backdrop-blur-sm bg-white/90">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Đăng Nhập</CardTitle>
          <CardDescription className="text-gray-600">Nhập thông tin tài khoản của bạn</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={setRememberMe} />
                <Label htmlFor="remember">Ghi nhớ tôi</Label>
              </div>
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
                Quên mật khẩu?
              </a>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11">
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
