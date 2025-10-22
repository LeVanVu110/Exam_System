import { Card, CardHeader, CardTitle, CardContent } from "../component/ui/Card"
import { useFetch } from "../hooks/useFetch"

export default function Exams() {
  const { data: exams } = useFetch("/api/exams")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bài Thi</h1>
        <p className="text-muted-foreground mt-1">Danh sách các bài thi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bài thi của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Chức năng đang được phát triển</div>
        </CardContent>
      </Card>
    </div>
  )
}
