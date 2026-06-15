package com.innovacore.ms_recursos;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb-recursos;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.rabbitmq.host=localhost",
        "spring.rabbitmq.port=5672",
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false"
})
class MsRecursosApplicationTests {

    @Test
    void contextLoads() {
        // Verifica que el contexto de Spring arranca correctamente
    }
}