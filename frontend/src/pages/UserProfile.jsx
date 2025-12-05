import React, { useState, useEffect, useMemo, useCallback } from "react";
// ✅ IMPORT: SweetAlert2
import Swal from "sweetalert2";

// Giả định các components Card, CardHeader, CardTitle, CardContent đã được định nghĩa
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
// Component Modal
const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black bg-opacity-30">
      <Card className="max-w-xl w-full mx-4">
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

// Hook useFetch (giữ nguyên)
const useFetch = (url, dependencies = []) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [fetchCount, setFetchCount] = React.useState(0);

  const refetch = () => setFetchCount((prev) => prev + 1);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Thêm headers Authorization nếu có token
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

// Component AllTeachersModal (giữ nguyên)
const AllTeachersModal = ({ isOpen, onClose, teachers, currentUserId }) => {
  // Lọc ra các user khác (không phải user hiện tại)
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

// ==========================================================
// [SỬA ĐỔI] HÀM HELPER ĐỌC ID TỪ LOCALSTORAGE
// ==========================================================
const getProfileIdFromStorage = () => {
  try {
    const userInfoStr = localStorage.getItem('USER_INFO');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      
      // Lấy user_profile_id đã được lưu từ Login.jsx
      const profileId = userInfo.user_profile_id; 
      
      // Kiểm tra và trả về số nguyên, hoặc null
      // Dùng Number() để đảm bảo chuyển đổi (nếu là chuỗi số)
      return profileId ? Number(profileId) : null; 
    }
  } catch (e) {
    console.error("Lỗi khi đọc USER_INFO từ localStorage:", e);
  }
  return null; 
};

