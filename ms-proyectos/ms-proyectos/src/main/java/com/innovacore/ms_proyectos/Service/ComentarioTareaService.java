package com.innovacore.ms_proyectos.Service;

import com.innovacore.ms_proyectos.Model.ComentarioTarea;
import com.innovacore.ms_proyectos.Model.Tarea;
import com.innovacore.ms_proyectos.Repository.ComentarioTareaRepository;
import com.innovacore.ms_proyectos.Repository.TareaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComentarioTareaService {

    private final ComentarioTareaRepository repository;
    private final TareaRepository tareaRepository;

    public List<ComentarioTarea> getByTarea(Long idTarea) {
        return repository.findByTareaIdOrderByFechaCreacionAsc(idTarea);
    }

    public ComentarioTarea crear(Long idTarea, Long idUsuario, String nombreUsuario, String contenido) {
        if (contenido == null || contenido.isBlank())
            throw new RuntimeException("El comentario no puede estar vacío");
        if (contenido.length() > 2000)
            throw new RuntimeException("El comentario no puede superar los 2000 caracteres");

        Tarea tarea = tareaRepository.findById(idTarea)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + idTarea));

        ComentarioTarea comentario = new ComentarioTarea();
        comentario.setContenido(contenido.trim());
        comentario.setIdUsuario(idUsuario);
        comentario.setNombreUsuario(nombreUsuario);
        comentario.setFechaCreacion(LocalDateTime.now());
        comentario.setTarea(tarea);

        return repository.save(comentario);
    }

    public void eliminar(Long idComentario, Long idUsuario) {
        ComentarioTarea comentario = repository.findById(idComentario)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        // Solo el autor puede eliminar su comentario
        if (!comentario.getIdUsuario().equals(idUsuario))
            throw new RuntimeException("No tienes permisos para eliminar este comentario");

        repository.deleteById(idComentario);
    }
}