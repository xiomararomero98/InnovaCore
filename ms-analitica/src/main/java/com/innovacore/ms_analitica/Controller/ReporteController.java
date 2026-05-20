package com.innovacore.ms_analitica.Controller;

import com.innovacore.ms_analitica.Model.Reporte;
import com.innovacore.ms_analitica.Service.ReporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Reportes", description = "Gestión de reportes del sistema")
@RestController
@RequestMapping("/reportes")
public class ReporteController {

    private final ReporteService service;

    public ReporteController(ReporteService service) {
        this.service = service;
    }

    @Operation(summary = "Listar reportes")
    @GetMapping
    public ResponseEntity<List<Reporte>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Obtener reporte por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Reporte> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Listar reportes por tipo")
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Reporte>> getByTipo(@PathVariable String tipo) {
        return ResponseEntity.ok(service.getByTipo(tipo));
    }

    @Operation(summary = "Listar reportes por usuario")
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Reporte>> getByUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(service.getByUsuario(idUsuario));
    }

    @Operation(summary = "Crear reporte")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Reporte creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<Reporte> create(@RequestBody Reporte reporte) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(reporte));
    }

    @Operation(summary = "Actualizar reporte")
    @PutMapping("/{id}")
    public ResponseEntity<Reporte> update(@PathVariable Long id, @RequestBody Reporte reporte) {
        return ResponseEntity.ok(service.update(id, reporte));
    }

    @Operation(summary = "Eliminar reporte")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}