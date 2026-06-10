package com.gymmanagement.gym_management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** Enables @Async on EmailService so emails are sent in a background thread */
@Configuration
@EnableAsync
public class AsyncConfig {}
