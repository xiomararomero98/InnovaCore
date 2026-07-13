package com.innovacore.ms_proyectos.Controller;
import com.innovacore.ms_proyectos.Model.ComentarioTarea;
import com.innovacore.ms_proyectos.Service.ComentarioTareaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Tag(name = "Comentarios de Tareas", description = "Sistema de mensajería dentro de tareas")
@RestController
@RequestMapping("/tareas/{idTarea}/comentarios")
@RequiredArgsConstructor
public class ComentarioTareaController {

    private final ComentarioTareaService service;

    @Operation(summary = "Listar comentarios de una tarea")
    @GetMapping
    public ResponseEntity<List<ComentarioTarea>> getByTarea(@PathVariable Long idTarea) {
        return ResponseEntity.ok(service.getByTarea(idTarea));
    }

    @Operation(summary = "Agregar comentario a una tarea")
    @PostMapping
    public ResponseEntity<ComentarioTarea> crear(
            @PathVariable Long idTarea,
            @RequestBody Map<String, Object> body) {

        Long idUsuario = Long.valueOf(body.get("idUsuario").toString());
        String nombreUsuario = body.get("nombreUsuario").toString();
        String contenido = body.get("contenido").toString();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.crear(idTarea, idUsuario, nombreUsuario, contenido));
    }

    @Operation(summary = "Eliminar comentario")
    @DeleteMapping("/{idComentario}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long idTarea,
            @PathVariable Long idComentario,
            @RequestParam Long idUsuario) {

        service.eliminar(idComentario, idUsuario);
        return ResponseEntity.noContent().build();
    }
}