package com.innovacore.ms_analitica.Event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionCreadaEvent implements Serializable {

    private Long idAsignacion;
    private Long idEmpleado;
    private String nombreEmpleado;
    private Long idProyecto;
    private Integer horasAsignadas;
    private String rolEnProyecto;
    private LocalDateTime fechaEvento;
}