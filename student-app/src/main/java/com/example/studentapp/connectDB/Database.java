package com.example.studentapp.connectDB;

import java.sql.Connection;
import java.sql.DriverManager;

public class Database {
    private static final String URL = "jdbc:mysql://localhost:3306/laravel";
    private static final String USER = "root";
    private static final String PASSWORD = "secret";

    public static Connection connectDB(){
        try {
            Connection conn =DriverManager.getConnection(URL,USER,PASSWORD);
            System.out.println("Connected to database successfully");
            return conn;
        }catch (Exception e){
            e.printStackTrace();
            System.out.println("Connection Failed!");
            return null;
        }
    }
}