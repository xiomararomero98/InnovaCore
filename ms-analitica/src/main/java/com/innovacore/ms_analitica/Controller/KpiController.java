package com.innovacore.ms_analitica.Controller;

import com.innovacore.ms_analitica.DTO.DashboardDTO;
import com.innovacore.ms_analitica.DTO.KpiDTO;
import com.innovacore.ms_analitica.Service.KpiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@Tag(name = "KPIs y Dashboard", description = "Indicadores clave de desempeño calculados en tiempo real")
@RestController
@RequestMapping("/kpis")
public class KpiController {

    private final KpiService service;

    public KpiController(KpiService service) {
        this.service = service;
    }

    @Operation(summary = "Obtener todos los KPIs del sistema")
    @GetMapping
    public ResponseEntity<List<KpiDTO>> getAllKpis() {
        return ResponseEntity.ok(service.getAllKpis());
    }

    @Operation(summary = "Obtener dashboard completo del sistema")
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        return ResponseEntity.ok(service.getDashboard());
    }

    @Operation(summary = "Total de proyectos activos")
    @GetMapping("/proyectos-activos")
    public ResponseEntity<KpiDTO> getProyectosActivos() {
        return ResponseEntity.ok(service.getTotalProyectosActivos());
    }

    @Operation(summary = "Proyectos atrasados")
    @GetMapping("/proyectos-atrasados")
    public ResponseEntity<KpiDTO> getProyectosAtrasados() {
        return ResponseEntity.ok(service.getProyectosAtrasados());
    }

    @Operation(summary = "Porcentaje promedio de avance de proyectos")
    @GetMapping("/avance-promedio")
    public ResponseEntity<KpiDTO> getAvancePromedio() {
        return ResponseEntity.ok(service.getPorcentajeAvancePromedio());
    }

    @Operation(summary = "Recursos disponibles")
    @GetMapping("/recursos-disponibles")
    public ResponseEntity<KpiDTO> getRecursosDisponibles() {
        return ResponseEntity.ok(service.getRecursosDisponibles());
    }

    @Operation(summary = "Recursos ocupados")
    @GetMapping("/recursos-ocupados")
    public ResponseEntity<KpiDTO> getRecursosOcupados() {
        return ResponseEntity.ok(service.getRecursosOcupados());
    }

    @Operation(summary = "Porcentaje de utilización de recursos")
    @GetMapping("/utilizacion-recursos")
    public ResponseEntity<KpiDTO> getUtilizacionRecursos() {
        return ResponseEntity.ok(service.getPorcentajeUtilizacionRecursos());
    }

    @Operation(summary = "Total de tareas completadas")
    @GetMapping("/tareas-completadas")
    public ResponseEntity<KpiDTO> getTareasCompletadas() {
        return ResponseEntity.ok(service.getTareasCompletadas());
    }
}