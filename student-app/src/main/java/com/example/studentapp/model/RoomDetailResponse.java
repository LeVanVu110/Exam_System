package com.example.studentapp.model;

public class RoomDetailResponse {
    private boolean success;
    private String message;
    private RoomModel data;

    public Boolean getSuccess() {return success;}
    public void setSuccess(boolean success) {this.success = success;}

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public RoomModel getData() {
        return data;
    }
    public void setData(RoomModel data) {
        this.data = data;
    }
}