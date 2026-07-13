package com.innovacore.ms_proyectos.Model;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "comentario_tarea")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Comentario dentro de una tarea")
public class ComentarioTarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comentario")
    private Long id;

    @Column(nullable = false, length = 2000)
    private String contenido;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario; // referencia lógica al usuario en db_seguridad

    @Column(name = "nombre_usuario", nullable = false)
    private String nombreUsuario; // guardamos el nombre para no tener que consultar ms-seguridad

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @ManyToOne
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;
}