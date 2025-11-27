package com.example.studentapp.model;

import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

public class ExamSession {
    // --- Nhóm 1: Dành cho KiemTraCaThi ---
    private final StringProperty maCaThi;
    private final StringProperty tenMonHoc;
    private final StringProperty phongThi;
    private final StringProperty ngayThi;
    private final StringProperty gioThi;
    private final StringProperty canBoCoiThi;
    private final StringProperty trangThai;
    private final StringProperty soBaiNop;
    private final StringProperty soMayTrong;

    // --- Nhóm 2: Dành cho QuanLyLichThi (Bổ sung thêm) ---
    private final StringProperty maHP;
    private final StringProperty tenHP;
    private final StringProperty lopSV;
    private final StringProperty soSV;
    private final StringProperty hinhThucThi;

    public ExamSession() {
        // Khởi tạo mặc định để tránh lỗi NullPointerException
        this.maCaThi = new SimpleStringProperty("");
        this.tenMonHoc = new SimpleStringProperty("");
        this.phongThi = new SimpleStringProperty("");
        this.ngayThi = new SimpleStringProperty("");
        this.gioThi = new SimpleStringProperty("");
        this.canBoCoiThi = new SimpleStringProperty("");
        this.trangThai = new SimpleStringProperty("");
        this.soBaiNop = new SimpleStringProperty("0");
        this.soMayTrong = new SimpleStringProperty("0");

        this.maHP = new SimpleStringProperty("");
        this.tenHP = new SimpleStringProperty(""); // Có thể map với tenMonHoc nếu muốn
        this.lopSV = new SimpleStringProperty("");
        this.soSV = new SimpleStringProperty("");
        this.hinhThucThi = new SimpleStringProperty("");
    }

    // --- GETTERS & SETTERS CHO TẤT CẢ ---

    // 1. Nhóm KiemTraCaThi
    public String getMaCaThi() {
        return maCaThi.get();
    }

    public StringProperty maCaThiProperty() {
        return maCaThi;
    }

    public void setMaCaThi(String v) {
        this.maCaThi.set(v);
    }

    public String getTenMonHoc() {
        return tenMonHoc.get();
    }

    public StringProperty tenMonHocProperty() {
        return tenMonHoc;
    }

    public void setTenMonHoc(String v) {
        this.tenMonHoc.set(v);
    }

    public String getPhongThi() {
        return phongThi.get();
    }

    public StringProperty phongThiProperty() {
        return phongThi;
    }

    public void setPhongThi(String v) {
        this.phongThi.set(v);
    }

    public String getNgayThi() {
        return ngayThi.get();
    }

    public StringProperty ngayThiProperty() {
        return ngayThi;
    }

    public void setNgayThi(String v) {
        this.ngayThi.set(v);
    }

    public String getGioThi() {
        return gioThi.get();
    }

    public StringProperty gioThiProperty() {
        return gioThi;
    }

    public void setGioThi(String v) {
        this.gioThi.set(v);
    }

    public String getCanBoCoiThi() {
        return canBoCoiThi.get();
    }

    public StringProperty canBoCoiThiProperty() {
        return canBoCoiThi;
    }

    public void setCanBoCoiThi(String v) {
        this.canBoCoiThi.set(v);
    }

    public String getTrangThai() {
        return trangThai.get();
    }

    public StringProperty trangThaiProperty() {
        return trangThai;
    }

    public void setTrangThai(String v) {
        this.trangThai.set(v);
    }

    public String getSoBaiNop() {
        return soBaiNop.get();
    }

    public StringProperty soBaiNopProperty() {
        return soBaiNop;
    }

    public void setSoBaiNop(String v) {
        this.soBaiNop.set(v);
    }

    public String getSoMayTrong() {
        return soMayTrong.get();
    }

    public StringProperty soMayTrongProperty() {
        return soMayTrong;
    }

    public void setSoMayTrong(String v) {
        this.soMayTrong.set(v);
    }

    // 2. Nhóm QuanLyLichThi (Các phương thức còn thiếu)
    public String getMaHP() {
        return maHP.get();
    }

    public StringProperty maHPProperty() {
        return maHP;
    }

    public void setMaHP(String v) {
        this.maHP.set(v);
    }

    public String getTenHP() {
        return tenHP.get();
    }

    public StringProperty tenHPProperty() {
        return tenHP;
    }

    public void setTenHP(String v) {
        this.tenHP.set(v);
    }

    public String getLopSV() {
        return lopSV.get();
    }

    public StringProperty lopSVProperty() {
        return lopSV;
    }

    public void setLopSV(String v) {
        this.lopSV.set(v);
    }

    public String getSoSV() {
        return soSV.get();
    }

    public StringProperty soSVProperty() {
        return soSV;
    }

    public void setSoSV(String v) {
        this.soSV.set(v);
    }

    public String getHinhThucThi() {
        return hinhThucThi.get();
    }

    public StringProperty hinhThucThiProperty() {
        return hinhThucThi;
    }

    public void setHinhThucThi(String v) {
        this.hinhThucThi.set(v);
    }
}