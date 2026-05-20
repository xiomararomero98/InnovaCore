package com.innovacore.ms_proyectos.Event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProyectoCreadoEvent implements Serializable {

    private Long idProyecto;
    private String nombreProyecto;
    private String estadoProyecto;
    private String prioridad;
    private Long idGestor;
    private Long idCliente;
    private LocalDateTime fechaEvento;

    public static ProyectoCreadoEvent crear(
            Long idProyecto,
            String nombreProyecto,
            String estadoProyecto,
            String prioridad,
            Long idGestor,
            Long idCliente) {
        return new ProyectoCreadoEvent(
                idProyecto,
                nombreProyecto,
                estadoProyecto,
                prioridad,
                idGestor,
                idCliente,
                LocalDateTime.now()
        );
    }
}