package com.innovacore.ms_proyectos.Repository;

import com.innovacore.ms_proyectos.Model.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {
    List<Proyecto> findByClienteId(Long idCliente);
    List<Proyecto> findByEstadoProyecto(String estadoProyecto);
    List<Proyecto> findByIdGestor(Long idGestor);
}