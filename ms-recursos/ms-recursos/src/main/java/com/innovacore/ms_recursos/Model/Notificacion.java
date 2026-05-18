package com.innovacore.ms_recursos.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 1000)
    private String mensaje;

    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio;

    @Column(nullable = false)
    private Boolean leida = false;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario; // referencia lógica a usuario en db_seguridad

    @Column(nullable = false)
    private String tipo = "INFO"; // INFO, ADVERTENCIA, ERROR, EXITO
}