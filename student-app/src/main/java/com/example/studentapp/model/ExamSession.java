package com.example.studentapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true) 
public class ExamSession {

    // Thuộc tính Form Quản Lý (Mới)
    private String maHP; // Mã học phần
    private String tenHP; // Tên học phần
    private String lopSV; // Lớp sinh viên
    private String soSV;  // Số sinh viên
    private String hinhThucThi; // Hình thức thi
    
    // Thuộc tính Form PĐT và Kiểm tra ca thi (Cũ)
    private String maCaThi;
    private String tenMonHoc;
    private String phongThi;
    private String ngayThi;
    private String gioThi;
    private String trangThai;
    private String canBoCoiThi;
    private int soMayTrong;
    private int soBaiNop;

    // Constructor rỗng (Bắt buộc cho Jackson)
    public ExamSession() {
    }

    // --- Getters and Setters cho các trường mới ---

    public String getMaHP() { return maHP; }
    public void setMaHP(String maHP) { this.maHP = maHP; }

    public String getTenHP() { return tenHP; }
    public void setTenHP(String tenHP) { this.tenHP = tenHP; }

    public String getLopSV() { return lopSV; }
    public void setLopSV(String lopSV) { this.lopSV = lopSV; }

    public String getSoSV() { return soSV; } // Dùng String để dễ dàng nhập Form
    public void setSoSV(String soSV) { this.soSV = soSV; }

    public String getHinhThucThi() { return hinhThucThi; }
    public void setHinhThucThi(String hinhThucThi) { this.hinhThucThi = hinhThucThi; }
    
    // --- Getters and Setters cho các trường cũ ---

    public String getMaCaThi() { return maCaThi; }
    public void setMaCaThi(String maCaThi) { this.maCaThi = maCaThi; }

    public String getTenMonHoc() { return tenMonHoc; }
    public void setTenMonHoc(String tenMonHoc) { this.tenMonHoc = tenMonHoc; }

    public String getPhongThi() { return phongThi; }
    public void setPhongThi(String phongThi) { this.phongThi = phongThi; }

    public String getNgayThi() { return ngayThi; }
    public void setNgayThi(String ngayThi) { this.ngayThi = ngayThi; }

    public String getGioThi() { return gioThi; }
    public void setGioThi(String gioThi) { this.gioThi = gioThi; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public String getCanBoCoiThi() { return canBoCoiThi; }
    public void setCanBoCoiThi(String canBoCoiThi) { this.canBoCoiThi = canBoCoiThi; }
    
    public int getSoMayTrong() { return soMayTrong; }
    public void setSoMayTrong(int soMayTrong) { this.soMayTrong = soMayTrong; }

    public int getSoBaiNop() { return soBaiNop; }
    public void setSoBaiNop(int soBaiNop) { this.soBaiNop = soBaiNop; }
}