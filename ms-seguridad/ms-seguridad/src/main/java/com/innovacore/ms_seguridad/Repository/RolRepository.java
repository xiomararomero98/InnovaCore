package com.innovacore.ms_seguridad.Repository;

import com.innovacore.ms_seguridad.Model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombreRolIgnoreCase(String nombreRol);
}