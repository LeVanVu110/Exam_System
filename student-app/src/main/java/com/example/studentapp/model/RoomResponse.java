package com.example.studentapp.model;

import java.util.List;

public class ApiResponse {
    private boolean success;
    private String message;
    private String date;
    private int count;

    private List<RoomModel> data;

    public Boolean getSuccess() {return success;}
    public void setSuccess(boolean success) {this.success = success;}

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public String getDate() {return date;}
    public void setDate(String date) {this.date = date;}

    public int getCount() {
        return count;
    }
    public void setCount(int count) {
        this.count = count;
    }

    public List<RoomModel> getData() {
        return data;
    }
    public void setData(List<RoomModel> data) {
        this.data = data;
    }
}
