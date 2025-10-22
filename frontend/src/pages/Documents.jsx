import { Card, CardHeader, CardTitle, CardContent } from "../component/ui/Card"
import { useFetch } from "../hooks/useFetch"

export default function Documents() {
  const { data: documents } = useFetch("/api/documents")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tài liệu/Giáo án</h1>
        <p className="text-muted-foreground mt-1">Quản lý tài liệu học tập</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài liệu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Chức năng đang được phát triển</div>
        </CardContent>
      </Card>
    </div>
  )
}
