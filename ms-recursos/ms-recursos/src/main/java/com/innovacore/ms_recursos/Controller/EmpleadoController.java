package com.innovacore.ms_recursos.Controller;

import com.innovacore.ms_recursos.Model.Empleado;
import com.innovacore.ms_recursos.Service.EmpleadoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Empleados", description = "Gestión de empleados y recursos humanos")
@RestController
@RequestMapping("/empleados")
public class EmpleadoController {

    private final EmpleadoService service;

    public EmpleadoController(EmpleadoService service) {
        this.service = service;
    }

    @Operation(summary = "Listar empleados")
    @GetMapping
    public ResponseEntity<List<Empleado>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Obtener empleado por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Empleado> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Listar empleados por especialidad")
    @GetMapping("/especialidad/{especialidad}")
    public ResponseEntity<List<Empleado>> getByEspecialidad(@PathVariable String especialidad) {
        return ResponseEntity.ok(service.getByEspecialidad(especialidad));
    }

    @Operation(summary = "Listar empleados por disponibilidad")
    @GetMapping("/disponibilidad/{disponibilidad}")
    public ResponseEntity<List<Empleado>> getByDisponibilidad(@PathVariable String disponibilidad) {
        return ResponseEntity.ok(service.getByDisponibilidad(disponibilidad));
    }

    @Operation(summary = "Crear empleado")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Empleado creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<Empleado> create(@RequestBody Empleado empleado) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(empleado));
    }

    @Operation(summary = "Actualizar empleado")
    @PutMapping("/{id}")
    public ResponseEntity<Empleado> update(@PathVariable Long id, @RequestBody Empleado empleado) {
        return ResponseEntity.ok(service.update(id, empleado));
    }

    @Operation(summary = "Cambiar disponibilidad del empleado")
    @PutMapping("/{id}/disponibilidad/{disponibilidad}")
    public ResponseEntity<Empleado> cambiarDisponibilidad(
            @PathVariable Long id,
            @PathVariable String disponibilidad) {
        return ResponseEntity.ok(service.cambiarDisponibilidad(id, disponibilidad));
    }

    @Operation(summary = "Desactivar empleado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}