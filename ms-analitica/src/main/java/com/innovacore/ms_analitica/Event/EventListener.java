package com.innovacore.ms_analitica.Event;

import com.innovacore.ms_analitica.Config.RabbitMqConfig;
import com.innovacore.ms_analitica.Model.Reporte;
import com.innovacore.ms_analitica.Repository.ReporteRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class EventListener {

    private final ReporteRepository reporteRepository;

    public EventListener(ReporteRepository reporteRepository) {
        this.reporteRepository = reporteRepository;
    }

    // ==========================================================
    // ESCUCHAR: PROYECTO CREADO
    // ==========================================================
    @RabbitListener(queues = RabbitMqConfig.QUEUE_PROYECTO_CREADO)
    public void onProyectoCreado(ProyectoCreadoEvent evento) {
        System.out.println(" Evento recibido: ProyectoCreado");
        System.out.println("   - Proyecto: " + evento.getNombreProyecto());
        System.out.println("   - Estado: " + evento.getEstadoProyecto());
        System.out.println("   - Prioridad: " + evento.getPrioridad());

        // Crear un reporte automático
        Reporte reporte = new Reporte();
        reporte.setNombreReporte("Nuevo proyecto registrado: " + evento.getNombreProyecto());
        reporte.setFechaGeneracion(LocalDateTime.now());
        reporte.setTipoReporte("PROYECTOS");
        reporte.setContenidoResumen(
                "Se ha creado un nuevo proyecto con prioridad " + evento.getPrioridad() +
                " y estado " + evento.getEstadoProyecto() +
                ". Gestionado por usuario id: " + evento.getIdGestor()
        );
        reporte.setIdUsuarioGenera(evento.getIdGestor());

        reporteRepository.save(reporte);

        System.out.println(" Reporte automático generado para el proyecto: " + evento.getNombreProyecto());
    }

    // ==========================================================
    // ESCUCHAR: ASIGNACIÓN CREADA
    // ==========================================================
    @RabbitListener(queues = RabbitMqConfig.QUEUE_ASIGNACION_CREADA)
    public void onAsignacionCreada(AsignacionCreadaEvent evento) {
        System.out.println("Evento recibido: AsignacionCreada");
        System.out.println("   - Empleado: " + evento.getNombreEmpleado());
        System.out.println("   - Proyecto ID: " + evento.getIdProyecto());
        System.out.println("   - Horas: " + evento.getHorasAsignadas());

        // Crear un reporte automático
        Reporte reporte = new Reporte();
        reporte.setNombreReporte("Nueva asignación: " + evento.getNombreEmpleado());
        reporte.setFechaGeneracion(LocalDateTime.now());
        reporte.setTipoReporte("RECURSOS");
        reporte.setContenidoResumen(
                "El empleado " + evento.getNombreEmpleado() +
                " ha sido asignado al proyecto id " + evento.getIdProyecto() +
                " con " + evento.getHorasAsignadas() + " horas en rol de " + evento.getRolEnProyecto()
        );
        reporte.setIdUsuarioGenera(evento.getIdEmpleado());

        reporteRepository.save(reporte);

        System.out.println("Reporte automático generado para la asignación de: " + evento.getNombreEmpleado());
    }
}