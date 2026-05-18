package com.innovacore.ms_recursos.Controller;

import com.innovacore.ms_recursos.Model.Asignacion;
import com.innovacore.ms_recursos.Service.AsignacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Asignaciones", description = "Gestión de asignaciones de empleados a proyectos")
@RestController
@RequestMapping("/asignaciones")
public class AsignacionController {

    private final AsignacionService service;

    public AsignacionController(AsignacionService service) {
        this.service = service;
    }

    @Operation(summary = "Listar asignaciones")
    @GetMapping
    public ResponseEntity<List<Asignacion>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Obtener asignación por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Asignacion> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Listar asignaciones por empleado")
    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<List<Asignacion>> getByEmpleado(@PathVariable Long idEmpleado) {
        return ResponseEntity.ok(service.getByEmpleado(idEmpleado));
    }

    @Operation(summary = "Listar asignaciones por proyecto")
    @GetMapping("/proyecto/{idProyecto}")
    public ResponseEntity<List<Asignacion>> getByProyecto(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(service.getByProyecto(idProyecto));
    }

    @Operation(summary = "Crear asignación")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Asignación creada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<Asignacion> create(@RequestBody Asignacion asignacion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(asignacion));
    }

    @Operation(summary = "Actualizar asignación")
    @PutMapping("/{id}")
    public ResponseEntity<Asignacion> update(@PathVariable Long id, @RequestBody Asignacion asignacion) {
        return ResponseEntity.ok(service.update(id, asignacion));
    }

    @Operation(summary = "Finalizar asignación")
    @PutMapping("/{id}/finalizar")
    public ResponseEntity<Asignacion> finalizar(@PathVariable Long id) {
        return ResponseEntity.ok(service.finalizar(id));
    }

    @Operation(summary = "Eliminar asignación")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}