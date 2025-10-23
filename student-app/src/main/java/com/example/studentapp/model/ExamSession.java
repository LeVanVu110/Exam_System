package com.example.studentapp.model;

public class ExamSession {
    private int exam_session_id;
    private String exam_code;
    private String class_code;
    private String subject_name;
    private String exam_date;
    private String exam_time;
    private String exam_room;
    private String exam_faculty;
    private String exam_teacher;

    // Getters và Setters
    public int getExam_session_id() { return exam_session_id; }
    public void setExam_session_id(int exam_session_id) { this.exam_session_id = exam_session_id; }

    public String getExam_code() { return exam_code; }
    public void setExam_code(String exam_code) { this.exam_code = exam_code; }

    public String getClass_code() { return class_code; }
    public void setClass_code(String class_code) { this.class_code = class_code; }

    public String getSubject_name() { return subject_name; }
    public void setSubject_name(String subject_name) { this.subject_name = subject_name; }

    public String getExam_date() { return exam_date; }
    public void setExam_date(String exam_date) { this.exam_date = exam_date; }

    public String getExam_time() { return exam_time; }
    public void setExam_time(String exam_time) { this.exam_time = exam_time; }

    public String getExam_room() { return exam_room; }
    public void setExam_room(String exam_room) { this.exam_room = exam_room; }

    public String getExam_faculty() { return exam_faculty; }
    public void setExam_faculty(String exam_faculty) { this.exam_faculty = exam_faculty; }

    public String getExam_teacher() { return exam_teacher; }
    public void setExam_teacher(String exam_teacher) { this.exam_teacher = exam_teacher; }
}

