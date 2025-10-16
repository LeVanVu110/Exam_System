<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ExamSession;
use App\Models\ExamImportLog;
use App\Models\ExamImportData;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ExamScheduleExport;
use App\Imports\ExamScheduleImport;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf; //đã tải thư viện barryvdh/laravel-dompdf

class ExamSessionController extends Controller
{
    // 📄 1. Import file Excel kỳ thi
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();

        DB::beginTransaction();
        try {
            $importLog = ExamImportLog::create([
                'file_name' => $fileName,
                'imported_by' => Auth::id(),
                'total_rows' => 0,
                'success_rows' => 0,
                'import_status' => 'processing',
            ]);

            $import = new ExamScheduleImport($importLog->id);
            Excel::import($import, $file);

            $importLog->update([
                'total_rows' => $import->getTotalRows(),
                'success_rows' => $import->getSuccessRows(),
                'import_status' => 'completed'
            ]);

            DB::commit();
            return response()->json(['message' => 'Import thành công', 'log' => $importLog]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 📅 2. Danh sách tất cả kỳ thi
    public function index(Request $request)
{
    $query = ExamSession::with([
        'assignedTeacher1.user',
        'assignedTeacher2.user'
    ]);

    if ($request->filled('from') && $request->filled('to')) {
        $query->whereBetween('exam_date', [$request->from, $request->to]);
    }

    $sessions = $query->orderBy('exam_date', 'desc')->paginate(10);

    // Thêm tên giáo viên
    $sessions->getCollection()->transform(function ($item) {
        $item->teacher1_name = $item->assignedTeacher1?->user?->name ?? null;
        $item->teacher2_name = $item->assignedTeacher2?->user?->name ?? null;
        return $item;
    });

    return response()->json($sessions);
}




    // 🔍 3. Tìm kiếm form - to (đã gộp trong index)
    // chỉ cần truyền query param: ?from=2025-10-01&to=2025-10-31

    // 📤 4. Export lịch thi
    public function exportExcel(Request $request)
    {
        return Excel::download(new ExamScheduleExport($request->from, $request->to), 'lich_thi.xlsx');
    }

    // 🧾 5. Xuất kết quả thi (PDF có ký tên)
    public function exportReport($exam_session_id)
    {
        $exam = ExamSession::with(['course', 'assignedTeacher1', 'assignedTeacher2'])->findOrFail($exam_session_id);
        $pdf = PDF::loadView('reports.exam_result', compact('exam'));
        return $pdf->download('bao_cao_ky_thi_' . $exam->exam_code . '.pdf');
    }
}
