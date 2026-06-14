package com.innovacore.ms_proyectos.Service;

import com.innovacore.ms_proyectos.Model.Proyecto;
import com.innovacore.ms_proyectos.Model.Tarea;
import com.innovacore.ms_proyectos.Repository.ProyectoRepository;
import com.innovacore.ms_proyectos.Repository.TareaRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TareaService {

    private final TareaRepository repository;
    private final ProyectoRepository proyectoRepository;

    @Autowired
    private ProyectoService proyectoService;

    public TareaService(TareaRepository repository, ProyectoRepository proyectoRepository) {
        this.repository = repository;
        this.proyectoRepository = proyectoRepository;
    }

    public List<Tarea> getAll() {
        return repository.findAll();
    }

    public Tarea getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));
    }

    public List<Tarea> getByProyecto(Long idProyecto) {
        return repository.findByProyectoId(idProyecto);
    }

    public List<Tarea> getByResponsable(Long idResponsable) {
        return repository.findByIdResponsable(idResponsable);
    }

    private void validar(Tarea tarea) {
        if (tarea.getNombreTarea() == null || tarea.getNombreTarea().isBlank())
            throw new RuntimeException("El nombre de la tarea es obligatorio");
        if (tarea.getFechaInicio() == null)
            throw new RuntimeException("La fecha de inicio es obligatoria");
        if (tarea.getFechaLimite() == null)
            throw new RuntimeException("La fecha límite es obligatoria");
        if (tarea.getFechaLimite().isBefore(tarea.getFechaInicio()))
            throw new RuntimeException("La fecha límite no puede ser anterior a la fecha de inicio");
        if (tarea.getIdResponsable() == null)
            throw new RuntimeException("El responsable es obligatorio");
    }

    // ==========================================================
    // REGLA DE NEGOCIO: el avance de la tarea depende de su estado
    // PENDIENTE = 0%, EN_PROGRESO = 50%, COMPLETADA = 100%, CANCELADA = 0%
    // ==========================================================
    private int calcularAvancePorEstado(String estado) {
        if (estado == null) return 0;
        return switch (estado.toUpperCase()) {
            case "COMPLETADA" -> 100;
            case "EN_PROGRESO" -> 50;
            default -> 0; // PENDIENTE, CANCELADA
        };
    }

    public Tarea create(Tarea tarea) {
        validar(tarea);

        Long idProyecto = null;
        if (tarea.getProyecto() != null && tarea.getProyecto().getId() != null) {
            Proyecto proyecto = proyectoRepository.findById(tarea.getProyecto().getId())
                    .orElseThrow(() -> new RuntimeException("Proyecto no encontrado"));
            tarea.setProyecto(proyecto);
            idProyecto = proyecto.getId();
        }

        if (tarea.getEstadoTarea() == null) tarea.setEstadoTarea("PENDIENTE");
        if (tarea.getPrioridad() == null) tarea.setPrioridad("MEDIA");
        // El avance se calcula automáticamente según el estado
        tarea.setPorcentajeAvance(calcularAvancePorEstado(tarea.getEstadoTarea()));
        if (tarea.getFechaCreacion() == null) tarea.setFechaCreacion(LocalDateTime.now());

        Tarea tareaGuardada = repository.save(tarea);

        // Recalcular avance y estado del proyecto
        if (idProyecto != null) {
            proyectoService.recalcularAvanceYEstado(idProyecto);
        }

        return tareaGuardada;
    }

    public Tarea update(Long id, Tarea tarea) {
        Tarea dbTarea = getById(id);
        validar(tarea);

        dbTarea.setNombreTarea(tarea.getNombreTarea());
        dbTarea.setDescripcion(tarea.getDescripcion());
        dbTarea.setFechaInicio(tarea.getFechaInicio());
        dbTarea.setFechaLimite(tarea.getFechaLimite());
        dbTarea.setEstadoTarea(tarea.getEstadoTarea());
        dbTarea.setPrioridad(tarea.getPrioridad());
        // El avance se recalcula automáticamente según el estado
        dbTarea.setPorcentajeAvance(calcularAvancePorEstado(tarea.getEstadoTarea()));
        dbTarea.setIdResponsable(tarea.getIdResponsable());

        Tarea tareaActualizada = repository.save(dbTarea);

        // Recalcular avance y estado del proyecto
        if (dbTarea.getProyecto() != null) {
            proyectoService.recalcularAvanceYEstado(dbTarea.getProyecto().getId());
        }

        return tareaActualizada;
    }

    public void delete(Long id) {
        Tarea tarea = getById(id);
        Long idProyecto = tarea.getProyecto() != null ? tarea.getProyecto().getId() : null;

        repository.deleteById(id);

        if (idProyecto != null) {
            proyectoService.recalcularAvanceYEstado(idProyecto);
        }
    }

    // ==========================================================
    // CAMBIAR ESTADO (recalcula avance automáticamente)
    // ==========================================================
    public Tarea cambiarEstado(Long id, String nuevoEstado) {
        Tarea tarea = getById(id);
        tarea.setEstadoTarea(nuevoEstado);
        tarea.setPorcentajeAvance(calcularAvancePorEstado(nuevoEstado));
        Tarea actualizada = repository.save(tarea);

        if (tarea.getProyecto() != null) {
            proyectoService.recalcularAvanceYEstado(tarea.getProyecto().getId());
        }

        return actualizada;
    }
}