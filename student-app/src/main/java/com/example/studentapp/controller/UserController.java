package com.example.studentapp.controller;

import com.example.studentapp.model.User;
import com.example.studentapp.connectDB.Database;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class UserController {
    @FXML
    private TableView<User> tableUsers;
    @FXML
    private TableColumn<User, Integer> colId;
    @FXML
    private TableColumn<User, String> colName;
    @FXML
    private TableColumn<User, String> colEmail;
    @FXML
    private TableColumn<User, Integer> colIsActivated;
    @FXML
    private TableColumn<User, Integer> colIsBanned;
    @FXML
    private TableColumn<User, String> colActivateAt;
    @FXML
    private TableColumn<User, Integer> colBannedAt;
    @FXML
    private TableColumn<User, String> colLastLogin;
    @FXML
    private TableColumn<User, String> colCreatedAt;
    @FXML
    private TableColumn<User, String> colUpdatedAt;

    private ObservableList<User> userList = FXCollections.observableArrayList();

    public void initialize() {
        loadUsers();
    }

    private void loadUsers() {
        try (
                Connection conn = Database.connectDB();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT * FROM users")
        ) {
            while (rs.next()) {
                userList.add(new User(
                        rs.getInt("user_id"),
                        rs.getString("user_name"),
                        rs.getString("user_email"),
                        rs.getInt("user_is_activated"),
                        rs.getInt("user_is_banned"),
                        rs.getString("user_activate_at"),
                        rs.getInt("user_banned_at"),
                        rs.getString("user_last_login"),
                        rs.getString("created_at"),
                        rs.getString("updated_at")
                ));
            }

            colId.setCellValueFactory(new PropertyValueFactory<>("id"));
            colName.setCellValueFactory(new PropertyValueFactory<>("name"));
            colEmail.setCellValueFactory(new PropertyValueFactory<>("email"));
            colIsActivated.setCellValueFactory(new PropertyValueFactory<>("isActivated"));
            colIsBanned.setCellValueFactory(new PropertyValueFactory<>("isBanned"));
            colActivateAt.setCellValueFactory(new PropertyValueFactory<>("activateAt"));
            colBannedAt.setCellValueFactory(new PropertyValueFactory<>("bannedAt"));
            colLastLogin.setCellValueFactory(new PropertyValueFactory<>("lastLogin"));
            colCreatedAt.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
            colUpdatedAt.setCellValueFactory(new PropertyValueFactory<>("updateAt"));

            tableUsers.setItems(userList);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
