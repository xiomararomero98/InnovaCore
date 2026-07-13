package com.innovacore.ms_analitica.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TareaDTO {
    private Long id;
    private String nombreTarea;
    private String estadoTarea;
    private String prioridad;
    private Integer porcentajeAvance;
    private LocalDateTime fechaCambioEstado;
    private LocalDateTime fechaCreacion;
}