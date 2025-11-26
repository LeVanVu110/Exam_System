package com.example.studentapp.model;

import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

public class CaThi {
    private final StringProperty maHP;
    private final StringProperty tenHP;
    private final StringProperty ngayThi;
    private final StringProperty caThi;
    private final StringProperty phongThi;
    // --- Thêm các trường mới ---
    private final StringProperty cbct;      // Cán bộ coi thi
    private final StringProperty soLuong;   // Số lượng SV
    private final StringProperty trangThai; // Status

    public CaThi(String maHP, String tenHP, String ngayThi, String caThi, String phongThi, String cbct, String soLuong, String trangThai) {
        this.maHP = new SimpleStringProperty(maHP);
        this.tenHP = new SimpleStringProperty(tenHP);
        this.ngayThi = new SimpleStringProperty(ngayThi);
        this.caThi = new SimpleStringProperty(caThi);
        this.phongThi = new SimpleStringProperty(phongThi);
        this.cbct = new SimpleStringProperty(cbct);
        this.soLuong = new SimpleStringProperty(soLuong);
        this.trangThai = new SimpleStringProperty(trangThai);
    }

    public StringProperty maHPProperty() { return maHP; }
    public StringProperty tenHPProperty() { return tenHP; }
    public StringProperty ngayThiProperty() { return ngayThi; }
    public StringProperty caThiProperty() { return caThi; }
    public StringProperty phongThiProperty() { return phongThi; }
    public StringProperty cbctProperty() { return cbct; }
    public StringProperty soLuongProperty() { return soLuong; }
    public StringProperty trangThaiProperty() { return trangThai; }

    public String getMaHP() { return maHP.get(); }
    public String getTenHP() { return tenHP.get(); }
    public String getNgayThi() { return ngayThi.get(); }
    public String getCaThi() { return caThi.get(); }
    public String getPhongThi() { return phongThi.get(); }
    public String getCbct() { return cbct.get(); }
    public String getSoLuong() { return soLuong.get(); }
    public String getTrangThai() { return trangThai.get(); }
}