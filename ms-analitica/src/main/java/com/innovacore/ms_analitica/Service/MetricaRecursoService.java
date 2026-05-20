package com.innovacore.ms_analitica.Service;

import com.innovacore.ms_analitica.Model.MetricaRecurso;
import com.innovacore.ms_analitica.Repository.MetricaRecursoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class MetricaRecursoService {

    private final MetricaRecursoRepository repository;

    public MetricaRecursoService(MetricaRecursoRepository repository) {
        this.repository = repository;
    }

    // ==========================================================
    // LISTAR TODAS
    // ==========================================================
    public List<MetricaRecurso> getAll() {
        return repository.findAll();
    }

    // ==========================================================
    // BUSCAR POR ID
    // ==========================================================
    public MetricaRecurso getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Métrica no encontrada con id: " + id));
    }

    // ==========================================================
    // LISTAR POR EMPLEADO
    // ==========================================================
    public List<MetricaRecurso> getByEmpleado(Long idEmpleado) {
        return repository.findByIdEmpleado(idEmpleado);
    }

    // ==========================================================
    // LISTAR POR FECHA
    // ==========================================================
    public List<MetricaRecurso> getByFecha(LocalDate fecha) {
        return repository.findByFechaMedicion(fecha);
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================
    private void validar(MetricaRecurso metrica) {
        if (metrica.getIdEmpleado() == null)
            throw new RuntimeException("El empleado es obligatorio");
        if (metrica.getHorasAsignadas() == null || metrica.getHorasAsignadas() < 0)
            throw new RuntimeException("Las horas asignadas deben ser válidas");
        if (metrica.getHorasDisponibles() == null || metrica.getHorasDisponibles() <= 0)
            throw new RuntimeException("Las horas disponibles deben ser mayores a 0");
    }

    // ==========================================================
    // CREAR MÉTRICA
    // ==========================================================
    public MetricaRecurso create(MetricaRecurso metrica) {
        validar(metrica);

        if (metrica.getFechaMedicion() == null)
            metrica.setFechaMedicion(LocalDate.now());

        // Calcular porcentaje de utilización automáticamente
        double porcentaje = (metrica.getHorasAsignadas() * 100.0) / metrica.getHorasDisponibles();
        metrica.setPorcentajeUtilizacion(Math.round(porcentaje * 100.0) / 100.0); // redondeo a 2 decimales

        return repository.save(metrica);
    }

    // ==========================================================
    // ACTUALIZAR MÉTRICA
    // ==========================================================
    public MetricaRecurso update(Long id, MetricaRecurso metrica) {
        MetricaRecurso db = getById(id);
        validar(metrica);

        db.setIdEmpleado(metrica.getIdEmpleado());
        db.setFechaMedicion(metrica.getFechaMedicion());
        db.setHorasAsignadas(metrica.getHorasAsignadas());
        db.setHorasDisponibles(metrica.getHorasDisponibles());

        double porcentaje = (metrica.getHorasAsignadas() * 100.0) / metrica.getHorasDisponibles();
        db.setPorcentajeUtilizacion(Math.round(porcentaje * 100.0) / 100.0);

        return repository.save(db);
    }

    // ==========================================================
    // ELIMINAR MÉTRICA
    // ==========================================================
    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new RuntimeException("No existe una métrica con id: " + id);
        repository.deleteById(id);
    }

    // ==========================================================
    // PROMEDIO DE UTILIZACIÓN GENERAL
    // ==========================================================
    public Double getPromedioUtilizacion() {
        List<MetricaRecurso> metricas = repository.findAll();
        if (metricas.isEmpty()) return 0.0;

        double suma = metricas.stream()
                .mapToDouble(MetricaRecurso::getPorcentajeUtilizacion)
                .sum();
        return Math.round((suma / metricas.size()) * 100.0) / 100.0;
    }
}