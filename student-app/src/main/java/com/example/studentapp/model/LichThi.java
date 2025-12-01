package com.example.studentapp.model;

import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import java.time.LocalDate;

public class LichThi {

    private final StringProperty maHP;
    private final StringProperty tenHP;
    private final StringProperty lopSV;
    private final ObjectProperty<LocalDate> ngayThi;
    private final StringProperty gioThi;
    private final StringProperty phongThi;
    private final StringProperty soSV;
    private final StringProperty htThi;
    private final StringProperty cbct;

    public LichThi(String maHP, String tenHP, String lopSV, LocalDate ngayThi, String gioThi, String phongThi,
            String soSV, String htThi, String cbct) {
        this.maHP = new SimpleStringProperty(maHP);
        this.tenHP = new SimpleStringProperty(tenHP);
        this.lopSV = new SimpleStringProperty(lopSV);
        this.ngayThi = new SimpleObjectProperty<>(ngayThi);
        this.gioThi = new SimpleStringProperty(gioThi);
        this.phongThi = new SimpleStringProperty(phongThi);
        this.soSV = new SimpleStringProperty(soSV);
        this.htThi = new SimpleStringProperty(htThi);
        this.cbct = new SimpleStringProperty(cbct);
    }

    // --- Getters and Property Methods cho từng thuộc tính ---

    public String getMaHP() {
        return maHP.get();
    }

    public StringProperty maHPProperty() {
        return maHP;
    }

    public String getTenHP() {
        return tenHP.get();
    }

    public StringProperty tenHPProperty() {
        return tenHP;
    }

    public String getLopSV() {
        return lopSV.get();
    }

    public StringProperty lopSVProperty() {
        return lopSV;
    }

    public LocalDate getNgayThi() {
        return ngayThi.get();
    }

    public ObjectProperty<LocalDate> ngayThiProperty() {
        return ngayThi;
    }

    public String getGioThi() {
        return gioThi.get();
    }

    public StringProperty gioThiProperty() {
        return gioThi;
    }

    public String getPhongThi() {
        return phongThi.get();
    }

    public StringProperty phongThiProperty() {
        return phongThi;
    }

    public String getSoSV() {
        return soSV.get();
    }

    public StringProperty soSVProperty() {
        return soSV;
    }

    public String getHtThi() {
        return htThi.get();
    }

    public StringProperty htThiProperty() {
        return htThi;
    }

    public String getCbct() {
        return cbct.get();
    }

    public StringProperty cbctProperty() {
        return cbct;
    }
}