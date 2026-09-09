package com.logs.journal;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class LogsApplication {

    public static void main(String[] args) {
        loadEnvironmentVariables();
        SpringApplication.run(LogsApplication.class, args);
    }

    private static void loadEnvironmentVariables() {
        try {
            // Check current directory or parent directory for .env file
            String envPath = "./";
            if (!new File(".env").exists() && new File("../.env").exists()) {
                envPath = "../";
            }

            Dotenv dotenv = Dotenv.configure()
                    .directory(envPath)
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
        } catch (Exception e) {
            // Ignore if .env is not present; standard system env variables will be used
        }
    }
}
