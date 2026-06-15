package com.gymmanagement.gym_management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serves uploaded files (equipment images, etc.) as static resources.
 *
 * Files stored in uploads/ (relative to working directory) are accessible at
 * http://localhost:8080/uploads/...
 *
 * Example: uploads/equipments/treadmill-a1b2c3d4.jpg
 *       → http://localhost:8080/uploads/equipments/treadmill-a1b2c3d4.jpg
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = Paths.get("uploads").toAbsolutePath().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
