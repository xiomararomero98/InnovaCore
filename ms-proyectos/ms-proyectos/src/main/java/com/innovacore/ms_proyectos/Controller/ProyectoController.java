package com.innovacore.ms_proyectos.Controller;

import com.innovacore.ms_proyectos.Model.Proyecto;
import com.innovacore.ms_proyectos.Service.ProyectoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Proyectos", description = "Microservicio de Gestión de Proyectos. Puerto: 8082")
@RestController
@RequestMapping("/proyectos")
@RequiredArgsConstructor
public class ProyectoController {

    private final ProyectoService service;

    @Operation(summary = "Listar proyectos")
    @GetMapping
    public ResponseEntity<List<Proyecto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Obtener proyecto por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Proyecto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Listar proyectos por cliente")
    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<Proyecto>> getByCliente(@PathVariable Long idCliente) {
        return ResponseEntity.ok(service.getByCliente(idCliente));
    }

    @Operation(summary = "Listar proyectos por estado")
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Proyecto>> getByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(service.getByEstado(estado));
    }

    @Operation(summary = "Listar proyectos por gestor")
    @GetMapping("/gestor/{idGestor}")
    public ResponseEntity<List<Proyecto>> getByGestor(@PathVariable Long idGestor) {
        return ResponseEntity.ok(service.getByGestor(idGestor));
    }

    @Operation(summary = "Crear proyecto")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Proyecto creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<Proyecto> create(@RequestBody Proyecto proyecto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(proyecto));
    }

    @Operation(summary = "Actualizar proyecto")
    @PutMapping("/{id}")
    public ResponseEntity<Proyecto> update(@PathVariable Long id, @RequestBody Proyecto proyecto) {
        return ResponseEntity.ok(service.update(id, proyecto));
    }

    @Operation(summary = "Actualizar avance del proyecto")
    @PutMapping("/{id}/avance/{porcentaje}")
    public ResponseEntity<Proyecto> actualizarAvance(
            @PathVariable Long id,
            @PathVariable Integer porcentaje) {
        return ResponseEntity.ok(service.actualizarAvance(id, porcentaje));
    }

    @Operation(summary = "Eliminar proyecto")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}