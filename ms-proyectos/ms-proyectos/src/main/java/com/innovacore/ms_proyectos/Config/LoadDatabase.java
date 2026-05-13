package com.innovacore.ms_proyectos.Config;

import com.innovacore.ms_proyectos.Model.Cliente;
import com.innovacore.ms_proyectos.Repository.ClienteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;

@Configuration
public class LoadDatabase {

    @Bean
    CommandLineRunner initDatabase(ClienteRepository clienteRepository) {
        return args -> {
            if (clienteRepository.count() == 0) {
                clienteRepository.save(new Cliente(null, "ACME Corp", "Retail", "contacto@acme.cl", "+56912345678", LocalDateTime.now()));
                clienteRepository.save(new Cliente(null, "BetaTech", "Fintech", "contacto@betatech.cl", "+56987654321", LocalDateTime.now()));
                clienteRepository.save(new Cliente(null, "NexusBank", "Fintech", "contacto@nexusbank.cl", "+56911223344", LocalDateTime.now()));
                System.out.println("✅ Clientes iniciales cargados");
            }
        };
    }
}