package com.example.studentapp.model;

public class ExamSession {
    // Đảm bảo các tên thuộc tính này khớp chính xác với JSON từ API
    private String maCaThi;
    private String tenMonHoc;
    private String phongThi;
    private String ngayThi;
    private String gioThi;
    private String trangThai;

    // Cần constructor rỗng cho Jackson (JSON parsing)
    public ExamSession() {
    }

    // Getters and Setters
    // (Bạn có thể tự động generate bằng IDE)
    public String getMaCaThi() {
        return maCaThi;
    }

    public void setMaCaThi(String maCaThi) {
        this.maCaThi = maCaThi;
    }

    public String getTenMonHoc() {
        return tenMonHoc;
    }

    public void setTenMonHoc(String tenMonHoc) {
        this.tenMonHoc = tenMonHoc;
    }

    public String getPhongThi() {
        return phongThi;
    }

    public void setPhongThi(String phongThi) {
        this.phongThi = phongThi;
    }

    public String getNgayThi() {
        return ngayThi;
    }

    public void setNgayThi(String ngayThi) {
        this.ngayThi = ngayThi;
    }

    public String getGioThi() {
        return gioThi;
    }

    public void setGioThi(String gioThi) {
        this.gioThi = gioThi;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}