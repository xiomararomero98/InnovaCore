package com.innovacore.ms_recursos.Service;

import com.innovacore.ms_recursos.Model.Notificacion;
import com.innovacore.ms_recursos.Repository.NotificacionRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificacionService {

    private final NotificacionRepository repository;

    public NotificacionService(NotificacionRepository repository) {
        this.repository = repository;
    }

    // ==========================================================
    // LISTAR TODAS
    // ==========================================================
    public List<Notificacion> getAll() {
        return repository.findAll();
    }

    // ==========================================================
    // BUSCAR POR ID
    // ==========================================================
    public Notificacion getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada con id: " + id));
    }

    // ==========================================================
    // LISTAR POR USUARIO
    // ==========================================================
    public List<Notificacion> getByUsuario(Long idUsuario) {
        return repository.findByIdUsuario(idUsuario);
    }

    // ==========================================================
    // LISTAR NO LEÍDAS POR USUARIO
    // ==========================================================
    public List<Notificacion> getNoLeidas(Long idUsuario) {
        return repository.findByIdUsuarioAndLeida(idUsuario, false);
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================
    private void validar(Notificacion notificacion) {
        if (notificacion.getTitulo() == null || notificacion.getTitulo().isBlank())
            throw new RuntimeException("El título es obligatorio");
        if (notificacion.getMensaje() == null || notificacion.getMensaje().isBlank())
            throw new RuntimeException("El mensaje es obligatorio");
        if (notificacion.getIdUsuario() == null)
            throw new RuntimeException("El usuario destinatario es obligatorio");
    }

    // ==========================================================
    // CREAR NOTIFICACIÓN
    // ==========================================================
    public Notificacion create(Notificacion notificacion) {
        validar(notificacion);

        if (notificacion.getFechaEnvio() == null)
            notificacion.setFechaEnvio(LocalDateTime.now());
        if (notificacion.getLeida() == null)
            notificacion.setLeida(false);
        if (notificacion.getTipo() == null)
            notificacion.setTipo("INFO");

        return repository.save(notificacion);
    }

    // ==========================================================
    // MARCAR COMO LEÍDA
    // ==========================================================
    public Notificacion marcarComoLeida(Long id) {
        Notificacion notificacion = getById(id);
        notificacion.setLeida(true);
        return repository.save(notificacion);
    }

    // ==========================================================
    // MARCAR TODAS COMO LEÍDAS (de un usuario)
    // ==========================================================
    public void marcarTodasComoLeidas(Long idUsuario) {
        List<Notificacion> noLeidas = repository.findByIdUsuarioAndLeida(idUsuario, false);
        noLeidas.forEach(n -> n.setLeida(true));
        repository.saveAll(noLeidas);
    }

    // ==========================================================
    // ELIMINAR NOTIFICACIÓN
    // ==========================================================
    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new RuntimeException("No existe una notificación con id: " + id);
        repository.deleteById(id);
    }
}