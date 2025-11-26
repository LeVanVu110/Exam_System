// File: src/main/java/com/example/studentapp/model/CaThi.java
package com.example.studentapp.model;

import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

/**
 * Model đại diện cho thông tin của một ca thi duy nhất.
 */
public class CaThi {
    private final StringProperty maHP;
    private final StringProperty tenHP;
    private final StringProperty ngayThi;
    private final StringProperty caThi;
    private final StringProperty phongThi;

    public CaThi(String maHP, String tenHP, String ngayThi, String caThi, String phongThi) {
        this.maHP = new SimpleStringProperty(maHP);
        this.tenHP = new SimpleStringProperty(tenHP);
        this.ngayThi = new SimpleStringProperty(ngayThi);
        this.caThi = new SimpleStringProperty(caThi);
        this.phongThi = new SimpleStringProperty(phongThi);
    }

    // --- Getters cho JavaFX Properties (quan trọng cho TableView) ---
    public StringProperty maHPProperty() {
        return maHP;
    }

    public StringProperty tenHPProperty() {
        return tenHP;
    }

    public StringProperty ngayThiProperty() {
        return ngayThi;
    }

    public StringProperty caThiProperty() {
        return caThi;
    }

    public StringProperty phongThiProperty() {
        return phongThi;
    }

    // --- Getters chuẩn ---
    public String getMaHP() {
        return maHP.get();
    }

    public String getTenHP() {
        return tenHP.get();
    }

    public String getNgayThi() {
        return ngayThi.get();
    }

    public String getCaThi() {
        return caThi.get();
    }

    public String getPhongThi() {
        return phongThi.get();
    }
}