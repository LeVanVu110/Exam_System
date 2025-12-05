module com.example.studentapp {
    // -------------------------------------------------------------------------
    // CÁC MODULE JAVA NỀN TẢNG
    // -------------------------------------------------------------------------
    
    // Yêu cầu mô-đun HTTP client để ApiService hoạt động (Fix lỗi java.net.http)
    requires java.net.http; 
    
    // JavaFX modules (từ pom.xml)
    requires javafx.controls;
    requires javafx.fxml;
    requires javafx.graphics;
    
    // -------------------------------------------------------------------------
    // CÁC MODULE EXTERNAL (FIX LỖI JACKSON)
    // -------------------------------------------------------------------------
    
    // Thư viện JSON đơn giản (org.json)
    requires org.json; 
    
    // Jackson Annotations (Fix lỗi package com.fasterxml.jackson.annotation)
    requires com.fasterxml.jackson.annotation;
    
    // Jackson Databind (Fix lỗi package com.fasterxml.jackson.databind)
    requires com.fasterxml.jackson.databind;
    
    // -------------------------------------------------------------------------
    // KHAI BÁO MỞ GÓI (REFLECTION)
    // -------------------------------------------------------------------------
    
    // Cho phép FXML truy cập các controller và lớp chính
    opens com.example.studentapp to javafx.fxml;
    opens com.example.studentapp.controller to javafx.fxml;
    
    // Cho phép Jackson Databind truy cập các Model (như RoomModel) để đọc/ghi JSON
    opens com.example.studentapp.model to com.fasterxml.jackson.databind;
    
    // -------------------------------------------------------------------------
    // EXPORTS
    // -------------------------------------------------------------------------
    
    // Xuất gói chính để ứng dụng có thể khởi động
    exports com.example.studentapp; 
}