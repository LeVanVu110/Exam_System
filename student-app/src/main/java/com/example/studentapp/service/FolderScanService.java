package com.example.studentapp.service; // Hoặc package tương ứng của bạn

import com.example.studentapp.model.CheckResultModel;
import java.io.File;
import java.util.Arrays;
import java.util.stream.Collectors;

public class FolderScanService {

    public CheckResultModel scanFolders(String baseDrive, int totalMachines) {
        CheckResultModel result = new CheckResultModel();
        int totalFound = 0;

        for (int i = 1; i <= totalMachines; i++) {
            String machineName = "May" + i;
            File machineDir = new File(baseDrive + machineName);

            if (!machineDir.exists() || !machineDir.isDirectory()) {
                result.getMissingMachineFolder().add(machineName + " (thư mục máy bị thiếu)");
                result.getMachinesWithoutStudent().add(machineName + " (missing)");
                continue;
            }

            File[] studentFolders = machineDir.listFiles(File::isDirectory);

            if (studentFolders == null || studentFolders.length == 0) {
                result.getMachinesWithoutStudent().add(machineName);
            } else if (studentFolders.length == 1) {
                File studentFolder = studentFolders[0];
                result.getMachinesWithStudent().add(machineName + " - " + studentFolder.getName());
                totalFound += 1;

                File[] txtFiles = studentFolder.listFiles((d, name) -> name.toLowerCase().endsWith(".txt"));
                if (txtFiles != null && txtFiles.length > 0) {
                    result.getStudentWithTxt().add(machineName + " - " + studentFolder.getName());
                } else {
                    result.getStudentWithoutTxt().add(machineName + " - " + studentFolder.getName());
                }
            } else {
                String names = Arrays.stream(studentFolders).map(File::getName).collect(Collectors.joining(", "));
                result.getMachinesMultipleStudents().add(machineName + " - [" + names + "]");
                totalFound += studentFolders.length;

                for (File sf : studentFolders) {
                    File[] txtFiles = sf.listFiles((d, name) -> name.toLowerCase().endsWith(".txt"));
                    if (txtFiles != null && txtFiles.length > 0) {
                        result.getStudentWithTxt().add(machineName + " - " + sf.getName());
                    } else {
                        result.getStudentWithoutTxt().add(machineName + " - " + sf.getName());
                    }
                }
            }
        }

        result.setTotalStudentFoldersFound(totalFound);
        return result;
    }
}