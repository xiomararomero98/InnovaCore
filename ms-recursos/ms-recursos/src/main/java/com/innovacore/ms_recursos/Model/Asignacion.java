package com.innovacore.ms_recursos.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "asignacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignacion")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @Column(name = "id_proyecto", nullable = false)
    private Long idProyecto; // referencia lógica a proyecto en db_proyectos

    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDateTime fechaAsignacion;

    @Column(name = "horas_asignadas", nullable = false)
    private Integer horasAsignadas;

    @Column(name = "rol_en_proyecto", nullable = false)
    private String rolEnProyecto; // DESARROLLADOR, LIDER_TECNICO, ANALISTA, etc.

    @Column(nullable = false)
    private String estado = "ACTIVA"; // ACTIVA, FINALIZADA, CANCELADA
}