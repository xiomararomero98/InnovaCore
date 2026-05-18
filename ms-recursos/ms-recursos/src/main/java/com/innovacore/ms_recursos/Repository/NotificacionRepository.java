package com.innovacore.ms_recursos.Repository;

import com.innovacore.ms_recursos.Model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByIdUsuario(Long idUsuario);
    List<Notificacion> findByIdUsuarioAndLeida(Long idUsuario, Boolean leida);
}