// Component chính để hiển thị User Profile
export default function UserProfile() {
  const API_URL_ALL = "http://localhost:8000/api/user-profiles";
  
  // ✅ THAY THẾ GIÁ TRỊ CỐ ĐỊNH: Lấy ID từ localStorage
  const CURRENT_USER_PROFILE_ID = getProfileIdFromStorage(); 

  // Kiểm tra nếu ID không hợp lệ, không cần gọi API
  if (CURRENT_USER_PROFILE_ID === null || isNaN(CURRENT_USER_PROFILE_ID)) {
    return (
        <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg max-w-xl mx-auto mt-10">
            <p className="font-bold mb-2">Lỗi truy cập hồ sơ:</p>
            <p>Không tìm thấy ID hồ sơ người dùng trong hệ thống (localStorage). Vui lòng đảm bảo bạn đã đăng nhập hoặc kiểm tra `Login.jsx` đã lưu `user_profile_id` chưa.</p>
        </div>
    );
  }

  // Khởi tạo useFetch với dependencies là ID động
  const { data: allProfiles, loading, error, refetch } = useFetch(API_URL_ALL, [CURRENT_USER_PROFILE_ID]);

  // ✅ SỬ DỤNG ID ĐỘNG ĐỂ LỌC VÀ TẠO URL API
  const profile = React.useMemo(() => {
    if (allProfiles && Array.isArray(allProfiles)) {
      return allProfiles.find(
        (p) => p.user_profile_id === CURRENT_USER_PROFILE_ID
      );
    }
    return null;
  }, [allProfiles, CURRENT_USER_PROFILE_ID]); // Thêm CURRENT_USER_PROFILE_ID vào dependencies

  const API_URL_UPDATE = `${API_URL_ALL}/${CURRENT_USER_PROFILE_ID}`;

  // ... (Các state khác giữ nguyên)
  const [isEditing, setIsEditing] = React.useState(false);
  const [isViewingTeachers, setIsViewingTeachers] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);

  // State và ref cho Avatar
  const [avatarPreview, setAvatarPreview] = React.useState(null);
  const fileInputRef = React.useRef(null);

  // Cập nhật editFormData khi profile được load (giữ nguyên)
  React.useEffect(() => {
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [profile]);

  const DetailItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0 text-gray-700">
      <span className="font-medium text-sm text-gray-500">{label}:</span>
      <span className="text-sm font-semibold text-right">{value || "N/A"}</span>
    </div>
  );

  const handleEditClick = () => {
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(null);
    }
  };

  // ✅ SỬA ĐỔI: Xử lý submit form (Thêm xác nhận Swal)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 1. Hiển thị hộp thoại xác nhận trước khi lưu
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn muốn lưu các thay đổi này chứ? Dữ liệu sẽ được cập nhật.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đúng, Lưu lại!",
      cancelButtonText: "Hủy bỏ",
    });

    // Nếu người dùng hủy, dừng lại
    if (!result.isConfirmed) {
      return;
    }

    // 2. Bắt đầu quá trình lưu
    setIsSaving(true);
    setSaveError(null);

    const formData = new FormData();

    // IMPORTANT: Laravel/PHP cần _method PUT cho các API PUT/PATCH khi dùng FormData
    formData.append("_method", "PUT"); 

    // Append các trường dữ liệu
    formData.append("user_firstname", editFormData.user_firstname);
    formData.append("user_lastname", editFormData.user_lastname);
    formData.append("user_phone", editFormData.user_phone);
    formData.append(
      "user_sex",
      editFormData.user_sex !== -1 ? parseInt(editFormData.user_sex) : ""
    );
    formData.append("address", editFormData.address);
    // [QUAN TRỌNG] Gửi updated_at hiện tại để kiểm tra xung đột
    formData.append("updated_at", editFormData.updated_at); 

    const newFile = fileInputRef.current?.files[0];
    if (newFile) {
      formData.append("user_avatar_file", newFile);
    }
    
    // Lấy token để gửi
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (!token) {
        setSaveError("Không tìm thấy ACCESS_TOKEN. Vui lòng đăng nhập lại.");
        setIsSaving(false);
        return;
    }


    try {
      const response = await fetch(API_URL_UPDATE, {
        method: "POST", // Vẫn dùng POST vì _method=PUT trong FormData
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Cập nhật thất bại.";
        if (errorData.errors) {
          errorMessage = Object.values(errorData.errors).flat().join("; ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        throw new Error(errorMessage);
      }

      refetch();
      handleCloseEdit();

      // Thông báo thành công
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Hồ sơ của bạn đã được cập nhật thành công.",
        confirmButtonText: "Đóng",
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      setSaveError(err.message);

      Swal.fire({
        icon: "error",
        title: "Lỗi cập nhật",
        text: err.message,
        confirmButtonText: "Đóng",
      }).then(() => {
        // Nếu lỗi là do dữ liệu đã thay đổi ở tab khác (Optimistic Locking)
        if (err.message.includes("tab khác") || err.message.includes("cập nhật")) {
          handleCloseEdit(); // đóng modal
          refetch(); // tải dữ liệu mới nhất
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    // ... (loading state giữ nguyên)
    return (
      <div className="p-8 text-center text-lg text-indigo-600">
        <svg
          className="animate-spin h-5 w-5 mr-3 inline-block"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Đang tải dữ liệu hồ sơ...
      </div>
    );
  }

  if (error || !profile) {
    const errorMessage = error
      ? error
      : `Không tìm thấy hồ sơ người dùng có ID: ${CURRENT_USER_PROFILE_ID}`;
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <p className="font-bold mb-2">Lỗi khi tải dữ liệu:</p>
        <p>{errorMessage}</p>
        <p className="text-sm mt-2">
          Vui lòng kiểm tra console hoặc đảm bảo server API đang chạy tại `
          {API_URL_ALL}` và trả về hồ sơ có ID {CURRENT_USER_PROFILE_ID}.
        </p>
      </div>
    );
  }

  const fullName =
    `${profile.user_firstname || ""} ${profile.user_lastname || ""}`.trim() ||
    "Người dùng không tên";

  const isCurrentUserAdmin =
    profile.category_user_type?.user_type_code === "ADMIN";

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;

    if (profile.user_avatar && profile.user_avatar.includes("storage/")) {
      return `http://localhost:8000/${profile.user_avatar}`;
    }

    return (
      profile.user_avatar ||
      "https://placehold.co/150x150/e0e7ff/3730a3?text=AVT"
    );
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Hồ Sơ Người Dùng
        </h1>
        <div className="space-x-4 flex items-center">
          {/* Nút Xem Giảng viên khác (chỉ hiển thị nếu là ADMIN) */}
          {isCurrentUserAdmin && (
            <Button
              onClick={() => setIsViewingTeachers(true)}
              className="bg-purple-600 text-white hover:bg-purple-700 shadow-md"
            >
              Xem giảng viên khác
            </Button>
          )}

          {/* Nút chỉnh sửa */}
          <Button
            onClick={handleEditClick}
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          >
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      </div>

      {/* ... (Phần hiển thị chi tiết hồ sơ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột 1: Thông tin cơ bản và Avatar */}
        <Card className="lg:col-span-1 bg-indigo-50 border border-indigo-200">
          <div className="flex flex-col items-center">
            <img
              src={getAvatarUrl()}
              alt="Avatar"
              className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-lg mb-4 transition duration-300 hover:scale-[1.05]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/150x150/e0e7ff/3730a3?text=AVT";
              }}
            />
            <CardTitle className="text-center mb-1 text-indigo-800">
              {fullName}
            </CardTitle>
            <p className="text-sm font-light text-indigo-600 mb-4">
              {profile.user?.user_email || "Email không có"}
            </p>
            <div className="inline-block bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full text-xs font-bold">
              {profile.roles?.role_name ||
                "Loại người dùng không xác định"}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin Cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <DetailItem label="Mã User" value={profile.user?.user_code} />
              <DetailItem
                label="Tên đăng nhập"
                value={profile.user?.user_name}
              />
              <DetailItem label="Họ tên" value={fullName} />
              <DetailItem label="Điện thoại" value={profile.user_phone} />
              <DetailItem
                label="Giới tính"
                value={
                  profile.user_sex === 1
                    ? "Nam"
                    : profile.user_sex === 0
                    ? "Nữ"
                    : "Chưa rõ"
                }
              />
              <DetailItem label="Địa chỉ" value={profile.address} />
              <DetailItem
                label="Ngày tạo hồ sơ"
                value={
                  profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString("vi-VN")
                    : "N/A"
                }
              />
              <DetailItem
                label="Lần đăng nhập cuối"
                value={profile.user?.user_last_login || "Chưa bao giờ"}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Thông tin Hệ thống & Phân quyền</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2">
            <DetailItem label="ID Profile" value={profile.user_profile_id} />
            <DetailItem label="ID User" value={profile.user_id} />
            <DetailItem
              label="Loại User ID"
              value={profile.category_user_type_id}
            />
            <DetailItem
              label="Tình trạng kích hoạt"
              value={
                profile.user?.user_is_activated === 1
                  ? "Đã kích hoạt"
                  : "Chưa kích hoạt"
              }
            />
            <DetailItem
              label="Tình trạng cấm"
              value={
                profile.user?.user_is_banned === 0 ? "Bình thường" : "Đã bị cấm"
              }
            />
            <DetailItem
              label="Device Token"
              value={profile.user_device_token}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal Chỉnh sửa Hồ sơ */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseEdit}
        title="Chỉnh sửa Hồ sơ Cá nhân"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Phần Đổi Avatar */}
          <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700">
              Ảnh đại diện
            </label>
            <img
              src={getAvatarUrl()}
              alt="Avatar Preview"
              className="w-24 h-24 object-cover rounded-full border-2 border-indigo-300"
            />
            <input
              type="file"
              id="user_avatar_file"
              name="user_avatar_file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 text-center">
              Chọn file ảnh (JPEG, PNG, JPG, GIF). Dung lượng tối đa 2MB.
            </p>
          </div>

          {/* Họ và Tên */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="user_lastname"
                className="block text-sm font-medium text-gray-700"
              >
                Họ
              </label>
              <input
                type="text"
                id="user_lastname"
                name="user_lastname"
                value={editFormData.user_lastname}
                onChange={handleFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                maxLength="55"
              />
            </div>
            <div>
              <label
                htmlFor="user_firstname"
                className="block text-sm font-medium text-gray-700"
              >
                Tên
              </label>
              <input
                type="text"
                id="user_firstname"
                name="user_firstname"
                value={editFormData.user_firstname}
                onChange={handleFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                maxLength="55"
              />
            </div>
          </div>

          {/* Điện thoại và Giới tính */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="user_phone"
                className="block text-sm font-medium text-gray-700"
              >
                Điện thoại
              </label>
              <input
                type="tel"
                id="user_phone"
                name="user_phone"
                value={editFormData.user_phone}
                onChange={handleFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                maxLength="15"
              />
            </div>
            <div>
              <label
                htmlFor="user_sex"
                className="block text-sm font-medium text-gray-700"
              >
                Giới tính
              </label>
              <select
                id="user_sex"
                name="user_sex"
                value={editFormData.user_sex}
                onChange={handleFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value={-1}>Chưa rõ</option>
                <option value={1}>Nam</option>
                <option value={0}>Nữ</option>
              </select>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Địa chỉ
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={editFormData.address}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              maxLength="255"
            />
          </div>

          {/* Hiển thị lỗi */}
          {saveError && (
            <div className="text-red-600 bg-red-100 p-3 rounded-md text-sm">
              <p className="font-semibold">Lỗi:</p>
              <p>{saveError}</p>
            </div>
          )}

          {/* Nút lưu */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleCloseEdit}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className={`text-white shadow-md ${
                isSaving ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={isSaving}
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Xem Giảng viên khác (giữ nguyên) */}
      <AllTeachersModal
        isOpen={isViewingTeachers}
        onClose={() => setIsViewingTeachers(false)}
        teachers={allProfiles || []}
        currentUserId={CURRENT_USER_PROFILE_ID}
      />
    </div>
  );
}