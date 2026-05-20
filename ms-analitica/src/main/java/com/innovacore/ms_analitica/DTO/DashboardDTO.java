package com.innovacore.ms_analitica.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    // Indicadores de proyectos
    private Integer totalProyectos;
    private Integer proyectosActivos;
    private Integer proyectosAtrasados;
    private Integer proyectosFinalizados;
    private Double porcentajeAvancePromedio;

    // Indicadores de recursos
    private Integer totalEmpleados;
    private Integer empleadosDisponibles;
    private Integer empleadosOcupados;
    private Double porcentajeUtilizacionRecursos;

    // Indicadores de tareas
    private Integer totalTareas;
    private Integer tareasCompletadas;
    private Integer tareasPendientes;
}