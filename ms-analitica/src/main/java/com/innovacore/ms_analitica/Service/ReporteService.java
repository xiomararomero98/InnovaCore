package com.innovacore.ms_analitica.Service;

import com.innovacore.ms_analitica.Model.Reporte;
import com.innovacore.ms_analitica.Repository.ReporteRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReporteService {

    private final ReporteRepository repository;

    public ReporteService(ReporteRepository repository) {
        this.repository = repository;
    }

    // ==========================================================
    // LISTAR TODOS
    // ==========================================================
    public List<Reporte> getAll() {
        return repository.findAll();
    }

    // ==========================================================
    // BUSCAR POR ID
    // ==========================================================
    public Reporte getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado con id: " + id));
    }

    // ==========================================================
    // LISTAR POR TIPO
    // ==========================================================
    public List<Reporte> getByTipo(String tipo) {
        return repository.findByTipoReporte(tipo);
    }

    // ==========================================================
    // LISTAR POR USUARIO QUE GENERÓ
    // ==========================================================
    public List<Reporte> getByUsuario(Long idUsuario) {
        return repository.findByIdUsuarioGenera(idUsuario);
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================
    private void validar(Reporte reporte) {
        if (reporte.getNombreReporte() == null || reporte.getNombreReporte().isBlank())
            throw new RuntimeException("El nombre del reporte es obligatorio");
        if (reporte.getTipoReporte() == null || reporte.getTipoReporte().isBlank())
            throw new RuntimeException("El tipo de reporte es obligatorio");
        if (reporte.getIdUsuarioGenera() == null)
            throw new RuntimeException("El usuario que genera el reporte es obligatorio");
    }

    // ==========================================================
    // CREAR REPORTE
    // ==========================================================
    public Reporte create(Reporte reporte) {
        validar(reporte);

        if (reporte.getFechaGeneracion() == null)
            reporte.setFechaGeneracion(LocalDateTime.now());

        return repository.save(reporte);
    }

    // ==========================================================
    // ACTUALIZAR REPORTE
    // ==========================================================
    public Reporte update(Long id, Reporte reporte) {
        Reporte db = getById(id);
        validar(reporte);

        db.setNombreReporte(reporte.getNombreReporte());
        db.setTipoReporte(reporte.getTipoReporte());
        db.setContenidoResumen(reporte.getContenidoResumen());

        return repository.save(db);
    }

    // ==========================================================
    // ELIMINAR REPORTE
    // ==========================================================
    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new RuntimeException("No existe un reporte con id: " + id);
        repository.deleteById(id);
    }
}