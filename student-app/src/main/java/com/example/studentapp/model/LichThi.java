package com.example.studentapp.model;

import java.time.LocalDate;

public class LichThi {

    // Các thuộc tính phải khớp với JSON và PropertyValueFactory
    private String maHP;
    private String tenHP;
    private String lopSV;
    private LocalDate ngayThi; // Gson sẽ tự động chuyển "2025-10-23" thành LocalDate
    private String gioThi;
    private String phongThi;
    private String soSV;
    private String htThi;
    private String cbct;

    // Constructor (hàm khởi tạo)
    public LichThi(String maHP, String tenHP, String lopSV, LocalDate ngayThi, String gioThi, String phongThi, String soSV, String htThi, String cbct) {
        this.maHP = maHP;
        this.tenHP = tenHP;
        this.lopSV = lopSV;
        this.ngayThi = ngayThi;
        this.gioThi = gioThi;
        this.phongThi = phongThi;
        this.soSV = soSV;
        this.htThi = htThi;
        this.cbct = cbct;
    }
    
    // (Constructor rỗng cũng có thể cần thiết)
    public LichThi() {}

    // --- GETTERS ---
    public String getMaHP() { return maHP; }
    public String getTenHP() { return tenHP; }
    public String getLopSV() { return lopSV; }
    public LocalDate getNgayThi() { return ngayThi; }
    public String getGioThi() { return gioThi; }
    public String getPhongThi() { return phongThi; }
    public String getSoSV() { return soSV; }
    public String getHtThi() { return htThi; }
    public String getCbct() { return cbct; }

    // --- SETTERS ---
    public void setMaHP(String maHP) { this.maHP = maHP; }
    public void setTenHP(String tenHP) { this.tenHP = tenHP; }
    public void setLopSV(String lopSV) { this.lopSV = lopSV; }
    public void setNgayThi(LocalDate ngayThi) { this.ngayThi = ngayThi; }
    public void setGioThi(String gioThi) { this.gioThi = gioThi; }
    public void setPhongThi(String phongThi) { this.phongThi = phongThi; }
    public void setSoSV(String soSV) { this.soSV = soSV; }
    public void setHtThi(String htThi) { this.htThi = htThi; }
    public void setCbct(String cbct) { this.cbct = cbct; }
}