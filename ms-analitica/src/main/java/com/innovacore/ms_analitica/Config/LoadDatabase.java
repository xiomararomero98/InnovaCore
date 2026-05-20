package com.innovacore.ms_analitica.Config;

import com.innovacore.ms_analitica.Model.MetricaRecurso;
import com.innovacore.ms_analitica.Model.Reporte;
import com.innovacore.ms_analitica.Repository.MetricaRecursoRepository;
import com.innovacore.ms_analitica.Repository.ReporteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class LoadDatabase {

    @Bean
    CommandLineRunner initDatabase(
            ReporteRepository reporteRepository,
            MetricaRecursoRepository metricaRepository) {
        return args -> {

            // ==========================================================
            // REPORTES INICIALES
            // ==========================================================
            if (reporteRepository.count() == 0) {
                Reporte r1 = new Reporte();
                r1.setNombreReporte("Resumen General de Proyectos");
                r1.setFechaGeneracion(LocalDateTime.now());
                r1.setTipoReporte("PROYECTOS");
                r1.setContenidoResumen("Reporte general del estado de los proyectos en curso");
                r1.setIdUsuarioGenera(1L);
                reporteRepository.save(r1);

                Reporte r2 = new Reporte();
                r2.setNombreReporte("Utilización de Recursos");
                r2.setFechaGeneracion(LocalDateTime.now());
                r2.setTipoReporte("RECURSOS");
                r2.setContenidoResumen("Reporte de utilización de empleados");
                r2.setIdUsuarioGenera(1L);
                reporteRepository.save(r2);

                System.out.println("✅ Reportes iniciales cargados");
            }

            // ==========================================================
            // MÉTRICAS DE RECURSOS INICIALES
            // ==========================================================
            if (metricaRepository.count() == 0) {
                MetricaRecurso m1 = new MetricaRecurso();
                m1.setIdEmpleado(1L);
                m1.setFechaMedicion(LocalDate.now());
                m1.setHorasAsignadas(40);
                m1.setHorasDisponibles(45);
                m1.setPorcentajeUtilizacion(Math.round((40.0 / 45.0) * 10000.0) / 100.0);
                metricaRepository.save(m1);

                MetricaRecurso m2 = new MetricaRecurso();
                m2.setIdEmpleado(2L);
                m2.setFechaMedicion(LocalDate.now());
                m2.setHorasAsignadas(0);
                m2.setHorasDisponibles(45);
                m2.setPorcentajeUtilizacion(0.0);
                metricaRepository.save(m2);

                MetricaRecurso m3 = new MetricaRecurso();
                m3.setIdEmpleado(3L);
                m3.setFechaMedicion(LocalDate.now());
                m3.setHorasAsignadas(20);
                m3.setHorasDisponibles(45);
                m3.setPorcentajeUtilizacion(Math.round((20.0 / 45.0) * 10000.0) / 100.0);
                metricaRepository.save(m3);

                System.out.println("✅ Métricas de recursos iniciales cargadas");
            }
        };
    }
}