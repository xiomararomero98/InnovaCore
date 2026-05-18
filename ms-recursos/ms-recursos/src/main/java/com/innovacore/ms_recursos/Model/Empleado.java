package com.innovacore.ms_recursos.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "empleado")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(nullable = false, unique = true)
    private String correo;

    @Column(nullable = false)
    private String cargo;

    @Column(nullable = false)
    private String especialidad;

    @Column(nullable = false)
    private String disponibilidad = "DISPONIBLE"; // DISPONIBLE, OCUPADO, NO_DISPONIBLE

    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 1")
    private Integer estado;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
}