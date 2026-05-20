package com.innovacore.ms_analitica.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProyectoDTO {
    private Long id;
    private String nombreProyecto;
    private String estadoProyecto;
    private String prioridad;
    private Integer porcentajeAvance;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}