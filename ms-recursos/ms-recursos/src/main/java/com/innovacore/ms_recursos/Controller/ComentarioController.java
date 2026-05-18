package com.innovacore.ms_recursos.Controller;

import com.innovacore.ms_recursos.Model.Comentario;
import com.innovacore.ms_recursos.Service.ComentarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Comentarios", description = "Gestión de comentarios en proyectos y tareas")
@RestController
@RequestMapping("/comentarios")
public class ComentarioController {

    private final ComentarioService service;

    public ComentarioController(ComentarioService service) {
        this.service = service;
    }

    @Operation(summary = "Listar comentarios")
    @GetMapping
    public ResponseEntity<List<Comentario>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Obtener comentario por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Comentario> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Listar comentarios por proyecto")
    @GetMapping("/proyecto/{idProyecto}")
    public ResponseEntity<List<Comentario>> getByProyecto(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(service.getByProyecto(idProyecto));
    }

    @Operation(summary = "Listar comentarios por tarea")
    @GetMapping("/tarea/{idTarea}")
    public ResponseEntity<List<Comentario>> getByTarea(@PathVariable Long idTarea) {
        return ResponseEntity.ok(service.getByTarea(idTarea));
    }

    @Operation(summary = "Listar comentarios por usuario")
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Comentario>> getByUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(service.getByUsuario(idUsuario));
    }

    @Operation(summary = "Crear comentario")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Comentario creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<Comentario> create(@RequestBody Comentario comentario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(comentario));
    }

    @Operation(summary = "Actualizar comentario")
    @PutMapping("/{id}")
    public ResponseEntity<Comentario> update(@PathVariable Long id, @RequestBody Comentario comentario) {
        return ResponseEntity.ok(service.update(id, comentario));
    }

    @Operation(summary = "Eliminar comentario")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}