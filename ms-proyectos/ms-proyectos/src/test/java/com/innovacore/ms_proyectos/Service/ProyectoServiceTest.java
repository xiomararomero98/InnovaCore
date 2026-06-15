package com.innovacore.ms_proyectos.Service;

import com.innovacore.ms_proyectos.Event.ProyectoEventPublisher;
import com.innovacore.ms_proyectos.Model.Cliente;
import com.innovacore.ms_proyectos.Model.Proyecto;
import com.innovacore.ms_proyectos.Model.Tarea;
import com.innovacore.ms_proyectos.Repository.ClienteRepository;
import com.innovacore.ms_proyectos.Repository.ProyectoRepository;
import com.innovacore.ms_proyectos.Repository.TareaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProyectoService - Tests de recálculo de avance y estado")
class ProyectoServiceTest {

    @Mock
    private ProyectoRepository proyectoRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private TareaRepository tareaRepository;

    @Mock
    private ProyectoEventPublisher eventPublisher;

    @InjectMocks
    private ProyectoService proyectoService;

    private Proyecto proyectoBase;

    @BeforeEach
    void setUp() {
        proyectoBase = new Proyecto();
        proyectoBase.setId(1L);
        proyectoBase.setNombreProyecto("Proyecto Test");
        proyectoBase.setDescripcion("Descripcion test");
        proyectoBase.setFechaInicio(LocalDate.now().minusDays(10));
        proyectoBase.setFechaFin(LocalDate.now().plusDays(30)); // fecha futura por defecto
        proyectoBase.setEstadoProyecto("PLANIFICADO");
        proyectoBase.setPorcentajeAvance(0);
        proyectoBase.setIdGestor(1L);
        proyectoBase.setPrioridad("MEDIA");
    }

    // ============================================================
    // TESTS DE AVANCE PROMEDIO
    // ============================================================

