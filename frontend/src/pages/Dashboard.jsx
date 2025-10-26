import { Card, CardContent } from "../component/ui/Card"
import { useFetch } from "../hooks/useFetch"

export default function Dashboard() {
  const { data: stats } = useFetch("/api/dashboard/stats")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trang Chủ</h1>
        <p className="text-muted-foreground mt-1">Chào mừng bạn quay lại</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">12</p>
              <p className="text-sm text-muted-foreground mt-2">Lớp học</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">8</p>
              <p className="text-sm text-muted-foreground mt-2">Bài thi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">24</p>
              <p className="text-sm text-muted-foreground mt-2">Tài liệu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">156</p>
              <p className="text-sm text-muted-foreground mt-2">Câu hỏi</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
