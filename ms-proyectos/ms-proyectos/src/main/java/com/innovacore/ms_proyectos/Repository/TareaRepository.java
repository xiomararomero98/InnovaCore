package com.innovacore.ms_proyectos.Repository;

import com.innovacore.ms_proyectos.Model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByProyectoId(Long idProyecto);
    List<Tarea> findByIdResponsable(Long idResponsable);
    List<Tarea> findByEstadoTarea(String estadoTarea);
}