    @Test
    @DisplayName("Sin tareas, el avance del proyecto debe ser 0%")
    void sinTareas_avanceProyectoDebeSerCero() {
        // Arrange
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of());
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getPorcentajeAvance()).isEqualTo(0);
    }

    @Test
    @DisplayName("1 tarea COMPLETADA (100%) → avance del proyecto = 100%")
    void unaTareaCompletada_avanceProyectoDebeSer100() {
        // Arrange
        Tarea t1 = crearTarea("COMPLETADA", 100);
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of(t1));
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getPorcentajeAvance()).isEqualTo(100);
    }

    @Test
    @DisplayName("1 tarea EN_PROGRESO (50%) y 1 PENDIENTE (0%) → avance = 25%")
    void unaTareaEnProgresoYUnaPendiente_avanceDebeSer25() {
        // Arrange
        Tarea t1 = crearTarea("EN_PROGRESO", 50);
        Tarea t2 = crearTarea("PENDIENTE", 0);
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of(t1, t2));
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getPorcentajeAvance()).isEqualTo(25);
    }

    @Test
    @DisplayName("2 tareas COMPLETADAS y 2 EN_PROGRESO → avance = 75%")
    void dosTareasCompletadasYDosEnProgreso_avanceDebeSer75() {
        // Arrange: (100 + 100 + 50 + 50) / 4 = 75
        Tarea t1 = crearTarea("COMPLETADA", 100);
        Tarea t2 = crearTarea("COMPLETADA", 100);
        Tarea t3 = crearTarea("EN_PROGRESO", 50);
        Tarea t4 = crearTarea("EN_PROGRESO", 50);
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of(t1, t2, t3, t4));
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getPorcentajeAvance()).isEqualTo(75);
    }

    // ============================================================
    // TESTS DE ESTADO AUTOMÁTICO
    // ============================================================

    @Test
    @DisplayName("Todas las tareas COMPLETADAS → estado debe ser FINALIZADO")
    void todasLasTareasCompletadas_estadoDebeSerFINALIZADO() {
        // Arrange
        Tarea t1 = crearTarea("COMPLETADA", 100);
        Tarea t2 = crearTarea("COMPLETADA", 100);
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of(t1, t2));
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getEstadoProyecto()).isEqualTo("FINALIZADO");
    }

    @Test
    @DisplayName("Fecha fin vencida con tareas pendientes → estado debe ser ATRASADO")
    void fechaFinVencidaConTareasPendientes_estadoDebeSerATRASADO() {
        // Arrange: proyecto con fecha vencida
        proyectoBase.setFechaFin(LocalDate.now().minusDays(1));

        Tarea t1 = crearTarea("PENDIENTE", 0);
        Tarea t2 = crearTarea("EN_PROGRESO", 50);
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of(t1, t2));
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getEstadoProyecto()).isEqualTo("ATRASADO");
    }

    @Test
    @DisplayName("Fecha fin vencida pero todas completadas → estado debe ser FINALIZADO (no ATRASADO)")
    void fechaFinVencidaConTodasCompletadas_estadoDebeSerFINALIZADO() {
        // Arrange: fecha vencida pero todo terminado
        proyectoBase.setFechaFin(LocalDate.now().minusDays(1));

        Tarea t1 = crearTarea("COMPLETADA", 100);
        Tarea t2 = crearTarea("COMPLETADA", 100);
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of(t1, t2));
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert: FINALIZADO tiene prioridad sobre ATRASADO
        assertThat(resultado.getEstadoProyecto()).isEqualTo("FINALIZADO");
    }

    @Test
    @DisplayName("Al menos una tarea EN_PROGRESO con fecha futura → estado debe ser EN_CURSO")
    void unaTareaEnProgresoConFechaFutura_estadoDebeSerEN_CURSO() {
        // Arrange
        Tarea t1 = crearTarea("EN_PROGRESO", 50);
        Tarea t2 = crearTarea("PENDIENTE", 0);
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of(t1, t2));
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getEstadoProyecto()).isEqualTo("EN_CURSO");
    }

    @Test
    @DisplayName("Todas las tareas PENDIENTES con fecha futura → estado debe ser PLANIFICADO")
    void todasLasTareasPendientesFechaFutura_estadoDebeSerPLANIFICADO() {
        // Arrange
        Tarea t1 = crearTarea("PENDIENTE", 0);
        Tarea t2 = crearTarea("PENDIENTE", 0);
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of(t1, t2));
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getEstadoProyecto()).isEqualTo("PLANIFICADO");
    }

    @Test
    @DisplayName("Sin tareas y fecha futura → estado debe ser PLANIFICADO")
    void sinTareasConFechaFutura_estadoDebeSerPLANIFICADO() {
        // Arrange
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of());
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getEstadoProyecto()).isEqualTo("PLANIFICADO");
    }

    @Test
    @DisplayName("Sin tareas y fecha vencida → estado debe ser ATRASADO")
    void sinTareasConFechaVencida_estadoDebeSerATRASADO() {
        // Arrange
        proyectoBase.setFechaFin(LocalDate.now().minusDays(5));
        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.findByProyectoId(1L)).thenReturn(List.of());
        when(proyectoRepository.save(any(Proyecto.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Proyecto resultado = proyectoService.recalcularAvanceYEstado(1L);

        // Assert
        assertThat(resultado.getEstadoProyecto()).isEqualTo("ATRASADO");
    }

    // ============================================================
    // HELPER
    // ============================================================

    private Tarea crearTarea(String estado, int avance) {
        Tarea tarea = new Tarea();
        tarea.setNombreTarea("Tarea " + estado);
        tarea.setFechaInicio(LocalDate.now().minusDays(5));
        tarea.setFechaLimite(LocalDate.now().plusDays(5));
        tarea.setEstadoTarea(estado);
        tarea.setPorcentajeAvance(avance);
        tarea.setIdResponsable(1L);
        tarea.setFechaCreacion(LocalDateTime.now());
        tarea.setProyecto(proyectoBase);
        return tarea;
    }
}