package com.innovacore.ms_proyectos.Controller;

import com.innovacore.ms_proyectos.Model.Tarea;
import com.innovacore.ms_proyectos.Service.TareaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Tareas", description = "Gestión de tareas de proyectos")
@RestController
@RequestMapping("/tareas")
@RequiredArgsConstructor
public class TareaController {

    private final TareaService service;

    @Operation(summary = "Listar tareas")
    @GetMapping
    public ResponseEntity<List<Tarea>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Obtener tarea por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Tarea> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Listar tareas por proyecto")
    @GetMapping("/proyecto/{idProyecto}")
    public ResponseEntity<List<Tarea>> getByProyecto(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(service.getByProyecto(idProyecto));
    }

    @Operation(summary = "Listar tareas por responsable")
    @GetMapping("/responsable/{idResponsable}")
    public ResponseEntity<List<Tarea>> getByResponsable(@PathVariable Long idResponsable) {
        return ResponseEntity.ok(service.getByResponsable(idResponsable));
    }

    @Operation(summary = "Crear tarea")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tarea creada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<Tarea> create(@RequestBody Tarea tarea) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(tarea));
    }

    @Operation(summary = "Actualizar tarea")
    @PutMapping("/{id}")
    public ResponseEntity<Tarea> update(@PathVariable Long id, @RequestBody Tarea tarea) {
        return ResponseEntity.ok(service.update(id, tarea));
    }

    @Operation(
        summary = "Cambiar estado de la tarea",
        description = "Cambia el estado (PENDIENTE/EN_PROGRESO/COMPLETADA/CANCELADA). " +
                      "El avance se recalcula automáticamente y el proyecto también."
    )
    @PutMapping("/{id}/estado/{nuevoEstado}")
    public ResponseEntity<Tarea> cambiarEstado(
            @PathVariable Long id,
            @PathVariable String nuevoEstado) {
        return ResponseEntity.ok(service.cambiarEstado(id, nuevoEstado));
    }

    @Operation(summary = "Eliminar tarea")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}