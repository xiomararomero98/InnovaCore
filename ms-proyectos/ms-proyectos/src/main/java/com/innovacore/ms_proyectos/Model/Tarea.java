package com.innovacore.ms_proyectos.Model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tarea")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Schema(description = "Modelo que representa una tarea en el sistema")
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tarea")
    private Long id;

    @Column(name = "nombre_tarea", nullable = false)
    private String nombreTarea;

    @Column
    private String descripcion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_limite", nullable = false)
    private LocalDate fechaLimite;

    @Column(name = "estado_tarea", nullable = false)
    private String estadoTarea = "PENDIENTE";

    @Column(nullable = false)
    private String prioridad = "MEDIA";

    @Column(name = "porcentaje_avance", nullable = false)
    private Integer porcentajeAvance = 0;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "id_responsable", nullable = false)
    private Long idResponsable; // referencia logica a usuario en db_seguridad

    @ManyToOne
    @JoinColumn(name = "id_proyecto", nullable = false)
    private Proyecto proyecto;
}