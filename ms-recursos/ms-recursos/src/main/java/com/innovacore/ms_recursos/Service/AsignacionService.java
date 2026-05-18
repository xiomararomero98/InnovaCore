package com.innovacore.ms_recursos.Service;

import com.innovacore.ms_recursos.Model.Asignacion;
import com.innovacore.ms_recursos.Model.Empleado;
import com.innovacore.ms_recursos.Repository.AsignacionRepository;
import com.innovacore.ms_recursos.Repository.EmpleadoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AsignacionService {

    private final AsignacionRepository repository;
    private final EmpleadoRepository empleadoRepository;

    public AsignacionService(AsignacionRepository repository, EmpleadoRepository empleadoRepository) {
        this.repository = repository;
        this.empleadoRepository = empleadoRepository;
    }

    // ==========================================================
    // LISTAR TODAS
    // ==========================================================
    public List<Asignacion> getAll() {
        return repository.findAll();
    }

    // ==========================================================
    // BUSCAR POR ID
    // ==========================================================
    public Asignacion getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asignación no encontrada con id: " + id));
    }

    // ==========================================================
    // LISTAR POR EMPLEADO
    // ==========================================================
    public List<Asignacion> getByEmpleado(Long idEmpleado) {
        return repository.findByEmpleadoId(idEmpleado);
    }

    // ==========================================================
    // LISTAR POR PROYECTO
    // ==========================================================
    public List<Asignacion> getByProyecto(Long idProyecto) {
        return repository.findByIdProyecto(idProyecto);
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================
    private void validar(Asignacion asignacion) {
        if (asignacion.getEmpleado() == null || asignacion.getEmpleado().getId() == null)
            throw new RuntimeException("El empleado es obligatorio");
        if (asignacion.getIdProyecto() == null)
            throw new RuntimeException("El proyecto es obligatorio");
        if (asignacion.getHorasAsignadas() == null || asignacion.getHorasAsignadas() <= 0)
            throw new RuntimeException("Las horas asignadas deben ser mayores a 0");
        if (asignacion.getRolEnProyecto() == null || asignacion.getRolEnProyecto().isBlank())
            throw new RuntimeException("El rol en el proyecto es obligatorio");
    }

    // ==========================================================
    // CREAR ASIGNACIÓN
    // ==========================================================
    public Asignacion create(Asignacion asignacion) {
        validar(asignacion);

        Empleado empleado = empleadoRepository.findById(asignacion.getEmpleado().getId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        asignacion.setEmpleado(empleado);

        if (asignacion.getFechaAsignacion() == null)
            asignacion.setFechaAsignacion(LocalDateTime.now());
        if (asignacion.getEstado() == null)
            asignacion.setEstado("ACTIVA");

        // cambiar disponibilidad del empleado a OCUPADO
        empleado.setDisponibilidad("OCUPADO");
        empleadoRepository.save(empleado);

        return repository.save(asignacion);
    }

    // ==========================================================
    // ACTUALIZAR ASIGNACIÓN
    // ==========================================================
    public Asignacion update(Long id, Asignacion asignacion) {
        Asignacion db = getById(id);
        validar(asignacion);

        db.setIdProyecto(asignacion.getIdProyecto());
        db.setHorasAsignadas(asignacion.getHorasAsignadas());
        db.setRolEnProyecto(asignacion.getRolEnProyecto());
        db.setEstado(asignacion.getEstado());

        return repository.save(db);
    }

    // ==========================================================
    // FINALIZAR ASIGNACIÓN
    // ==========================================================
    public Asignacion finalizar(Long id) {
        Asignacion asignacion = getById(id);
        asignacion.setEstado("FINALIZADA");

        // liberar al empleado
        Empleado empleado = asignacion.getEmpleado();
        empleado.setDisponibilidad("DISPONIBLE");
        empleadoRepository.save(empleado);

        return repository.save(asignacion);
    }

    // ==========================================================
    // ELIMINAR ASIGNACIÓN
    // ==========================================================
    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new RuntimeException("No existe una asignación con id: " + id);
        repository.deleteById(id);
    }
}