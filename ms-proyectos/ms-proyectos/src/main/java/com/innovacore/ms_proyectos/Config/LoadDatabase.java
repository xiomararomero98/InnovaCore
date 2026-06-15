package com.innovacore.ms_proyectos.Config;

import com.innovacore.ms_proyectos.Model.Cliente;
import com.innovacore.ms_proyectos.Model.Proyecto;
import com.innovacore.ms_proyectos.Model.Tarea;
import com.innovacore.ms_proyectos.Repository.ClienteRepository;
import com.innovacore.ms_proyectos.Repository.ProyectoRepository;
import com.innovacore.ms_proyectos.Repository.TareaRepository;
import com.innovacore.ms_proyectos.Service.ProyectoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class LoadDatabase {

    @Bean
    CommandLineRunner initDatabase(
            ClienteRepository clienteRepository,
            ProyectoRepository proyectoRepository,
            TareaRepository tareaRepository,
            ProyectoService proyectoService) {

        return args -> {
            Cliente innovatech = crearClienteSiNoExiste(
                    clienteRepository,
                    "Innovatech SpA",
                    "Tecnología",
                    "contacto@innovatech.cl",
                    "+56911112222"
            );

            Cliente retailNova = crearClienteSiNoExiste(
                    clienteRepository,
                    "Retail Nova",
                    "Retail",
                    "contacto@retailnova.cl",
                    "+56933334444"
            );

            Cliente clinicaDigital = crearClienteSiNoExiste(
                    clienteRepository,
                    "Clínica Digital",
                    "Salud",
                    "contacto@clinicadigital.cl",
                    "+56955556666"
            );

            Proyecto proyectoWeb = crearProyectoSiNoExiste(
                    proyectoRepository,
                    "Plataforma Web Innovatech",
                    "Sistema web para administrar proyectos, tareas y recursos internos.",
                    LocalDate.now().minusDays(20),
                    LocalDate.now().plusDays(40),
                    "ALTA",
                    2L,
                    innovatech
            );

            Proyecto proyectoMovil = crearProyectoSiNoExiste(
                    proyectoRepository,
                    "App Móvil Retail Nova",
                    "Aplicación móvil para seguimiento de pedidos y atención de clientes.",
                    LocalDate.now().minusDays(10),
                    LocalDate.now().plusDays(30),
                    "MEDIA",
                    2L,
                    retailNova
            );

            Proyecto proyectoClinico = crearProyectoSiNoExiste(
                    proyectoRepository,
                    "Sistema Clínico Digital",
                    "Plataforma para gestión de horas médicas, pacientes y reportes.",
                    LocalDate.now().minusDays(45),
                    LocalDate.now().minusDays(5),
                    "ALTA",
                    2L,
                    clinicaDigital
            );

            crearTareasDemoSiNoExisten(tareaRepository, proyectoWeb);
            crearTareasDemoSiNoExisten(tareaRepository, proyectoMovil);
            crearTareasDemoSiNoExisten(tareaRepository, proyectoClinico);

            proyectoService.recalcularAvanceYEstado(proyectoWeb.getId());
            proyectoService.recalcularAvanceYEstado(proyectoMovil.getId());
            proyectoService.recalcularAvanceYEstado(proyectoClinico.getId());

            System.out.println("✅ Clientes, proyectos y tareas demo cargados correctamente");
        };
    }

    private Cliente crearClienteSiNoExiste(
            ClienteRepository clienteRepository,
            String nombre,
            String rubro,
            String correo,
            String telefono) {

        return clienteRepository.findByCorreoContacto(correo)
                .orElseGet(() -> {
                    Cliente cliente = new Cliente();
                    cliente.setNombreCliente(nombre);
                    cliente.setRubro(rubro);
                    cliente.setCorreoContacto(correo);
                    cliente.setTelefono(telefono);
                    cliente.setFechaRegistro(LocalDateTime.now());
                    return clienteRepository.save(cliente);
                });
    }

    private Proyecto crearProyectoSiNoExiste(
            ProyectoRepository proyectoRepository,
            String nombre,
            String descripcion,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String prioridad,
            Long idGestor,
            Cliente cliente) {

        return proyectoRepository.findAll().stream()
                .filter(p -> nombre.equalsIgnoreCase(p.getNombreProyecto()))
                .findFirst()
                .orElseGet(() -> {
                    Proyecto proyecto = new Proyecto();
                    proyecto.setNombreProyecto(nombre);
                    proyecto.setDescripcion(descripcion);
                    proyecto.setFechaInicio(fechaInicio);
                    proyecto.setFechaFin(fechaFin);
                    proyecto.setPrioridad(prioridad);
                    proyecto.setEstadoProyecto("PLANIFICADO");
                    proyecto.setPorcentajeAvance(0);
                    proyecto.setFechaCreacion(LocalDateTime.now());
                    proyecto.setIdGestor(idGestor);
                    proyecto.setCliente(cliente);

                    return proyectoRepository.save(proyecto);
                });
    }

    private void crearTareasDemoSiNoExisten(
            TareaRepository tareaRepository,
            Proyecto proyecto) {

        if (!tareaRepository.findByProyectoId(proyecto.getId()).isEmpty()) {
            return;
        }

        crearTarea(
                tareaRepository,
                proyecto,
                "Levantamiento de requerimientos",
                "Reunión con cliente, definición de alcance y documentación inicial.",
                "COMPLETADA",
                "ALTA",
                3L,
                LocalDate.now().minusDays(20),
                LocalDate.now().minusDays(15)
        );

        crearTarea(
                tareaRepository,
                proyecto,
                "Diseño de arquitectura",
                "Definición de módulos, microservicios y flujos principales.",
                "EN_PROGRESO",
                "ALTA",
                3L,
                LocalDate.now().minusDays(14),
                LocalDate.now().plusDays(5)
        );

        crearTarea(
                tareaRepository,
                proyecto,
                "Implementación de funcionalidades",
                "Desarrollo de pantallas, endpoints y reglas de negocio.",
                "PENDIENTE",
                "MEDIA",
                3L,
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(20)
        );
    }

    private void crearTarea(
            TareaRepository tareaRepository,
            Proyecto proyecto,
            String nombre,
            String descripcion,
            String estado,
            String prioridad,
            Long idResponsable,
            LocalDate fechaInicio,
            LocalDate fechaLimite) {

        Tarea tarea = new Tarea();
        tarea.setNombreTarea(nombre);
        tarea.setDescripcion(descripcion);
        tarea.setEstadoTarea(estado);
        tarea.setPorcentajeAvance(calcularAvancePorEstado(estado));
        tarea.setPrioridad(prioridad);
        tarea.setIdResponsable(idResponsable);
        tarea.setFechaInicio(fechaInicio);
        tarea.setFechaLimite(fechaLimite);
        tarea.setFechaCreacion(LocalDateTime.now());
        tarea.setProyecto(proyecto);

        tareaRepository.save(tarea);
    }

    private int calcularAvancePorEstado(String estado) {
        if (estado == null) {
            return 0;
        }

        return switch (estado.toUpperCase()) {
            case "COMPLETADA" -> 100;
            case "EN_PROGRESO" -> 50;
            default -> 0;
        };
    }
}