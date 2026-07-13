package com.innovacore.ms_proyectos.Service;

import com.innovacore.ms_proyectos.Event.ProyectoCreadoEvent;
import com.innovacore.ms_proyectos.Event.ProyectoEventPublisher;
import com.innovacore.ms_proyectos.Model.Cliente;
import com.innovacore.ms_proyectos.Model.Proyecto;
import com.innovacore.ms_proyectos.Model.Tarea;
import com.innovacore.ms_proyectos.Repository.ClienteRepository;
import com.innovacore.ms_proyectos.Repository.ProyectoRepository;
import com.innovacore.ms_proyectos.Repository.TareaRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ProyectoService {

    private final ProyectoRepository repository;
    private final ClienteRepository clienteRepository;
    private final TareaRepository tareaRepository;
    private final ProyectoEventPublisher eventPublisher;

    public ProyectoService(
            ProyectoRepository repository,
            ClienteRepository clienteRepository,
            TareaRepository tareaRepository,
            ProyectoEventPublisher eventPublisher) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
        this.tareaRepository = tareaRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<Proyecto> getAll() {
        return repository.findAll();
    }

    public Proyecto getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con id: " + id));
    }

    public List<Proyecto> getByCliente(Long idCliente) {
        return repository.findByClienteId(idCliente);
    }

    public List<Proyecto> getByEstado(String estado) {
        return repository.findByEstadoProyecto(estado);
    }

    public List<Proyecto> getByGestor(Long idGestor) {
        return repository.findByIdGestor(idGestor);
    }

    private void validar(Proyecto proyecto) {
        if (proyecto.getNombreProyecto() == null || proyecto.getNombreProyecto().isBlank())
            throw new RuntimeException("El nombre del proyecto es obligatorio");
        if (proyecto.getFechaInicio() == null)
            throw new RuntimeException("La fecha de inicio es obligatoria");
        if (proyecto.getFechaFin() == null)
            throw new RuntimeException("La fecha de fin es obligatoria");
        if (proyecto.getFechaFin().isBefore(proyecto.getFechaInicio()))
            throw new RuntimeException("La fecha de fin no puede ser anterior a la fecha de inicio");
        if (proyecto.getIdGestor() == null)
            throw new RuntimeException("El gestor es obligatorio");
    }

    public Proyecto create(Proyecto proyecto) {
        validar(proyecto);

        if (proyecto.getCliente() != null && proyecto.getCliente().getId() != null) {
            Cliente cliente = clienteRepository.findById(proyecto.getCliente().getId())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
            proyecto.setCliente(cliente);
        }

        // El proyecto siempre empieza en PLANIFICADO con 0% (sin tareas)
        proyecto.setEstadoProyecto("PLANIFICADO");
        if (proyecto.getPrioridad() == null) proyecto.setPrioridad("MEDIA");
        proyecto.setPorcentajeAvance(0);
        if (proyecto.getFechaCreacion() == null) proyecto.setFechaCreacion(LocalDateTime.now());

        Proyecto proyectoGuardado = repository.save(proyecto);

        ProyectoCreadoEvent evento = ProyectoCreadoEvent.crear(
                proyectoGuardado.getId(),
                proyectoGuardado.getNombreProyecto(),
                proyectoGuardado.getEstadoProyecto(),
                proyectoGuardado.getPrioridad(),
                proyectoGuardado.getIdGestor(),
                proyectoGuardado.getCliente() != null ? proyectoGuardado.getCliente().getId() : null
        );
        eventPublisher.publicarProyectoCreado(evento);

        return proyectoGuardado;
    }

    public Proyecto update(Long id, Proyecto proyecto) {
        Proyecto dbProyecto = getById(id);
        validar(proyecto);

        dbProyecto.setNombreProyecto(proyecto.getNombreProyecto());
        dbProyecto.setDescripcion(proyecto.getDescripcion());
        dbProyecto.setFechaInicio(proyecto.getFechaInicio());
        dbProyecto.setFechaFin(proyecto.getFechaFin());
        dbProyecto.setPrioridad(proyecto.getPrioridad());
        dbProyecto.setIdGestor(proyecto.getIdGestor());

        if (proyecto.getCliente() != null && proyecto.getCliente().getId() != null) {
            Cliente cliente = clienteRepository.findById(proyecto.getCliente().getId())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
            dbProyecto.setCliente(cliente);
        }

        Proyecto guardado = repository.save(dbProyecto);
        // Recalcular avance y estado después de actualizar
        return recalcularAvanceYEstado(guardado.getId());
    }

    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new RuntimeException("No existe un proyecto con id: " + id);
        repository.deleteById(id);
    }

    // ==========================================================
    // REGLA DE NEGOCIO: recalcula avance y estado del proyecto
    // automáticamente según sus tareas y fechas
    // ==========================================================
    public Proyecto recalcularAvanceYEstado(Long idProyecto) {
        Proyecto proyecto = getById(idProyecto);
        List<Tarea> tareas = tareaRepository.findByProyectoId(idProyecto);

        // 1. Calcular % de avance promedio
        int avance = 0;
        if (!tareas.isEmpty()) {
            int suma = tareas.stream()
                    .mapToInt(t -> t.getPorcentajeAvance() != null ? t.getPorcentajeAvance() : 0)
                    .sum();
            avance = suma / tareas.size();
        }
        proyecto.setPorcentajeAvance(avance);

        // 2. Calcular estado automáticamente
        String nuevoEstado = calcularEstado(proyecto, tareas);
        // Guardar estado anterior y fecha de cambio si el estado cambió
        if (!nuevoEstado.equals(proyecto.getEstadoProyecto())) {
            proyecto.setEstadoAnterior(proyecto.getEstadoProyecto());
            proyecto.setFechaCambioEstado(java.time.LocalDateTime.now());
        }
        proyecto.setEstadoProyecto(nuevoEstado);

        return repository.save(proyecto);
    }

    /**
     * Determina el estado del proyecto según sus tareas y fechas:
     *  - FINALIZADO: todas las tareas COMPLETADAS
     *  - ATRASADO: fecha fin pasada y no está finalizado
     *  - EN_CURSO: al menos una tarea en progreso o completada
     *  - PLANIFICADO: no tiene tareas o todas pendientes
     */
    private String calcularEstado(Proyecto proyecto, List<Tarea> tareas) {
        LocalDate hoy = LocalDate.now();

        // Sin tareas → PLANIFICADO (o ATRASADO si ya pasó la fecha fin)
        if (tareas.isEmpty()) {
            if (proyecto.getFechaFin() != null && proyecto.getFechaFin().isBefore(hoy)) {
                return "ATRASADO";
            }
            return "PLANIFICADO";
        }

        long completadas = tareas.stream()
                .filter(t -> "COMPLETADA".equalsIgnoreCase(t.getEstadoTarea()))
                .count();

        // Todas COMPLETADAS → FINALIZADO
        if (completadas == tareas.size()) {
            return "FINALIZADO";
        }

        // Fecha fin pasada y no terminado → ATRASADO
        if (proyecto.getFechaFin() != null && proyecto.getFechaFin().isBefore(hoy)) {
            return "ATRASADO";
        }

        // Hay tareas en progreso o completadas (pero no todas) → EN_CURSO
        long activas = tareas.stream()
                .filter(t -> {
                    String e = t.getEstadoTarea();
                    return "EN_PROGRESO".equalsIgnoreCase(e) || "COMPLETADA".equalsIgnoreCase(e);
                })
                .count();

        if (activas > 0) {
            return "EN_CURSO";
        }

        // Todas pendientes o canceladas
        return "PLANIFICADO";
    }

    public Proyecto actualizarAvance(Long id, Integer porcentaje) {
        // Ahora el avance se calcula automáticamente, pero mantenemos el endpoint
        // por compatibilidad. Llama al recálculo.
        return recalcularAvanceYEstado(id);
    }
}