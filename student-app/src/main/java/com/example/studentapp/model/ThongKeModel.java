package com.example.studentapp.model;

public class ThongKeModel {
    private String maCaThi;
    private String tenMon;
    private int tongSoMay; // Tổng số máy (số SV dự kiến)
    private int daNop; // Số bài đã nộp
    private int mayTrong; // Số máy trống

    public ThongKeModel(String maCaThi, String tenMon, int tongSoMay, int daNop) {
        this.maCaThi = maCaThi;
        this.tenMon = tenMon;
        this.tongSoMay = tongSoMay;
        this.daNop = daNop;
        this.mayTrong = tongSoMay - daNop; // Tự động tính
        if (this.mayTrong < 0)
            this.mayTrong = 0;
    }

    // Getters
    public String getMaCaThi() {
        return maCaThi;
    }

    public String getTenMon() {
        return tenMon;
    }

    public int getTongSoMay() {
        return tongSoMay;
    }

    public int getDaNop() {
        return daNop;
    }

    public int getMayTrong() {
        return mayTrong;
    }
}