package com.innovacore.ms_proyectos.Service;

import com.innovacore.ms_proyectos.Model.Proyecto;
import com.innovacore.ms_proyectos.Model.Tarea;
import com.innovacore.ms_proyectos.Repository.ProyectoRepository;
import com.innovacore.ms_proyectos.Repository.TareaRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TareaService {

    private final TareaRepository repository;
    private final ProyectoRepository proyectoRepository;

    public TareaService(TareaRepository repository, ProyectoRepository proyectoRepository) {
        this.repository = repository;
        this.proyectoRepository = proyectoRepository;
    }

    // ==========================================================
    // LISTAR TODAS
    // ==========================================================
    public List<Tarea> getAll() {
        return repository.findAll();
    }

    // ==========================================================
    // BUSCAR POR ID
    // ==========================================================
    public Tarea getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));
    }

    // ==========================================================
    // LISTAR POR PROYECTO
    // ==========================================================
    public List<Tarea> getByProyecto(Long idProyecto) {
        return repository.findByProyectoId(idProyecto);
    }

    // ==========================================================
    // LISTAR POR RESPONSABLE
    // ==========================================================
    public List<Tarea> getByResponsable(Long idResponsable) {
        return repository.findByIdResponsable(idResponsable);
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================
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
    // CREAR TAREA
    // ==========================================================
    public Tarea create(Tarea tarea) {
        validar(tarea);

        if (tarea.getProyecto() != null && tarea.getProyecto().getId() != null) {
            Proyecto proyecto = proyectoRepository.findById(tarea.getProyecto().getId())
                    .orElseThrow(() -> new RuntimeException("Proyecto no encontrado"));
            tarea.setProyecto(proyecto);
        }

        if (tarea.getEstadoTarea() == null) tarea.setEstadoTarea("PENDIENTE");
        if (tarea.getPrioridad() == null) tarea.setPrioridad("MEDIA");
        if (tarea.getPorcentajeAvance() == null) tarea.setPorcentajeAvance(0);
        if (tarea.getFechaCreacion() == null) tarea.setFechaCreacion(LocalDateTime.now());

        return repository.save(tarea);
    }

    // ==========================================================
    // ACTUALIZAR TAREA
    // ==========================================================
    public Tarea update(Long id, Tarea tarea) {
        Tarea dbTarea = getById(id);
        validar(tarea);

        dbTarea.setNombreTarea(tarea.getNombreTarea());
        dbTarea.setDescripcion(tarea.getDescripcion());
        dbTarea.setFechaInicio(tarea.getFechaInicio());
        dbTarea.setFechaLimite(tarea.getFechaLimite());
        dbTarea.setEstadoTarea(tarea.getEstadoTarea());
        dbTarea.setPrioridad(tarea.getPrioridad());
        dbTarea.setPorcentajeAvance(tarea.getPorcentajeAvance());
        dbTarea.setIdResponsable(tarea.getIdResponsable());

        return repository.save(dbTarea);
    }

    // ==========================================================
    // ELIMINAR TAREA
    // ==========================================================
    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new RuntimeException("No existe una tarea con id: " + id);
        repository.deleteById(id);
    }

    // ==========================================================
    // ACTUALIZAR AVANCE
    // ==========================================================
    public Tarea actualizarAvance(Long id, Integer porcentaje) {
        if (porcentaje < 0 || porcentaje > 100)
            throw new RuntimeException("El porcentaje debe estar entre 0 y 100");
        Tarea tarea = getById(id);
        tarea.setPorcentajeAvance(porcentaje);
        return repository.save(tarea);
    }
}