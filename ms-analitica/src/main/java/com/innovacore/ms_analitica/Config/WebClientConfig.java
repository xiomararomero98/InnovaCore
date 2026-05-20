package com.innovacore.ms_analitica.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${ms.seguridad.url}")
    private String seguridadUrl;

    @Value("${ms.proyectos.url}")
    private String proyectosUrl;

    @Value("${ms.recursos.url}")
    private String recursosUrl;

    @Bean(name = "seguridadWebClient")
    public WebClient seguridadWebClient() {
        return WebClient.builder().baseUrl(seguridadUrl).build();
    }

    @Bean(name = "proyectosWebClient")
    public WebClient proyectosWebClient() {
        return WebClient.builder().baseUrl(proyectosUrl).build();
    }

    @Bean(name = "recursosWebClient")
    public WebClient recursosWebClient() {
        return WebClient.builder().baseUrl(recursosUrl).build();
    }
}