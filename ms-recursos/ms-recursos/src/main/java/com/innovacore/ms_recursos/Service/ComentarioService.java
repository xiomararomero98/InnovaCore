package com.innovacore.ms_recursos.Service;

import com.innovacore.ms_recursos.Model.Comentario;
import com.innovacore.ms_recursos.Repository.ComentarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ComentarioService {

    private final ComentarioRepository repository;

    public ComentarioService(ComentarioRepository repository) {
        this.repository = repository;
    }

    // ==========================================================
    // LISTAR TODOS
    // ==========================================================
    public List<Comentario> getAll() {
        return repository.findAll();
    }

    // ==========================================================
    // BUSCAR POR ID
    // ==========================================================
    public Comentario getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado con id: " + id));
    }

    // ==========================================================
    // LISTAR POR PROYECTO
    // ==========================================================
    public List<Comentario> getByProyecto(Long idProyecto) {
        return repository.findByIdProyecto(idProyecto);
    }

    // ==========================================================
    // LISTAR POR TAREA
    // ==========================================================
    public List<Comentario> getByTarea(Long idTarea) {
        return repository.findByIdTarea(idTarea);
    }

    // ==========================================================
    // LISTAR POR USUARIO
    // ==========================================================
    public List<Comentario> getByUsuario(Long idUsuario) {
        return repository.findByIdUsuario(idUsuario);
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================
    private void validar(Comentario comentario) {
        if (comentario.getContenido() == null || comentario.getContenido().isBlank())
            throw new RuntimeException("El contenido del comentario es obligatorio");
        if (comentario.getIdUsuario() == null)
            throw new RuntimeException("El usuario es obligatorio");
        if (comentario.getIdProyecto() == null && comentario.getIdTarea() == null)
            throw new RuntimeException("El comentario debe estar asociado a un proyecto o tarea");
    }

    // ==========================================================
    // CREAR COMENTARIO
    // ==========================================================
    public Comentario create(Comentario comentario) {
        validar(comentario);

        if (comentario.getFechaComentario() == null)
            comentario.setFechaComentario(LocalDateTime.now());

        return repository.save(comentario);
    }

    // ==========================================================
    // ACTUALIZAR COMENTARIO
    // ==========================================================
    public Comentario update(Long id, Comentario comentario) {
        Comentario db = getById(id);
        if (comentario.getContenido() == null || comentario.getContenido().isBlank())
            throw new RuntimeException("El contenido del comentario es obligatorio");

        db.setContenido(comentario.getContenido());
        return repository.save(db);
    }

    // ==========================================================
    // ELIMINAR COMENTARIO
    // ==========================================================
    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new RuntimeException("No existe un comentario con id: " + id);
        repository.deleteById(id);
    }
}