package com.example.studentapp.model;

import java.util.List;

public class ApiResponse {
    private String message;
    private int count;

    private List<RoomModel> data;


    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

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
