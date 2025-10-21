package com.example.studentapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import javafx.beans.property.IntegerProperty;
import javafx.beans.property.SimpleIntegerProperty;
import javafx.beans.property.StringProperty;
import javafx.beans.property.SimpleStringProperty;

/**
 * Model này đại diện cho cấu trúc JSON lịch thi trả về từ API.
 * Nó sử dụng JavaFX Properties để dễ dàng binding dữ liệu với UI.
 * Nó sử dụng @JsonProperty (từ thư viện Jackson) để map các key JSON
 * (có dấu, khoảng trắng) vào các biến Java.
 */
public class RoomModel {

    // 1. Khai báo các Properties
    // Dùng kiểu đối tượng (IntegerProperty) thay vì kiểu nguyên thủy (int)
    private final IntegerProperty id = new SimpleIntegerProperty();
    private final StringProperty lopHP = new SimpleStringProperty();
    private final StringProperty tenHP = new SimpleStringProperty();
    private final IntegerProperty soTC = new SimpleIntegerProperty();
    private final StringProperty gioThi = new SimpleStringProperty();
    private final StringProperty ngayThi = new SimpleStringProperty();
    private final StringProperty room = new SimpleStringProperty();
    private final IntegerProperty soSV = new SimpleIntegerProperty();
    private final IntegerProperty tgThi = new SimpleIntegerProperty();
    private final StringProperty khoaCoiThi = new SimpleStringProperty();
    private final StringProperty cbct = new SimpleStringProperty();

    // 2. Tạo các phương thức Getters / Setters / Property (chuẩn JavaFX)
    // Jackson/Gson sẽ dùng các setter này để gán giá trị từ JSON vào

    // --- STT ---
    @JsonProperty("STT")
    public int getStt() { return id.get(); }
    public void setStt(int value) { id.set(value); }
    public IntegerProperty idProperty() { return id; }

    // --- Lớp HP ---
    @JsonProperty("Lớp HP")
    public String getLopHP() { return lopHP.get(); }
    public void setLopHP(String value) { lopHP.set(value); }
    public StringProperty lopHPProperty() { return lopHP; }

    // --- Tên HP ---
    @JsonProperty("Tên HP")
    public String getTenHP() { return tenHP.get(); }
    public void setTenHP(String value) { tenHP.set(value); }
    public StringProperty tenHPProperty() { return tenHP; }

    // --- Số TC ---
    @JsonProperty("Số TC")
    public int getSoTC() { return soTC.get(); }
    public void setSoTC(int value) { soTC.set(value); }
    public IntegerProperty soTCProperty() { return soTC; }

    // --- Giờ thi ---
    @JsonProperty("Giờ thi")
    public String getGioThi() { return gioThi.get(); }
    public void setGioThi(String value) { gioThi.set(value); }
    public StringProperty gioThiProperty() { return gioThi; }

    // --- Ngày thi ---
    @JsonProperty("Ngày thi")
    public String getNgayThi() { return ngayThi.get(); }
    public void setNgayThi(String value) { ngayThi.set(value); }
    public StringProperty ngayThiProperty() { return ngayThi; }

    // --- Room ---
    @JsonProperty("room") // Tên key "room" giống tên biến nên không bắt buộc @JsonProperty
    public String getRoom() { return room.get(); }
    public void setRoom(String value) { room.set(value); }
    public StringProperty roomProperty() { return room; }

    // --- Số SV ---
    @JsonProperty("Số SV")
    public int getSoSV() { return soSV.get(); }
    public void setSoSV(int value) { soSV.set(value); }
    public IntegerProperty soSVProperty() { return soSV; }

    // --- TG thi ---
    @JsonProperty("TG thi")
    public int getTgThi() { return tgThi.get(); }
    public void setTgThi(int value) { tgThi.set(value); }
    public IntegerProperty tgThiProperty() { return tgThi; }

    // --- Khoa coi thi ---
    @JsonProperty("Khoa coi thi")
    public String getKhoaCoiThi() { return khoaCoiThi.get(); }
    public void setKhoaCoiThi(String value) { khoaCoiThi.set(value); }
    public StringProperty khoaCoiThiProperty() { return khoaCoiThi; }

    // --- CBCT ---
    @JsonProperty("CBCT")
    public String getCbct() { return cbct.get(); }
    public void setCbct(String value) { cbct.set(value); }
    public StringProperty cbctProperty() { return cbct; }

    // (Nên có) Constructor rỗng
    public RoomModel() {}
}