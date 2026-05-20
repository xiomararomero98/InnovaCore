package com.innovacore.ms_analitica.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reporte")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte")
    private Long id;

    @Column(name = "nombre_reporte", nullable = false)
    private String nombreReporte;

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDateTime fechaGeneracion;

    @Column(name = "tipo_reporte", nullable = false)
    private String tipoReporte; // PROYECTOS, RECURSOS, GENERAL, KPI

    @Column(name = "contenido_resumen", length = 5000)
    private String contenidoResumen;

    @Column(name = "id_usuario_genera", nullable = false)
    private Long idUsuarioGenera; // referencia lógica al usuario que generó el reporte
}