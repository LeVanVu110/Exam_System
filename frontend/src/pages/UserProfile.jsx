import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
// ✅ IMPORT: SweetAlert2
import Swal from "sweetalert2";
import { Lock, Shield } from "lucide-react";

// --- CÁC COMPONENT UI CƠ BẢN ---
const Card = ({ children, className }) => (
  <div className={`bg-white shadow-xl rounded-xl p-6 ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children, className }) => (
  <div className={`border-b pb-4 mb-4 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }) => (
  <h2 className={`text-2xl font-semibold text-gray-800 ${className}`}>
    {children}
  </h2>
);
const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);
const Button = ({ children, onClick, className = "", disabled = false, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 font-medium rounded-lg transition duration-150 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

// --- COMPONENT MODAL ---
const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black bg-opacity-30">
      <Card className="max-w-xl w-full mx-4 animate-[zoomIn_0.2s_ease-out]">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <CardTitle className="text-xl">{title}</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            &times;
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
};

// --- HOOK FETCH API ---
const useFetch = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchCount, setFetchCount] = useState(0);

  const refetch = () => setFetchCount((prev) => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('ACCESS_TOKEN');
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url, fetchCount, ...dependencies]);

  return { data, loading, error, refetch };
};

// --- MODAL XEM DANH SÁCH USER KHÁC ---
const AllTeachersModal = ({ isOpen, onClose, teachers, currentUserId }) => {
  const otherUsers = teachers.filter(
    (user) => user.user_profile_id !== currentUserId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Danh sách Giảng viên/Tất cả Người dùng"
    >
      <p className="text-gray-700 mb-4">
        Danh sách tất cả hồ sơ người dùng khác:
      </p>

      <div className="max-h-80 overflow-y-auto border rounded-lg p-2 bg-gray-50">
        {otherUsers.length > 0 ? (
          <ul className="space-y-3">
            {otherUsers.map((user, index) => (
              <li
                key={user.user_profile_id}
                className="p-3 border-b last:border-b-0 bg-white rounded-md shadow-sm flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">{`${user.user_firstname} ${user.user_lastname}`}</p>
                  <p className="text-xs text-gray-500">
                    {user.user?.user_email || "Không có Email"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.category_user_type?.user_type_code === "ADMIN"
                      ? "bg-red-100 text-red-800"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {user.category_user_type?.user_type_name || "N/A"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 p-4">
            Không tìm thấy giảng viên hoặc người dùng nào khác.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Đóng
        </Button>
      </div>
    </Modal>
  );
};

// --- HELPER LOCALSTORAGE ---
const getProfileIdFromStorage = () => {
  try {
    const userInfoStr = localStorage.getItem('USER_INFO');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      const profileId = userInfo.user_profile_id; 
      return profileId ? Number(profileId) : null; 
    }
  } catch (e) {
    console.error("Lỗi khi đọc USER_INFO từ localStorage:", e);
  }
  return null; 
};

// 👇 MÃ MÀN HÌNH ĐỂ CHECK QUYỀN
const SCREEN_CODE = "USER_PRO"; 

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================
export default function UserProfile() {
  const API_URL_ALL = "http://localhost:8000/api/user-profiles";
  
  // 1. Lấy ID Profile hiện tại
  const CURRENT_USER_PROFILE_ID = getProfileIdFromStorage(); 

  // 👉 2. STATE QUYỀN HẠN
  const [permissions, setPermissions] = useState({
      is_view: false, // Quyền xem danh sách người khác
      is_edit: false, // Quyền sửa hồ sơ
      is_add: false,
      is_delete: false
  });

  // Check ID hợp lệ
  if (CURRENT_USER_PROFILE_ID === null || isNaN(CURRENT_USER_PROFILE_ID)) {
    return (
        <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg max-w-xl mx-auto mt-10">
            <p className="font-bold mb-2">Lỗi truy cập hồ sơ:</p>
            <p>Không tìm thấy ID hồ sơ. Vui lòng đăng nhập lại.</p>
        </div>
    );
  }

  // 👉 3. LOAD QUYỀN TỪ LOCALSTORAGE
  useEffect(() => {
    const storedPerms = localStorage.getItem("user_permissions");
    if (storedPerms) {
        try {
            const parsedPerms = JSON.parse(storedPerms);
            
            // Tìm quyền của màn hình USER_PRO
            let myPerm = {};
            if (Array.isArray(parsedPerms)) {
                myPerm = parsedPerms.find(p => p.screen_code === SCREEN_CODE) || {};
            } else {
                myPerm = parsedPerms[SCREEN_CODE] || {};
            }

            setPermissions({
                is_view: !!myPerm.is_view,
                is_edit: !!myPerm.is_edit,
                is_add: !!myPerm.is_add,
                is_delete: !!myPerm.is_delete
            });
        } catch (e) {
            console.error("Lỗi đọc quyền:", e);
        }
    }
  }, []);

  // API Call
  const { data: allProfiles, loading, error, refetch } = useFetch(API_URL_ALL, [CURRENT_USER_PROFILE_ID]);

  // Lọc Profile của chính mình
  const profile = useMemo(() => {
    if (allProfiles && Array.isArray(allProfiles)) {
      return allProfiles.find(
        (p) => p.user_profile_id === CURRENT_USER_PROFILE_ID
      );
    }
    return null;
  }, [allProfiles, CURRENT_USER_PROFILE_ID]);

  const API_URL_UPDATE = `${API_URL_ALL}/${CURRENT_USER_PROFILE_ID}`;

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingTeachers, setIsViewingTeachers] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Avatar States
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Load data vào Form sửa
  useEffect(() => {
    if (profile) {
      setEditFormData({
        user_firstname: profile.user_firstname || "",
        user_lastname: profile.user_lastname || "",
        user_phone: profile.user_phone || "",
        user_sex: profile.user_sex !== null ? profile.user_sex : -1,
        address: profile.address || "",
        updated_at: profile.updated_at,
      });
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [profile]);

  const DetailItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0 text-gray-700">
      <span className="font-medium text-sm text-gray-500">{label}:</span>
      <span className="text-sm font-semibold text-right">{value || "N/A"}</span>
    </div>
  );

  const handleEditClick = () => {
    // 👉 Check quyền Edit trước khi mở form
    if (!permissions.is_edit) {
        Swal.fire({
            icon: "error",
            title: "Không có quyền",
            text: "Bạn không có quyền chỉnh sửa hồ sơ này.",
        });
        return;
    }
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 👉 Check quyền Edit lần cuối (Security)
    if (!permissions.is_edit) return;

    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Dữ liệu sẽ được cập nhật.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Lưu lại",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    setIsSaving(true);
    setSaveError(null);

    const formData = new FormData();
    formData.append("_method", "PUT"); 
    formData.append("user_firstname", editFormData.user_firstname);
    formData.append("user_lastname", editFormData.user_lastname);
    formData.append("user_phone", editFormData.user_phone);
    formData.append("user_sex", editFormData.user_sex !== -1 ? parseInt(editFormData.user_sex) : "");
    formData.append("address", editFormData.address);
    formData.append("updated_at", editFormData.updated_at); 

    const newFile = fileInputRef.current?.files[0];
    if (newFile) formData.append("user_avatar_file", newFile);
    
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (!token) {
        setSaveError("Không tìm thấy ACCESS_TOKEN.");
        setIsSaving(false);
        return;
    }

    try {
      const response = await fetch(API_URL_UPDATE, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật thất bại.");
      }

      refetch();
      handleCloseEdit();
      Swal.fire({ icon: "success", title: "Thành công!", text: "Hồ sơ đã được cập nhật." });
    } catch (err) {
      console.error(err);
      setSaveError(err.message);
      Swal.fire({ icon: "error", title: "Lỗi", text: err.message }).then(() => {
        if (err.message.includes("thay đổi") || err.message.includes("cập nhật")) {
          handleCloseEdit(); refetch();
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-lg text-indigo-600 animate-pulse">
        Đang tải dữ liệu hồ sơ...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <p className="font-bold mb-2">Lỗi khi tải dữ liệu:</p>
        <p>{error || `Không tìm thấy hồ sơ ID: ${CURRENT_USER_PROFILE_ID}`}</p>
      </div>
    );
  }

  const fullName = `${profile.user_firstname || ""} ${profile.user_lastname || ""}`.trim() || "Người dùng";

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (profile.user_avatar && profile.user_avatar.includes("storage/")) {
      return `http://localhost:8000/${profile.user_avatar}`;
    }
    return profile.user_avatar || "https://placehold.co/150x150/e0e7ff/3730a3?text=AVT";
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Hồ Sơ Người Dùng
        </h1>
        <div className="space-x-4 flex items-center">
          
          {/* 👉 Nút Xem Giảng viên khác: Chỉ hiện nếu có quyền VIEW */}
          {permissions.is_view && (
            <Button
              onClick={() => setIsViewingTeachers(true)}
              className="bg-purple-600 text-white hover:bg-purple-700 shadow-md flex items-center gap-2"
            >
              <Shield className="w-4 h-4"/> Xem danh sách người dùng
            </Button>
          )}

          {/* 👉 Nút Chỉnh sửa: Chỉ hiện nếu có quyền EDIT */}
          {permissions.is_edit && (
            <Button
              onClick={handleEditClick}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            >
              Chỉnh sửa hồ sơ
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột 1: Avatar */}
        <Card className="lg:col-span-1 bg-indigo-50 border border-indigo-200">
          <div className="flex flex-col items-center">
            <img
              src={getAvatarUrl()}
              alt="Avatar"
              className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-lg mb-4 transition duration-300 hover:scale-[1.05]"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/e0e7ff/3730a3?text=AVT"; }}
            />
            <CardTitle className="text-center mb-1 text-indigo-800">
              {fullName}
            </CardTitle>
            <p className="text-sm font-light text-indigo-600 mb-4">
              {profile.user?.user_email || "Email không có"}
            </p>
            <div className="inline-block bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full text-xs font-bold">
              {profile.roles?.role_name || "Role N/A"}
            </div>
          </div>
        </Card>

        {/* Cột 2: Thông tin cá nhân */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin Cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <DetailItem label="Mã User" value={profile.user?.user_code} />
              <DetailItem label="Tên đăng nhập" value={profile.user?.user_name} />
              <DetailItem label="Họ tên" value={fullName} />
              <DetailItem label="Điện thoại" value={profile.user_phone} />
              <DetailItem label="Giới tính" value={profile.user_sex === 1 ? "Nam" : profile.user_sex === 0 ? "Nữ" : "Chưa rõ"} />
              <DetailItem label="Địa chỉ" value={profile.address} />
              <DetailItem label="Ngày tạo hồ sơ" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : "N/A"} />
              <DetailItem label="Lần đăng nhập cuối" value={profile.user?.user_last_login || "Chưa bao giờ"} />
            </div>
          </CardContent>
        </Card>

        {/* Cột 3: Thông tin hệ thống */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Thông tin Hệ thống</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2">
            <DetailItem label="ID Profile" value={profile.user_profile_id} />
            <DetailItem label="ID User" value={profile.user_id} />
            <DetailItem label="Loại User ID" value={profile.category_user_type_id} />
            <DetailItem label="Tình trạng kích hoạt" value={profile.user?.user_is_activated === 1 ? "Đã kích hoạt" : "Chưa kích hoạt"} />
            <DetailItem label="Tình trạng cấm" value={profile.user?.user_is_banned === 0 ? "Bình thường" : "Đã bị cấm"} />
            <DetailItem label="Device Token" value={profile.user_device_token} />
          </CardContent>
        </Card>
      </div>

      {/* Modal Chỉnh sửa Hồ sơ */}
      <Modal isOpen={isEditing} onClose={handleCloseEdit} title="Chỉnh sửa Hồ sơ Cá nhân">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
            <img src={getAvatarUrl()} alt="Avatar Preview" className="w-24 h-24 object-cover rounded-full border-2 border-indigo-300" />
            <input type="file" id="user_avatar_file" name="user_avatar_file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="user_lastname" className="block text-sm font-medium text-gray-700">Họ</label>
              <input type="text" id="user_lastname" name="user_lastname" value={editFormData.user_lastname} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" maxLength="55" />
            </div>
            <div>
              <label htmlFor="user_firstname" className="block text-sm font-medium text-gray-700">Tên</label>
              <input type="text" id="user_firstname" name="user_firstname" value={editFormData.user_firstname} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" maxLength="55" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="user_phone" className="block text-sm font-medium text-gray-700">Điện thoại</label>
              <input type="tel" id="user_phone" name="user_phone" value={editFormData.user_phone} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" maxLength="15" />
            </div>
            <div>
              <label htmlFor="user_sex" className="block text-sm font-medium text-gray-700">Giới tính</label>
              <select id="user_sex" name="user_sex" value={editFormData.user_sex} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value={-1}>Chưa rõ</option>
                <option value={1}>Nam</option>
                <option value={0}>Nữ</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <input type="text" id="address" name="address" value={editFormData.address} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" maxLength="255" />
          </div>

          {saveError && <div className="text-red-600 bg-red-100 p-3 rounded-md text-sm"><p className="font-semibold">Lỗi:</p><p>{saveError}</p></div>}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={handleCloseEdit} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Hủy</Button>
            <Button type="submit" className={`text-white shadow-md ${isSaving ? "bg-green-400" : "bg-green-600 hover:bg-green-700"}`} disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Xem Giảng viên khác (Chỉ hiện nếu có quyền VIEW) */}
      <AllTeachersModal
        isOpen={isViewingTeachers}
        onClose={() => setIsViewingTeachers(false)}
        teachers={allProfiles || []}
        currentUserId={CURRENT_USER_PROFILE_ID}
      />
    </div>
  );
}