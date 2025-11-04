package com.example.studentapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomModel {

    // Thêm ID, rất quan trọng để có thể gọi API cập nhật sau này
    private final StringProperty examSessionId = new SimpleStringProperty();

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


    // Các @JsonProperty đã được đổi sang key snake_case

    @JsonProperty("exam_session_id")
    public void setExamSessionId(int id) {
        this.examSessionId.set(String.valueOf(id));
    }

    @JsonProperty("class_code")
    public void setLopHP(String lopHP) {
        this.lopHP.set(lopHP);
    }

    @JsonProperty("subject_name")
    public void setTenHP(String tenHP) {
        this.tenHP.set(tenHP);
    }

    @JsonProperty("credits")
    public void setSoTC(int soTC) {
        this.soTC.set(String.valueOf(soTC));
    }

    @JsonProperty("exam_time")
    public void setGioThi(String gioThi) {
        this.gioThi.set(gioThi);
    }

    @JsonProperty("exam_date")
    public void setNgayThi(String ngayThi) {
        this.ngayThi.set(ngayThi);
    }

    @JsonProperty("exam_room")
    public void setRoom(String room) {
        this.room.set(room);
    }

    @JsonProperty("student_count")
    public void setSoSV(int soSV) {
        this.soSV.set(String.valueOf(soSV));
    }

    @JsonProperty("exam_duration")
    public void setTgThi(int tgThi) {
        // Giữ nguyên logic thêm "phút" của bạn
        this.tgThi.set(tgThi + " phút");
    }

    @JsonProperty("exam_faculty")
    public void setKhoaCoiThi(String khoaCoiThi) {
        this.khoaCoiThi.set(khoaCoiThi);
    }

    @JsonProperty("teacher1_name")
    public void setCbct1(String name) {
        if (name != null && !name.trim().isEmpty()) {
            this.cbct1.set(name.trim().replaceAll("\\s+", " "));
        } else {
            this.cbct1.set("N/A");
        }
    }

    @JsonProperty("teacher2_name")
    public void setCbct2(String name) {
        if (name != null && !name.trim().isEmpty()) {
            this.cbct2.set(name.trim().replaceAll("\\s+", " "));
        } else {
            this.cbct2.set("N/A");
        }
    }

    // Controller của bạn sẽ gọi các hàm này
    public StringProperty examSessionIdProperty() { return examSessionId; }
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

    public int getId() {
        try {
            return Integer.parseInt(examSessionId.get());
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}