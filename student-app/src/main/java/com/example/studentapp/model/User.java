package com.example.studentapp.model;

public class User {
    private int id;
    private String name;
    private String email;
    private int isActivated;
    private int isBanned;
    private String activateAt;
    private int bannedAt;
    private String lastLogin;
    private String createdAt;
    private String updateAt;

    public User(int id, String name, String email, int isActivated, int isBanned, String activateAt, int bannedAt, String createdAt, String lastLogin, String updateAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.isActivated = isActivated;
        this.isBanned = isBanned;
        this.activateAt = activateAt;
        this.bannedAt = bannedAt;
        this.lastLogin = lastLogin;
        this.createdAt = createdAt;
        this.updateAt = updateAt;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public int getIsActivated() {
        return isActivated;
    }

    public int getIsBanned() {
        return isBanned;
    }

    public String getActivateAt() {
        return activateAt;
    }

    public int getBannedAt() {
        return bannedAt;
    }

    public String getLastLogin() {
        return lastLogin;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getUpdateAt() {
        return updateAt;
    }
}
