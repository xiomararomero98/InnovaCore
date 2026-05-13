package com.innovacore.ms_proyectos.Service;

import com.innovacore.ms_proyectos.Model.Cliente;
import com.innovacore.ms_proyectos.Model.Proyecto;
import com.innovacore.ms_proyectos.Repository.ClienteRepository;
import com.innovacore.ms_proyectos.Repository.ProyectoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ProyectoService {

    private final ProyectoRepository repository;
    private final ClienteRepository clienteRepository;

    public ProyectoService(ProyectoRepository repository, ClienteRepository clienteRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
    }

    // ==========================================================
    // LISTAR TODOS
    // ==========================================================
    public List<Proyecto> getAll() {
        return repository.findAll();
    }

    // ==========================================================
    // BUSCAR POR ID
    // ==========================================================
    public Proyecto getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con id: " + id));
    }

    // ==========================================================
    // LISTAR POR CLIENTE
    // ==========================================================
    public List<Proyecto> getByCliente(Long idCliente) {
        return repository.findByClienteId(idCliente);
    }

    // ==========================================================
    // LISTAR POR ESTADO
    // ==========================================================
    public List<Proyecto> getByEstado(String estado) {
        return repository.findByEstadoProyecto(estado);
    }

    // ==========================================================
    // LISTAR POR GESTOR
    // ==========================================================
    public List<Proyecto> getByGestor(Long idGestor) {
        return repository.findByIdGestor(idGestor);
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================
    private void validar(Proyecto proyecto) {
        if (proyecto.getNombreProyecto() == null || proyecto.getNombreProyecto().isBlank())
            throw new RuntimeException("El nombre del proyecto es obligatorio");
        if (proyecto.getFechaInicio() == null)
            throw new RuntimeException("La fecha de inicio es obligatoria");
        if (proyecto.getFechaFin() == null)
            throw new RuntimeException("La fecha de fin es obligatoria");
        if (proyecto.getFechaFin().isBefore(proyecto.getFechaInicio()))
            throw new RuntimeException("La fecha de fin no puede ser anterior a la fecha de inicio");
        if (proyecto.getIdGestor() == null)
            throw new RuntimeException("El gestor es obligatorio");
    }

    // ==========================================================
    // CREAR PROYECTO
    // ==========================================================
    public Proyecto create(Proyecto proyecto) {
        validar(proyecto);

        if (proyecto.getCliente() != null && proyecto.getCliente().getId() != null) {
            Cliente cliente = clienteRepository.findById(proyecto.getCliente().getId())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
            proyecto.setCliente(cliente);
        }

        if (proyecto.getEstadoProyecto() == null) proyecto.setEstadoProyecto("PLANIFICADO");
        if (proyecto.getPrioridad() == null) proyecto.setPrioridad("MEDIA");
        if (proyecto.getPorcentajeAvance() == null) proyecto.setPorcentajeAvance(0);
        if (proyecto.getFechaCreacion() == null) proyecto.setFechaCreacion(LocalDateTime.now());

        return repository.save(proyecto);
    }

    // ==========================================================
    // ACTUALIZAR PROYECTO
    // ==========================================================
    public Proyecto update(Long id, Proyecto proyecto) {
        Proyecto dbProyecto = getById(id);
        validar(proyecto);

        dbProyecto.setNombreProyecto(proyecto.getNombreProyecto());
        dbProyecto.setDescripcion(proyecto.getDescripcion());
        dbProyecto.setFechaInicio(proyecto.getFechaInicio());
        dbProyecto.setFechaFin(proyecto.getFechaFin());
        dbProyecto.setEstadoProyecto(proyecto.getEstadoProyecto());
        dbProyecto.setPrioridad(proyecto.getPrioridad());
        dbProyecto.setPorcentajeAvance(proyecto.getPorcentajeAvance());
        dbProyecto.setIdGestor(proyecto.getIdGestor());

        if (proyecto.getCliente() != null && proyecto.getCliente().getId() != null) {
            Cliente cliente = clienteRepository.findById(proyecto.getCliente().getId())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
            dbProyecto.setCliente(cliente);
        }

        return repository.save(dbProyecto);
    }

    // ==========================================================
    // ELIMINAR PROYECTO
    // ==========================================================
    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new RuntimeException("No existe un proyecto con id: " + id);
        repository.deleteById(id);
    }

    // ==========================================================
    // ACTUALIZAR AVANCE
    // ==========================================================
    public Proyecto actualizarAvance(Long id, Integer porcentaje) {
        if (porcentaje < 0 || porcentaje > 100)
            throw new RuntimeException("El porcentaje debe estar entre 0 y 100");
        Proyecto proyecto = getById(id);
        proyecto.setPorcentajeAvance(porcentaje);
        return repository.save(proyecto);
    }
}