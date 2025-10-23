package com.example.studentapp.model;

public class UploadResponse {
    private boolean success;
    private String message;
    private String fileName;
    private String fileUrl;

    // ✅ Constructor trống (bắt buộc cho Jackson hoặc Gson)
    public UploadResponse() {
    }

    // ✅ Constructor đầy đủ
    public UploadResponse(boolean success, String message, String fileName, String fileUrl) {
        this.success = success;
        this.message = message;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
    }

    // ✅ Getter & Setter
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}
