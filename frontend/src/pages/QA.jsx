import { Card, CardHeader, CardTitle, CardContent } from "../component/ui/Card"
import { useFetch } from "../hooks/useFetch"

export default function QA() {
  const { data: questions } = useFetch("/api/qa")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hỏi Đáp Cộng Đồng</h1>
        <p className="text-muted-foreground mt-1">Đặt câu hỏi và chia sẻ kiến thức</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Câu hỏi gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Chức năng đang được phát triển</div>
        </CardContent>
      </Card>
    </div>
  )
}
