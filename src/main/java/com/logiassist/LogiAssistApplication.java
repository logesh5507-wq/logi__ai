package com.logiassist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Logi_Assist - AI Powered SQL Assistant
 * Entry point for the Spring Boot application.
 *
 * Once running, open http://localhost:8080 in your browser.
 */
@SpringBootApplication
public class LogiAssistApplication {
    public static void main(String[] args) {
        SpringApplication.run(LogiAssistApplication.class, args);
        System.out.println("\n===========================================");
        System.out.println(" Logi_Assist is running!");
        System.out.println(" Open your browser -> http://localhost:8080");
        System.out.println("===========================================\n");
    }
}
