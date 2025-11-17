package com.example.mscompras;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class MsComprasApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsComprasApplication.class, args);
    }

}
