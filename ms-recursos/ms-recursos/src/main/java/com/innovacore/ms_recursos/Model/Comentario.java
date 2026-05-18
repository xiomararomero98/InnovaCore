package com.innovacore.ms_recursos.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "comentario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comentario")
    private Long id;

    @Column(nullable = false, length = 1000)
    private String contenido;

    @Column(name = "fecha_comentario", nullable = false)
    private LocalDateTime fechaComentario;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario; // referencia lógica a usuario en db_seguridad

    @Column(name = "id_proyecto")
    private Long idProyecto; // referencia lógica a proyecto (puede ser null si es de tarea)

    @Column(name = "id_tarea")
    private Long idTarea; // referencia lógica a tarea (puede ser null si es de proyecto)
}