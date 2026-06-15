package com.innovacore.ms_recursos.Repository;

import com.innovacore.ms_recursos.Model.Asignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AsignacionRepository extends JpaRepository<Asignacion, Long> {

    List<Asignacion> findByEmpleadoId(Long idEmpleado);

    List<Asignacion> findByEmpleadoIdAndEstado(Long idEmpleado, String estado);

    List<Asignacion> findByIdProyecto(Long idProyecto);

    List<Asignacion> findByIdTarea(Long idTarea);

    List<Asignacion> findByIdProyectoAndIdTarea(Long idProyecto, Long idTarea);

    List<Asignacion> findByEstado(String estado);

    boolean existsByEmpleadoIdAndIdProyectoAndIdTareaAndEstado(
            Long idEmpleado,
            Long idProyecto,
            Long idTarea,
            String estado
    );

    boolean existsByEmpleadoIdAndIdProyectoAndIdTareaIsNullAndEstado(
            Long idEmpleado,
            Long idProyecto,
            String estado
    );
}