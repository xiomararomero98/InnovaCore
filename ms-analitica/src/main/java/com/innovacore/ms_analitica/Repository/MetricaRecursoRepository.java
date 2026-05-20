package com.innovacore.ms_analitica.Repository;

import com.innovacore.ms_analitica.Model.MetricaRecurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MetricaRecursoRepository extends JpaRepository<MetricaRecurso, Long> {
    List<MetricaRecurso> findByIdEmpleado(Long idEmpleado);
    List<MetricaRecurso> findByFechaMedicion(LocalDate fechaMedicion);
    List<MetricaRecurso> findByIdEmpleadoAndFechaMedicion(Long idEmpleado, LocalDate fechaMedicion);
}