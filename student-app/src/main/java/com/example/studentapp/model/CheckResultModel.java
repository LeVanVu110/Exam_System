package com.example.studentapp.model; // Hoặc package tương ứng của bạn

import java.util.ArrayList;
import java.util.List;

/**
 * Model chứa toàn bộ kết quả của việc quét thư mục.
 */
public class CheckResultModel {

    // Tổng thư mục
    private int totalStudentFoldersFound = 0;

    private final List<String> machinesWithStudent = new ArrayList<>();

    private final List<String> machinesWithoutStudent = new ArrayList<>();

    private final List<String> machinesMultipleStudents = new ArrayList<>();

    private final List<String> studentWithTxt = new ArrayList<>();

    private final List<String> studentWithoutTxt = new ArrayList<>();

    private final List<String> missingMachineFolder = new ArrayList<>();

    // Thêm các phương thức Getters
    public int getTotalStudentFoldersFound() {
        return totalStudentFoldersFound;
    }

    public void setTotalStudentFoldersFound(int totalStudentFoldersFound) {
        this.totalStudentFoldersFound = totalStudentFoldersFound;
    }

    // (Bạn có thể tạo setter hoặc để public nếu muốn, nhưng getter là đủ)
    public List<String> getMachinesWithStudent() {
        return machinesWithStudent;
    }

    public List<String> getMachinesWithoutStudent() {
        return machinesWithoutStudent;
    }

    public List<String> getMachinesMultipleStudents() {
        return machinesMultipleStudents;
    }

    public List<String> getStudentWithTxt() {
        return studentWithTxt;
    }

    public List<String> getStudentWithoutTxt() {
        return studentWithoutTxt;
    }

    public List<String> getMissingMachineFolder() {
        return missingMachineFolder;
    }
}