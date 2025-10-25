package com.example.studentapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

public class RoomModel {

    // Chúng ta dùng StringProperty cho tất cả để binding cho Label dễ dàng
    private final StringProperty stt = new SimpleStringProperty();
    private final StringProperty lopHP = new SimpleStringProperty();
    private final StringProperty tenHP = new SimpleStringProperty();
    private final StringProperty soTC = new SimpleStringProperty();
    private final StringProperty gioThi = new SimpleStringProperty();
    private final StringProperty ngayThi = new SimpleStringProperty();
    private final StringProperty room = new SimpleStringProperty();
    private final StringProperty soSV = new SimpleStringProperty();
    private final StringProperty tgThi = new SimpleStringProperty();
    private final StringProperty khoaCoiThi = new SimpleStringProperty();

    private final StringProperty cbct1 = new SimpleStringProperty("N/A");
    private final StringProperty cbct2 = new SimpleStringProperty("N/A");

    // Lưu ý: Tên hàm phải khớp với tên JSON key
    @JsonProperty("STT")
    public void setStt(int stt) { this.stt.set(String.valueOf(stt)); }

    @JsonProperty("Lớp HP")
    public void setLopHP(String lopHP) { this.lopHP.set(lopHP); }

    @JsonProperty("Tên HP")
    public void setTenHP(String tenHP) { this.tenHP.set(tenHP); }

    @JsonProperty("Số TC")
    public void setSoTC(int soTC) { this.soTC.set(String.valueOf(soTC)); }

    @JsonProperty("Giờ thi")
    public void setGioThi(String gioThi) { this.gioThi.set(gioThi); }

    @JsonProperty("Ngày thi")
    public void setNgayThi(String ngayThi) { this.ngayThi.set(ngayThi); }

    @JsonProperty("room")
    public void setRoom(String room) { this.room.set(room); }

    @JsonProperty("Số SV")
    public void setSoSV(int soSV) { this.soSV.set(String.valueOf(soSV)); }

    @JsonProperty("TG thi")
    public void setTgThi(int tgThi) { this.tgThi.set(tgThi + " phút"); } // Thêm chữ "phút"

    @JsonProperty("Khoa coi thi")
    public void setKhoaCoiThi(String khoaCoiThi) { this.khoaCoiThi.set(khoaCoiThi); }


    // Jackson sẽ gọi hàm này khi thấy key "CBCT"
    @JsonProperty("CBCT")
    public void setCbct(String rawCbct) {
        if (rawCbct == null || rawCbct.trim().isEmpty()) {
            this.cbct1.set("N/A");
            this.cbct2.set("N/A");
            return;
        }

        String[] names = rawCbct.split(",");

        if (names.length > 0) {
            String name1 = names[0].trim().replaceAll("\\s+", " ");
            this.cbct1.set(name1);
        }

        if (names.length > 1) {
            String name2 = names[1].trim().replaceAll("\\s+", " ");
            this.cbct2.set(name2);
        } else {
            this.cbct2.set("N/A"); // Không có CBCT 2
        }
    }

    // Tên hàm phải là tenBienProperty()
    public StringProperty sttProperty() { return stt; }
    public StringProperty lopHPProperty() { return lopHP; }
    public StringProperty tenHPProperty() { return tenHP; }
    public StringProperty soTCProperty() { return soTC; }
    public StringProperty gioThiProperty() { return gioThi; }
    public StringProperty ngayThiProperty() { return ngayThi; }
    public StringProperty roomProperty() { return room; }
    public StringProperty soSVProperty() { return soSV; }
    public StringProperty tgThiProperty() { return tgThi; }
    public StringProperty khoaCoiThiProperty() { return khoaCoiThi; }
    public StringProperty cbct1Property() { return cbct1; }
    public StringProperty cbct2Property() { return cbct2; }
}