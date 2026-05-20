package com.innovacore.ms_analitica.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiDTO {
    private String nombre;
    private String descripcion;
    private Double valor;
    private String unidad; // %, cantidad, horas
    private String tipo;   // PROYECTOS, RECURSOS, GENERAL
}