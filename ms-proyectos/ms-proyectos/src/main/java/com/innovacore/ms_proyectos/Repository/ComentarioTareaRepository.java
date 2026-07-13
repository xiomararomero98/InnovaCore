package com.innovacore.ms_proyectos.Repository;
import com.innovacore.ms_proyectos.Model.ComentarioTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComentarioTareaRepository extends JpaRepository<ComentarioTarea, Long> {
    List<ComentarioTarea> findByTareaIdOrderByFechaCreacionAsc(Long idTarea);
}