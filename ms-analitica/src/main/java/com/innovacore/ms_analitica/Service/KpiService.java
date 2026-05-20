package com.innovacore.ms_analitica.Service;

import com.innovacore.ms_analitica.DTO.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class KpiService {

    private final WebClient proyectosWebClient;
    private final WebClient recursosWebClient;

    public KpiService(
            @Qualifier("proyectosWebClient") WebClient proyectosWebClient,
            @Qualifier("recursosWebClient") WebClient recursosWebClient) {
        this.proyectosWebClient = proyectosWebClient;
        this.recursosWebClient = recursosWebClient;
    }

    // ==========================================================
    // OBTENER TODOS LOS PROYECTOS (desde ms-proyectos)
    // ==========================================================
    public List<ProyectoDTO> obtenerProyectos() {
        try {
            ProyectoDTO[] proyectos = proyectosWebClient.get()
                    .uri("/proyectos")
                    .retrieve()
                    .bodyToMono(ProyectoDTO[].class)
                    .onErrorResume(e -> Mono.just(new ProyectoDTO[0]))
                    .block();
            return proyectos != null ? Arrays.asList(proyectos) : new ArrayList<>();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // ==========================================================
    // OBTENER TODAS LAS TAREAS (desde ms-proyectos)
    // ==========================================================
    public List<TareaDTO> obtenerTareas() {
        try {
            TareaDTO[] tareas = proyectosWebClient.get()
                    .uri("/tareas")
                    .retrieve()
                    .bodyToMono(TareaDTO[].class)
                    .onErrorResume(e -> Mono.just(new TareaDTO[0]))
                    .block();
            return tareas != null ? Arrays.asList(tareas) : new ArrayList<>();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // ==========================================================
    // OBTENER TODOS LOS EMPLEADOS (desde ms-recursos)
    // ==========================================================
    public List<EmpleadoDTO> obtenerEmpleados() {
        try {
            EmpleadoDTO[] empleados = recursosWebClient.get()
                    .uri("/empleados")
                    .retrieve()
                    .bodyToMono(EmpleadoDTO[].class)
                    .onErrorResume(e -> Mono.just(new EmpleadoDTO[0]))
                    .block();
            return empleados != null ? Arrays.asList(empleados) : new ArrayList<>();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // ==========================================================
    // KPI: TOTAL DE PROYECTOS ACTIVOS
    // ==========================================================
    public KpiDTO getTotalProyectosActivos() {
        List<ProyectoDTO> proyectos = obtenerProyectos();
        long total = proyectos.stream()
                .filter(p -> "EN_CURSO".equalsIgnoreCase(p.getEstadoProyecto()))
                .count();
        return new KpiDTO("Proyectos Activos", "Total de proyectos en curso", (double) total, "cantidad", "PROYECTOS");
    }

    // ==========================================================
    // KPI: PROYECTOS ATRASADOS
    // ==========================================================
    public KpiDTO getProyectosAtrasados() {
        List<ProyectoDTO> proyectos = obtenerProyectos();
        LocalDate hoy = LocalDate.now();
        long atrasados = proyectos.stream()
                .filter(p -> p.getFechaFin() != null
                        && p.getFechaFin().isBefore(hoy)
                        && !"FINALIZADO".equalsIgnoreCase(p.getEstadoProyecto()))
                .count();
        return new KpiDTO("Proyectos Atrasados", "Proyectos con fecha de fin vencida", (double) atrasados, "cantidad", "PROYECTOS");
    }

    // ==========================================================
    // KPI: PORCENTAJE PROMEDIO DE AVANCE
    // ==========================================================
    public KpiDTO getPorcentajeAvancePromedio() {
        List<ProyectoDTO> proyectos = obtenerProyectos();
        if (proyectos.isEmpty()) {
            return new KpiDTO("Avance Promedio", "Avance promedio de proyectos", 0.0, "%", "PROYECTOS");
        }
        double promedio = proyectos.stream()
                .mapToInt(p -> p.getPorcentajeAvance() != null ? p.getPorcentajeAvance() : 0)
                .average()
                .orElse(0.0);
        promedio = Math.round(promedio * 100.0) / 100.0;
        return new KpiDTO("Avance Promedio", "Avance promedio de proyectos", promedio, "%", "PROYECTOS");
    }

    // ==========================================================
    // KPI: RECURSOS DISPONIBLES
    // ==========================================================
    public KpiDTO getRecursosDisponibles() {
        List<EmpleadoDTO> empleados = obtenerEmpleados();
        long disponibles = empleados.stream()
                .filter(e -> "DISPONIBLE".equalsIgnoreCase(e.getDisponibilidad()))
                .count();
        return new KpiDTO("Recursos Disponibles", "Empleados disponibles para asignar", (double) disponibles, "cantidad", "RECURSOS");
    }

    // ==========================================================
    // KPI: RECURSOS OCUPADOS
    // ==========================================================
    public KpiDTO getRecursosOcupados() {
        List<EmpleadoDTO> empleados = obtenerEmpleados();
        long ocupados = empleados.stream()
                .filter(e -> "OCUPADO".equalsIgnoreCase(e.getDisponibilidad()))
                .count();
        return new KpiDTO("Recursos Ocupados", "Empleados actualmente asignados", (double) ocupados, "cantidad", "RECURSOS");
    }

    // ==========================================================
    // KPI: PORCENTAJE DE UTILIZACIÓN DE RECURSOS
    // ==========================================================
    public KpiDTO getPorcentajeUtilizacionRecursos() {
        List<EmpleadoDTO> empleados = obtenerEmpleados();
        if (empleados.isEmpty()) {
            return new KpiDTO("Utilización Recursos", "Porcentaje de uso de recursos humanos", 0.0, "%", "RECURSOS");
        }
        long ocupados = empleados.stream()
                .filter(e -> "OCUPADO".equalsIgnoreCase(e.getDisponibilidad()))
                .count();
        double porcentaje = (ocupados * 100.0) / empleados.size();
        porcentaje = Math.round(porcentaje * 100.0) / 100.0;
        return new KpiDTO("Utilización Recursos", "Porcentaje de uso de recursos humanos", porcentaje, "%", "RECURSOS");
    }

    // ==========================================================
    // KPI: TAREAS COMPLETADAS
    // ==========================================================
    public KpiDTO getTareasCompletadas() {
        List<TareaDTO> tareas = obtenerTareas();
        long completadas = tareas.stream()
                .filter(t -> "COMPLETADA".equalsIgnoreCase(t.getEstadoTarea()))
                .count();
        return new KpiDTO("Tareas Completadas", "Total de tareas completadas", (double) completadas, "cantidad", "PROYECTOS");
    }

    // ==========================================================
    // OBTENER TODOS LOS KPIS
    // ==========================================================
    public List<KpiDTO> getAllKpis() {
        List<KpiDTO> kpis = new ArrayList<>();
        kpis.add(getTotalProyectosActivos());
        kpis.add(getProyectosAtrasados());
        kpis.add(getPorcentajeAvancePromedio());
        kpis.add(getRecursosDisponibles());
        kpis.add(getRecursosOcupados());
        kpis.add(getPorcentajeUtilizacionRecursos());
        kpis.add(getTareasCompletadas());
        return kpis;
    }

    // ==========================================================
    // DASHBOARD COMPLETO
    // ==========================================================
    public DashboardDTO getDashboard() {
        List<ProyectoDTO> proyectos = obtenerProyectos();
        List<TareaDTO> tareas = obtenerTareas();
        List<EmpleadoDTO> empleados = obtenerEmpleados();
        LocalDate hoy = LocalDate.now();

        DashboardDTO dashboard = new DashboardDTO();

        // PROYECTOS
        dashboard.setTotalProyectos(proyectos.size());
        dashboard.setProyectosActivos((int) proyectos.stream()
                .filter(p -> "EN_CURSO".equalsIgnoreCase(p.getEstadoProyecto())).count());
        dashboard.setProyectosAtrasados((int) proyectos.stream()
                .filter(p -> p.getFechaFin() != null
                        && p.getFechaFin().isBefore(hoy)
                        && !"FINALIZADO".equalsIgnoreCase(p.getEstadoProyecto())).count());
        dashboard.setProyectosFinalizados((int) proyectos.stream()
                .filter(p -> "FINALIZADO".equalsIgnoreCase(p.getEstadoProyecto())).count());

        double avance = proyectos.isEmpty() ? 0.0 :
                proyectos.stream().mapToInt(p -> p.getPorcentajeAvance() != null ? p.getPorcentajeAvance() : 0)
                        .average().orElse(0.0);
        dashboard.setPorcentajeAvancePromedio(Math.round(avance * 100.0) / 100.0);

        // RECURSOS
        dashboard.setTotalEmpleados(empleados.size());
        dashboard.setEmpleadosDisponibles((int) empleados.stream()
                .filter(e -> "DISPONIBLE".equalsIgnoreCase(e.getDisponibilidad())).count());
        dashboard.setEmpleadosOcupados((int) empleados.stream()
                .filter(e -> "OCUPADO".equalsIgnoreCase(e.getDisponibilidad())).count());

        double utilizacion = empleados.isEmpty() ? 0.0 :
                (dashboard.getEmpleadosOcupados() * 100.0) / empleados.size();
        dashboard.setPorcentajeUtilizacionRecursos(Math.round(utilizacion * 100.0) / 100.0);

        // TAREAS
        dashboard.setTotalTareas(tareas.size());
        dashboard.setTareasCompletadas((int) tareas.stream()
                .filter(t -> "COMPLETADA".equalsIgnoreCase(t.getEstadoTarea())).count());
        dashboard.setTareasPendientes((int) tareas.stream()
                .filter(t -> "PENDIENTE".equalsIgnoreCase(t.getEstadoTarea())).count());

        return dashboard;
    }
}