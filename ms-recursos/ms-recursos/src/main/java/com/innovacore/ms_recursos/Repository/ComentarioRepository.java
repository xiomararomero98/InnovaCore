package com.innovacore.ms_recursos.Repository;

import com.innovacore.ms_recursos.Model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByIdProyecto(Long idProyecto);
    List<Comentario> findByIdTarea(Long idTarea);
    List<Comentario> findByIdUsuario(Long idUsuario);
}