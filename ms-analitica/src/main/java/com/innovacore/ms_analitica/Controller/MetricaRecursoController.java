package com.innovacore.ms_analitica.Controller;

import com.innovacore.ms_analitica.Model.MetricaRecurso;
import com.innovacore.ms_analitica.Service.MetricaRecursoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@Tag(name = "Métricas de Recursos", description = "Gestión de métricas de utilización de recursos")
@RestController
@RequestMapping("/metricas")
public class MetricaRecursoController {

    private final MetricaRecursoService service;

    public MetricaRecursoController(MetricaRecursoService service) {
        this.service = service;
    }

    @Operation(summary = "Listar métricas")
    @GetMapping
    public ResponseEntity<List<MetricaRecurso>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Obtener métrica por ID")
    @GetMapping("/{id}")
    public ResponseEntity<MetricaRecurso> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Listar métricas por empleado")
    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<List<MetricaRecurso>> getByEmpleado(@PathVariable Long idEmpleado) {
        return ResponseEntity.ok(service.getByEmpleado(idEmpleado));
    }

    @Operation(summary = "Listar métricas por fecha")
    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<MetricaRecurso>> getByFecha(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(service.getByFecha(fecha));
    }

    @Operation(summary = "Promedio general de utilización")
    @GetMapping("/promedio-utilizacion")
    public ResponseEntity<Double> getPromedioUtilizacion() {
        return ResponseEntity.ok(service.getPromedioUtilizacion());
    }

    @Operation(summary = "Crear métrica de recurso")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Métrica creada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<MetricaRecurso> create(@RequestBody MetricaRecurso metrica) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(metrica));
    }

    @Operation(summary = "Actualizar métrica")
    @PutMapping("/{id}")
    public ResponseEntity<MetricaRecurso> update(@PathVariable Long id, @RequestBody MetricaRecurso metrica) {
        return ResponseEntity.ok(service.update(id, metrica));
    }

    @Operation(summary = "Eliminar métrica")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}