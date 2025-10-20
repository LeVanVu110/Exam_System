import { Card, CardHeader, CardTitle, CardContent } from "../component/ui/Card"
import { useFetch } from "../hooks/useFetch"

export default function ClassSchedule() {
  const { data: schedule } = useFetch("/api/class-schedule")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lịch Học</h1>
        <p className="text-muted-foreground mt-1">Xem lịch học của các lớp</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch học tuần này</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Chức năng đang được phát triển</div>
        </CardContent>
      </Card>
    </div>
  )
}
