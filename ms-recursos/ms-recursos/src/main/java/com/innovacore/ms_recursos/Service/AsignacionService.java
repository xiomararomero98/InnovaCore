package com.innovacore.ms_recursos.Service;

import com.innovacore.ms_recursos.DTO.AsignacionMultipleRequest;
import com.innovacore.ms_recursos.Event.AsignacionCreadaEvent;
import com.innovacore.ms_recursos.Event.AsignacionEventPublisher;
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
    private final AsignacionEventPublisher eventPublisher;

    private static final int LIMITE_HORAS_OCUPADO = 40;

    public AsignacionService(
            AsignacionRepository repository,
            EmpleadoRepository empleadoRepository,
            AsignacionEventPublisher eventPublisher) {
        this.repository = repository;
        this.empleadoRepository = empleadoRepository;
        this.eventPublisher = eventPublisher;
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
    // LISTAR POR TAREA
    // ==========================================================
    public List<Asignacion> getByTarea(Long idTarea) {
        return repository.findByIdTarea(idTarea);
    }

    // ==========================================================
    // LISTAR POR PROYECTO Y TAREA
    // ==========================================================
    public List<Asignacion> getByProyectoYTarea(Long idProyecto, Long idTarea) {
        return repository.findByIdProyectoAndIdTarea(idProyecto, idTarea);
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================
    private void validar(Asignacion asignacion) {
        if (asignacion.getEmpleado() == null || asignacion.getEmpleado().getId() == null) {
            throw new RuntimeException("El empleado es obligatorio");
        }

        validarDatosAsignacion(
                asignacion.getIdProyecto(),
                asignacion.getHorasAsignadas(),
                asignacion.getRolEnProyecto()
        );
    }

    private void validarDatosAsignacion(Long idProyecto, Integer horasAsignadas, String rolEnProyecto) {
        if (idProyecto == null) {
            throw new RuntimeException("El proyecto es obligatorio");
        }

        if (horasAsignadas == null || horasAsignadas <= 0) {
            throw new RuntimeException("Las horas asignadas deben ser mayores a 0");
        }

        if (rolEnProyecto == null || rolEnProyecto.isBlank()) {
            throw new RuntimeException("El rol en el proyecto es obligatorio");
        }
    }

    private void validarAsignacionMultiple(AsignacionMultipleRequest request) {
        if (request.getEmpleadosIds() == null || request.getEmpleadosIds().isEmpty()) {
            throw new RuntimeException("Debe seleccionar al menos un empleado");
        }

        if (request.getHorasAsignadas() == null || request.getHorasAsignadas() <= 0) {
            throw new RuntimeException("Las horas asignadas deben ser mayores a 0");
        }

        if (request.getRolEnProyecto() == null || request.getRolEnProyecto().isBlank()) {
            throw new RuntimeException("El rol en el proyecto es obligatorio");
        }
    }

    // ==========================================================
    // CREAR ASIGNACIÓN SIMPLE
    // ==========================================================
    public Asignacion create(Asignacion asignacion) {
        validar(asignacion);

        Empleado empleado = empleadoRepository.findById(asignacion.getEmpleado().getId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        asignacion.setEmpleado(empleado);

        if (asignacion.getFechaAsignacion() == null) {
            asignacion.setFechaAsignacion(LocalDateTime.now());
        }

        if (asignacion.getEstado() == null || asignacion.getEstado().isBlank()) {
            asignacion.setEstado("ACTIVA");
        }

        Asignacion asignacionGuardada = repository.save(asignacion);

        actualizarDisponibilidadEmpleadoPorHoras(empleado.getId());

        Empleado empleadoActualizado = empleadoRepository.findById(empleado.getId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + empleado.getId()));

        publicarEventoAsignacionCreada(asignacionGuardada, empleadoActualizado);

        return asignacionGuardada;
    }

    // ==========================================================
    // CREAR ASIGNACIONES MÚLTIPLES A PROYECTO
    // ==========================================================
    public List<Asignacion> asignarMultiplesEmpleadosAProyecto(
            Long idProyecto,
            AsignacionMultipleRequest request) {

        return crearAsignacionesMultiples(idProyecto, null, request);
    }

    // ==========================================================
    // CREAR ASIGNACIONES MÚLTIPLES A TAREA
    // ==========================================================
    public List<Asignacion> asignarMultiplesEmpleadosATarea(
            Long idProyecto,
            Long idTarea,
            AsignacionMultipleRequest request) {

        if (idTarea == null) {
            throw new RuntimeException("La tarea es obligatoria");
        }

        return crearAsignacionesMultiples(idProyecto, idTarea, request);
    }

    private List<Asignacion> crearAsignacionesMultiples(
            Long idProyecto,
            Long idTarea,
            AsignacionMultipleRequest request) {

        if (idProyecto == null) {
            throw new RuntimeException("El proyecto es obligatorio");
        }

        validarAsignacionMultiple(request);

        return request.getEmpleadosIds().stream()
                .distinct()
                .map(idEmpleado -> crearAsignacionDesdeEmpleado(idEmpleado, idProyecto, idTarea, request))
                .toList();
    }

    private Asignacion crearAsignacionDesdeEmpleado(
            Long idEmpleado,
            Long idProyecto,
            Long idTarea,
            AsignacionMultipleRequest request) {

        Empleado empleado = empleadoRepository.findById(idEmpleado)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + idEmpleado));

        boolean yaTieneAsignacionActiva = idTarea == null
                ? repository.existsByEmpleadoIdAndIdProyectoAndIdTareaIsNullAndEstado(
                        empleado.getId(),
                        idProyecto,
                        "ACTIVA"
                )
                : repository.existsByEmpleadoIdAndIdProyectoAndIdTareaAndEstado(
                        empleado.getId(),
                        idProyecto,
                        idTarea,
                        "ACTIVA"
                );

        if (yaTieneAsignacionActiva) {
            throw new RuntimeException("El empleado " + empleado.getId()
                    + " ya tiene una asignación activa para este proyecto/tarea");
        }

        Asignacion asignacion = new Asignacion();
        asignacion.setEmpleado(empleado);
        asignacion.setIdProyecto(idProyecto);
        asignacion.setIdTarea(idTarea);
        asignacion.setHorasAsignadas(request.getHorasAsignadas());
        asignacion.setRolEnProyecto(request.getRolEnProyecto());
        asignacion.setFechaAsignacion(LocalDateTime.now());
        asignacion.setEstado("ACTIVA");

        Asignacion asignacionGuardada = repository.save(asignacion);

        actualizarDisponibilidadEmpleadoPorHoras(empleado.getId());

        Empleado empleadoActualizado = empleadoRepository.findById(empleado.getId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + empleado.getId()));

        publicarEventoAsignacionCreada(asignacionGuardada, empleadoActualizado);

        return asignacionGuardada;
    }

    // ==========================================================
    // RECALCULAR DISPONIBILIDAD POR HORAS ACTIVAS
    // ==========================================================
    private void actualizarDisponibilidadEmpleadoPorHoras(Long idEmpleado) {
        Empleado empleado = empleadoRepository.findById(idEmpleado)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + idEmpleado));

        List<Asignacion> asignacionesActivas = repository.findByEmpleadoIdAndEstado(idEmpleado, "ACTIVA");

        int totalHorasActivas = asignacionesActivas.stream()
                .map(Asignacion::getHorasAsignadas)
                .filter(horas -> horas != null)
                .mapToInt(Integer::intValue)
                .sum();

        if (totalHorasActivas >= LIMITE_HORAS_OCUPADO) {
            empleado.setDisponibilidad("OCUPADO");
        } else {
            empleado.setDisponibilidad("DISPONIBLE");
        }

        empleadoRepository.save(empleado);
    }

    public Empleado recalcularDisponibilidadEmpleado(Long idEmpleado) {
        actualizarDisponibilidadEmpleadoPorHoras(idEmpleado);

        return empleadoRepository.findById(idEmpleado)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + idEmpleado));
    }

    // ==========================================================
    // PUBLICAR EVENTO
    // ==========================================================
    private void publicarEventoAsignacionCreada(Asignacion asignacionGuardada, Empleado empleado) {
        AsignacionCreadaEvent evento = AsignacionCreadaEvent.crear(
                asignacionGuardada.getId(),
                empleado.getId(),
                empleado.getNombre() + " " + empleado.getApellido(),
                asignacionGuardada.getIdProyecto(),
                asignacionGuardada.getHorasAsignadas(),
                asignacionGuardada.getRolEnProyecto()
        );

        eventPublisher.publicarAsignacionCreada(evento);
    }

    // ==========================================================
    // ACTUALIZAR ASIGNACIÓN
    // ==========================================================
    public Asignacion update(Long id, Asignacion asignacion) {
        Asignacion db = getById(id);

        validarDatosAsignacion(
                asignacion.getIdProyecto(),
                asignacion.getHorasAsignadas(),
                asignacion.getRolEnProyecto()
        );

        Long idEmpleado = db.getEmpleado().getId();

        db.setIdProyecto(asignacion.getIdProyecto());
        db.setIdTarea(asignacion.getIdTarea());
        db.setHorasAsignadas(asignacion.getHorasAsignadas());
        db.setRolEnProyecto(asignacion.getRolEnProyecto());

        if (asignacion.getEstado() != null && !asignacion.getEstado().isBlank()) {
            db.setEstado(asignacion.getEstado());
        }

        Asignacion asignacionActualizada = repository.save(db);

        actualizarDisponibilidadEmpleadoPorHoras(idEmpleado);

        return asignacionActualizada;
    }

    // ==========================================================
    // FINALIZAR ASIGNACIÓN
    // ==========================================================
    public Asignacion finalizar(Long id) {
        Asignacion asignacion = getById(id);
        Long idEmpleado = asignacion.getEmpleado().getId();

        asignacion.setEstado("FINALIZADA");

        Asignacion asignacionFinalizada = repository.save(asignacion);

        actualizarDisponibilidadEmpleadoPorHoras(idEmpleado);

        return asignacionFinalizada;
    }

    // ==========================================================
    // ELIMINAR ASIGNACIÓN
    // ==========================================================
    public void delete(Long id) {
        Asignacion asignacion = getById(id);
        Long idEmpleado = asignacion.getEmpleado().getId();

        repository.deleteById(id);

        actualizarDisponibilidadEmpleadoPorHoras(idEmpleado);
    }
}