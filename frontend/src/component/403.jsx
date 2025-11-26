import React from 'react';
import { Link } from 'react-router-dom';

// Trang hiển thị khi user cố truy cập vào nơi không có quyền
const ForbiddenPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4">
      <h1 className="text-9xl font-bold text-red-500">403</h1>
      <h2 className="text-3xl font-semibold mt-4 text-gray-800">Truy cập bị từ chối</h2>
      <p className="text-gray-600 mt-2 text-lg">
        Xin lỗi, bạn không có quyền "Xem" (is_view) màn hình này.
      </p>
      
      <div className="mt-8">
        <Link 
          to="/" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-300"
        >
          Quay về Trang chủ
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;