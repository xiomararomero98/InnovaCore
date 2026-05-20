package com.innovacore.ms_analitica.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "metrica_recurso")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetricaRecurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_metrica_recurso")
    private Long id;

    @Column(name = "id_empleado", nullable = false)
    private Long idEmpleado; // referencia lógica al empleado en db_recursos

    @Column(name = "fecha_medicion", nullable = false)
    private LocalDate fechaMedicion;

    @Column(name = "porcentaje_utilizacion", nullable = false)
    private Double porcentajeUtilizacion;

    @Column(name = "horas_asignadas", nullable = false)
    private Integer horasAsignadas;

    @Column(name = "horas_disponibles", nullable = false)
    private Integer horasDisponibles;
}