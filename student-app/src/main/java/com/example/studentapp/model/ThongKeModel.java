package com.example.studentapp.model;

public class ThongKeModel {
    private int id; // ID Ca thi (để gọi API chi tiết)
    private String maCaThi; // Exam Code
    private String tenMon;
    private int tongSoMay;  // Sĩ số / Tổng máy
    private int daNop;      // Số lượng bài nộp thực tế
    private int mayTrong;   // Số máy chưa nộp

    public ThongKeModel(int id, String maCaThi, String tenMon, int tongSoMay, int daNop) {
        this.id = id;
        this.maCaThi = maCaThi;
        this.tenMon = tenMon;
        this.tongSoMay = tongSoMay;
        this.daNop = daNop;
        this.mayTrong = tongSoMay - daNop;
        if (this.mayTrong < 0) this.mayTrong = 0;
    }

    // Getters & Setters
    public int getId() { return id; }
    public String getMaCaThi() { return maCaThi; }
    public String getTenMon() { return tenMon; }
    public int getTongSoMay() { return tongSoMay; }
    public int getDaNop() { return daNop; }
    public void setDaNop(int daNop) { 
        this.daNop = daNop; 
        this.mayTrong = this.tongSoMay - daNop; // Tự động cập nhật máy trống
        if(this.mayTrong < 0) this.mayTrong = 0;
    }
    public int getMayTrong() { return mayTrong; }
}