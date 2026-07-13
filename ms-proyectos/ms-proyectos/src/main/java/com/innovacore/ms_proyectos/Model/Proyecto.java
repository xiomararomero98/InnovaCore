package com.innovacore.ms_proyectos.Model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "proyecto")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Schema(description = "Modelo que representa un proyecto en el sistema")
public class Proyecto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proyecto")
    private Long id;

    @Column(name = "nombre_proyecto", nullable = false)
    private String nombreProyecto;

    @Column
    private String descripcion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "estado_proyecto", nullable = false)
    private String estadoProyecto = "PLANIFICADO";

    @Column(nullable = false)
    private String prioridad = "MEDIA";

    @Column(name = "porcentaje_avance", nullable = false)
    private Integer porcentajeAvance = 0;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_cambio_estado")
    private LocalDateTime fechaCambioEstado;

    @Column(name = "estado_anterior")
    private String estadoAnterior;

    @Column(name = "id_gestor", nullable = false)
    private Long idGestor; // referencia logica a usuario en db_seguridad

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;
}