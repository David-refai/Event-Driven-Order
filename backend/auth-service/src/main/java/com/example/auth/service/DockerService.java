package com.example.auth.service;

import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

@Service
public class DockerService {

    public String executeCommand(String... command) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String output = reader.lines().collect(Collectors.joining("\n"));
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    throw new RuntimeException("Command failed with exit code " + exitCode + ": " + output);
                }
                return output;
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to execute docker command", e);
        }
    }

    public void startService(String serviceName) {
        String containerName = "kafka-" + serviceName + "-1";
        executeCommand("docker", "start", containerName);
    }

    public void stopService(String serviceName) {
        String containerName = "kafka-" + serviceName + "-1";
        executeCommand("docker", "stop", containerName);
    }

    public void restartService(String serviceName) {
        String containerName = "kafka-" + serviceName + "-1";
        executeCommand("docker", "restart", containerName);
    }

    public String getContainerStatus(String serviceId) {
        String containerName = "kafka-" + serviceId + "-1";
        try {
            String status = executeCommand("docker", "inspect", "-f", "{{.State.Status}}", containerName).trim();
            return status.equals("running") ? "ONLINE" : "OFFLINE";
        } catch (Exception e) {
            return "OFFLINE";
        }
    }

    public void streamEvents(org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter) {
        new Thread(() -> {
            System.out.println("Starting Docker events stream thread...");
            try {
                ProcessBuilder pb = new ProcessBuilder("docker", "events", "--filter", "type=container", "--format",
                        "{\"status\":\"{{.Status}}\", \"name\":\"{{.Actor.Attributes.name}}\"}");
                Process process = pb.start();
                System.out.println("Docker events process started PID: " + process.pid());
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("Docker event received: " + line);
                        emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event()
                                .name("docker-event")
                                .data(line));
                    }
                } finally {
                    System.out.println("Docker events stream finished or closed.");
                    process.destroy();
                }
            } catch (Exception e) {
                System.err.println("Error in Docker events stream: " + e.getMessage());
                e.printStackTrace();
                emitter.completeWithError(e);
            }
        }).start();
    }
}
