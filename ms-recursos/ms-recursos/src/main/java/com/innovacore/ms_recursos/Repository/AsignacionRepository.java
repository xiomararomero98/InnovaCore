package com.innovacore.ms_recursos.Repository;

import com.innovacore.ms_recursos.Model.Asignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AsignacionRepository extends JpaRepository<Asignacion, Long> {
    List<Asignacion> findByEmpleadoId(Long idEmpleado);
    List<Asignacion> findByIdProyecto(Long idProyecto);
    List<Asignacion> findByEstado(String estado);
}