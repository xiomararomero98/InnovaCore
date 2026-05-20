package com.innovacore.ms_analitica.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String cargo;
    private String especialidad;
    private String disponibilidad;
    private Integer estado;
}