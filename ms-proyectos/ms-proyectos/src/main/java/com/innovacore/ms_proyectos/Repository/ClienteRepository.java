package com.innovacore.ms_proyectos.Repository;

import com.innovacore.ms_proyectos.Model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByCorreoContacto(String correoContacto);
    boolean existsByCorreoContacto(String correoContacto);
}