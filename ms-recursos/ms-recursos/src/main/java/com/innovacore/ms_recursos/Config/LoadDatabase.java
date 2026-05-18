package com.innovacore.ms_recursos.Config;

import com.innovacore.ms_recursos.Model.Empleado;
import com.innovacore.ms_recursos.Repository.EmpleadoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;

@Configuration
public class LoadDatabase {

    @Bean
    CommandLineRunner initDatabase(EmpleadoRepository empleadoRepository) {
        return args -> {
            if (empleadoRepository.count() == 0) {
                Empleado e1 = new Empleado();
                e1.setNombre("Carlos");
                e1.setApellido("Pérez");
                e1.setCorreo("carlos.perez@innovacore.cl");
                e1.setCargo("Desarrollador Senior");
                e1.setEspecialidad("Backend Java");
                e1.setDisponibilidad("DISPONIBLE");
                e1.setEstado(1);
                e1.setFechaRegistro(LocalDateTime.now());
                empleadoRepository.save(e1);

                Empleado e2 = new Empleado();
                e2.setNombre("María");
                e2.setApellido("González");
                e2.setCorreo("maria.gonzalez@innovacore.cl");
                e2.setCargo("Desarrolladora Frontend");
                e2.setEspecialidad("React");
                e2.setDisponibilidad("DISPONIBLE");
                e2.setEstado(1);
                e2.setFechaRegistro(LocalDateTime.now());
                empleadoRepository.save(e2);

                Empleado e3 = new Empleado();
                e3.setNombre("Pedro");
                e3.setApellido("Soto");
                e3.setCorreo("pedro.soto@innovacore.cl");
                e3.setCargo("Arquitecto de Software");
                e3.setEspecialidad("Microservicios");
                e3.setDisponibilidad("DISPONIBLE");
                e3.setEstado(1);
                e3.setFechaRegistro(LocalDateTime.now());
                empleadoRepository.save(e3);

                System.out.println("✅ Empleados iniciales cargados");
            }
        };
    }
}