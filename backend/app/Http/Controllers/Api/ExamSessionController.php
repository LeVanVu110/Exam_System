<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ExamSession;
use App\Models\ExamImportLog;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ExamScheduleExport;
use App\Imports\ExamScheduleImport;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class ExamSessionController extends Controller
{
    // 📄 Import file Excel
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        DB::beginTransaction();
        try {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();

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
            return response()->json([
                'message' => 'Import thành công',
                'total_rows' => $import->getTotalRows(),
                'success_rows' => $import->getSuccessRows(),
                'new_teachers' => $import->getNewTeachers(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 📅 Danh sách kỳ thi
    public function index(Request $request)
    {
        $query = ExamSession::query()
            ->leftJoin('teachers as t1', 'exam_sessions.assigned_teacher1_id', '=', 't1.teacher_id')
            ->leftJoin('user_profiles as up1', 't1.user_profile_id', '=', 'up1.user_profile_id')
            ->leftJoin('teachers as t2', 'exam_sessions.assigned_teacher2_id', '=', 't2.teacher_id')
            ->leftJoin('user_profiles as up2', 't2.user_profile_id', '=', 'up2.user_profile_id')
            ->select(
                'exam_sessions.*',
                DB::raw("CONCAT(up1.user_lastname, ' ', up1.user_firstname) as teacher1_name"),
                DB::raw("CONCAT(up2.user_lastname, ' ', up2.user_firstname) as teacher2_name")
            );

        // ✅ Lọc theo khoảng ngày
        if ($request->from) {
            $query->whereDate('exam_date', '>=', $request->from);
        }
        if ($request->to) {
            $query->whereDate('exam_date', '<=', $request->to);
        }

        // ✅ Lọc theo mã lớp (cho phép tìm gần đúng)
        if ($request->class_code) {
            $query->where('class_code', 'LIKE', '%' . $request->class_code . '%');
        }

        $sessions = $query->orderBy('exam_date', 'desc')->get();

        return response()->json(['data' => $sessions]);
    }

    // 📤 Xuất file Excel
    public function exportExcel(Request $request)
    {
        return Excel::download(new ExamScheduleExport($request->from, $request->to), 'lich_thi.xlsx');
    }

    // 🧾 Xuất báo cáo PDF
    public function exportReport($exam_session_id)
    {
        $exam = ExamSession::with(['course', 'assignedTeacher1', 'assignedTeacher2'])->findOrFail($exam_session_id);
        $pdf = Pdf::loadView('reports.exam_result', compact('exam'));
        return $pdf->download('bao_cao_ky_thi_' . $exam->exam_code . '.pdf');
    }

    // 🗑️ Xóa 1 kỳ thi
    public function destroy($id)
    {
        try {
            $exam = ExamSession::find($id);

            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy kỳ thi cần xóa.'
                ], 404);
            }

            $exam->delete();

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa kỳ thi thành công.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa kỳ thi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🧹 Xóa hàng loạt kỳ thi
    public function deleteBulk(Request $request)
    {
        try {
            $ids = $request->input('ids', []);

            if (empty($ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có ID nào được gửi lên.'
                ], 400);
            }

            DB::beginTransaction();
            $deleted = ExamSession::whereIn('exam_session_id', $ids)->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã xóa {$deleted} kỳ thi thành công.",
                'deleted_count' => $deleted
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa hàng loạt kỳ thi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
