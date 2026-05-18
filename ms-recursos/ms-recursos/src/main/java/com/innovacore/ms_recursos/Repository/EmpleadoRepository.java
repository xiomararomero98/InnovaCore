package com.innovacore.ms_recursos.Repository;

import com.innovacore.ms_recursos.Model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByCorreo(String correo);
    List<Empleado> findByEspecialidad(String especialidad);
    List<Empleado> findByDisponibilidad(String disponibilidad);
    List<Empleado> findByEstado(Integer estado);
}