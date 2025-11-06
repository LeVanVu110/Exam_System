package com.example.studentapp.view; // Hoặc package UI của bạn

import com.example.studentapp.model.CheckResultModel;
import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.layout.Region;

import java.util.List;

/**
 * Một Dialog tùy chỉnh để hiển thị kết quả quét một cách gọn gàng,
 * sử dụng Accordion để "xổ ra" xem chi tiết.
 */
public class ScanResultDialog extends Dialog<ButtonType> {

    public ScanResultDialog(CheckResultModel result, int expectedStudents) {
        setTitle("Kết quả kiểm tra ổ G:\\");
        setHeaderText("Thống kê tổng quan tình hình nộp bài");

        // 1. Tạo phần Tóm tắt (Summary)
        GridPane summaryGrid = createSummaryGrid(result, expectedStudents);

        // 2. Tạo phần Chi tiết (Details) dùng Accordion
        Accordion detailsAccordion = new Accordion();
        detailsAccordion.getPanes().addAll(
                createDetailPane("✅ Đã nộp (.txt)", result.getStudentWithTxt()),
                createDetailPane("❌ Chưa nộp (thiếu .txt)", result.getStudentWithoutTxt()),
                createDetailPane("🚫 Máy vắng (không folder)", result.getMachinesWithoutStudent()),
                createDetailPane("⚠ Máy vi phạm (nhiều folder)", result.getMachinesMultipleStudents()),
                createDetailPane("📂 Thư mục máy bị thiếu", result.getMissingMachineFolder())
        );

        // 3. Tạo layout chính và thêm 2 phần vào
        VBox mainLayout = new VBox(10, summaryGrid, detailsAccordion);
        mainLayout.setPadding(new Insets(10));

        // 4. Thiết lập Dialog
        getDialogPane().setContent(mainLayout);
        getDialogPane().setPrefWidth(600);
        getDialogPane().getButtonTypes().add(ButtonType.OK);
        setResizable(true);

        getDialogPane().setMinHeight(Region.USE_PREF_SIZE);
        getDialogPane().setPrefHeight(500);
    }

    /**
     * Helper tạo phần tóm tắt
     */
    private GridPane createSummaryGrid(CheckResultModel result, int expectedStudents) {
        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(8);

        // Hàng 1: Dự kiến
        grid.add(new Label("Sinh viên đi:"), 0, 0);
        Label expectedLabel = new Label(String.valueOf(expectedStudents));
        expectedLabel.setFont(Font.font("System", FontWeight.BOLD, 14));
        grid.add(expectedLabel, 1, 0);

        // Hàng 2: Tìm thấy
        grid.add(new Label("Thư mục tìm thấy:"), 0, 1);
        Label foundLabel = new Label(String.valueOf(result.getTotalStudentFoldersFound()));
        foundLabel.setFont(Font.font("System", FontWeight.BOLD, 14));
        if (result.getTotalStudentFoldersFound() != expectedStudents) {
            foundLabel.setStyle("-fx-text-fill: red;");
        } else {
            foundLabel.setStyle("-fx-text-fill: green;");
        }
        grid.add(foundLabel, 1, 1);

        // Hàng 3: Đã nộp
        grid.add(new Label("Đã nộp (có .txt):"), 0, 2);
        Label withTxtLabel = new Label(String.valueOf(result.getStudentWithTxt().size()));
        withTxtLabel.setFont(Font.font("System", FontWeight.BOLD, 14));
        withTxtLabel.setStyle("-fx-text-fill: blue;");
        grid.add(withTxtLabel, 1, 2);

        // Hàng 4: Vi phạm
        grid.add(new Label("Vi phạm (nhiều folder):"), 0, 3);
        Label multipleLabel = new Label(String.valueOf(result.getMachinesMultipleStudents().size()));
        multipleLabel.setFont(Font.font("System", FontWeight.BOLD, 14));
        if (result.getMachinesMultipleStudents().size() > 0) {
            multipleLabel.setStyle("-fx-text-fill: orange;");
        }
        grid.add(multipleLabel, 1, 3);

        return grid;
    }

    /**
     * Helper tạo một TitledPane chứa ListView cho phần chi tiết
     */
    private TitledPane createDetailPane(String title, List<String> data) {
        ListView<String> listView = new ListView<>();

        if (data.isEmpty()) {
            listView.setPlaceholder(new Label("(Không có dữ liệu)"));
            // Set một chiều cao cố định cho placeholder
            listView.setPrefHeight(40);
        } else {
            listView.setItems(FXCollections.observableArrayList(data));
            // Tính toán chiều cao dựa trên nội dung
            listView.setPrefHeight(Math.min(data.size() * 28, 400));
        }

        String fullTitle = String.format("%s (%d)", title, data.size());
        return new TitledPane(fullTitle, listView);
    }
}