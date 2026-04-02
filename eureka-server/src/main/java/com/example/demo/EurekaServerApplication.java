
package com.example.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.core.env.Environment;


@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        var context = SpringApplication.run(EurekaServerApplication.class, args);
        Environment env = context.getEnvironment();
        String port = env.getProperty("server.port");
        System.out.println("Erureka server running on:" + port);
    }
}