package com.innovacore.ms_recursos.Service;

import com.innovacore.ms_recursos.Model.Empleado;
import com.innovacore.ms_recursos.Repository.EmpleadoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class EmpleadoService {

    private final EmpleadoRepository repository;

    public EmpleadoService(EmpleadoRepository repository) {
        this.repository = repository;
    }

    public List<Empleado> getAll() {
        return repository.findAll();
    }

    public Empleado getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + id));
    }

    public List<Empleado> getByEspecialidad(String especialidad) {
        return repository.findByEspecialidad(especialidad);
    }

    public List<Empleado> getByDisponibilidad(String disponibilidad) {
        return repository.findByDisponibilidad(disponibilidad);
    }

    private void validar(Empleado empleado) {
        if (empleado.getNombre() == null || empleado.getNombre().isBlank())
            throw new RuntimeException("El nombre es obligatorio");
        if (empleado.getApellido() == null || empleado.getApellido().isBlank())
            throw new RuntimeException("El apellido es obligatorio");
        if (empleado.getCorreo() == null || empleado.getCorreo().isBlank())
            throw new RuntimeException("El correo es obligatorio");
        if (empleado.getCargo() == null || empleado.getCargo().isBlank())
            throw new RuntimeException("El cargo es obligatorio");
        if (empleado.getEspecialidad() == null || empleado.getEspecialidad().isBlank())
            throw new RuntimeException("La especialidad es obligatoria");
    }

    public Empleado create(Empleado empleado) {
        validar(empleado);

        if (repository.findByCorreo(empleado.getCorreo()).isPresent())
            throw new RuntimeException("Ya existe un empleado con ese correo");

        if (empleado.getDisponibilidad() == null) empleado.setDisponibilidad("DISPONIBLE");
        if (empleado.getEstado() == null) empleado.setEstado(1);
        if (empleado.getFechaRegistro() == null) empleado.setFechaRegistro(LocalDateTime.now());

        return repository.save(empleado);
    }

    public Empleado update(Long id, Empleado empleado) {
        Empleado dbEmpleado = getById(id);
        validar(empleado);

        dbEmpleado.setNombre(empleado.getNombre());
        dbEmpleado.setApellido(empleado.getApellido());
        dbEmpleado.setCorreo(empleado.getCorreo());
        dbEmpleado.setCargo(empleado.getCargo());
        dbEmpleado.setEspecialidad(empleado.getEspecialidad());
        dbEmpleado.setDisponibilidad(empleado.getDisponibilidad());
        // FIX: preservar estado existente si el request no lo envía
        if (empleado.getEstado() != null) {
            dbEmpleado.setEstado(empleado.getEstado());
        }

        return repository.save(dbEmpleado);
    }

    public void delete(Long id) {
        Empleado empleado = getById(id);
        empleado.setEstado(0);
        repository.save(empleado);
    }

    public Empleado cambiarDisponibilidad(Long id, String disponibilidad) {
        Empleado empleado = getById(id);
        empleado.setDisponibilidad(disponibilidad);
        return repository.save(empleado);
    }
}