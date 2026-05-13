package com.innovacore.ms_proyectos.Model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Schema(description = "Modelo que representa un cliente en el sistema")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;

    @Column(name = "nombre_cliente", nullable = false)
    private String nombreCliente;

    @Column(nullable = false)
    private String rubro;

    @Column(name = "correo_contacto", nullable = false, unique = true)
    private String correoContacto;

    @Column
    private String telefono;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
}