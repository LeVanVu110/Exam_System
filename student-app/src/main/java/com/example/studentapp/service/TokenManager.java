package com.example.studentapp.service;

import java.util.prefs.Preferences;

public class TokenManager {
    private static final String PREF_TOKEN = "access_token";
    private static final String PREF_ROLE = "user_role";
    private static TokenManager instance;
    private Preferences prefs;

    private String accessToken;
    private String userRole;

    private TokenManager() {
        prefs = Preferences.userNodeForPackage(TokenManager.class);
        loadToken();
    }

    // Singleton pattern
    public static TokenManager getInstance() {
        if (instance == null) {
            instance = new TokenManager();
        }
        return instance;
    }

    // Lưu token khi login thành công
    public void saveToken(String token, String role) {
        this.accessToken = token;
        this.userRole = role;

        prefs.put(PREF_TOKEN, token);
        prefs.put(PREF_ROLE, role);

        System.out.println("✓ Token đã lưu: " + token);
        System.out.println("✓ Role: " + role);
    }

    // Load token từ Preferences (khi mở app)
    private void loadToken() {
        this.accessToken = prefs.get(PREF_TOKEN, null);
        this.userRole = prefs.get(PREF_ROLE, null);

        if (accessToken != null) {
            System.out.println("✓ Đã load token từ session trước");
        }
    }

    // Xóa token khi logout
    public void clearToken() {
        this.accessToken = null;
        this.userRole = null;

        prefs.remove(PREF_TOKEN);
        prefs.remove(PREF_ROLE);

        System.out.println("✓ Token đã xóa");
    }

    // Lấy token (dùng cho API calls)
    public String getAccessToken() {
        return accessToken;
    }

    // Lấy Bearer token (có "Bearer " prefix)
    public String getBearerToken() {
        return accessToken != null ? "Bearer " + accessToken : null;
    }

    public String getUserRole() {
        return userRole;
    }

    public boolean isLoggedIn() {
        return accessToken != null && !accessToken.isEmpty();
    }
}