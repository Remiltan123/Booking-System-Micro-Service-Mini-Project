package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        var context = SpringApplication.run(ApiGatewayApplication.class, args);

        Environment env = context.getEnvironment();
        String port = env.getProperty("server.port");

        System.out.println("API Gateway running on:" + port);
    }
}