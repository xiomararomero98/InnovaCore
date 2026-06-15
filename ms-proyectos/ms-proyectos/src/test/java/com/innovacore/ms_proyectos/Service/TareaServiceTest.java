package com.innovacore.ms_proyectos.Service;

import com.innovacore.ms_proyectos.Model.Proyecto;
import com.innovacore.ms_proyectos.Model.Tarea;
import com.innovacore.ms_proyectos.Repository.ProyectoRepository;
import com.innovacore.ms_proyectos.Repository.TareaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TareaService - Tests de avance por estado")
class TareaServiceTest {

    @Mock
    private TareaRepository tareaRepository;

    @Mock
    private ProyectoRepository proyectoRepository;

    @Mock
    private ProyectoService proyectoService;

    @InjectMocks
    private TareaService tareaService;

    private Proyecto proyectoBase;

    @BeforeEach
    void setUp() {
        // proyectoService se inyecta con @Autowired en el campo (no por constructor),
        // por eso @InjectMocks no lo resuelve solo. Lo inyectamos manualmente.
        ReflectionTestUtils.setField(tareaService, "proyectoService", proyectoService);

        proyectoBase = new Proyecto();
        proyectoBase.setId(1L);
        proyectoBase.setNombreProyecto("Proyecto Test");
        proyectoBase.setFechaInicio(LocalDate.now().minusDays(10));
        proyectoBase.setFechaFin(LocalDate.now().plusDays(30));
        proyectoBase.setEstadoProyecto("EN_CURSO");
        proyectoBase.setPorcentajeAvance(0);
        proyectoBase.setIdGestor(1L);
    }

    // ============================================================
    // TESTS DE AVANCE SEGÚN ESTADO DE TAREA
    // ============================================================

    @Test
    @DisplayName("Tarea PENDIENTE debe tener avance 0%")
    void tareaConEstadoPENDIENTE_debeQuedarCon0PorcientoAvance() {
        Tarea tarea = crearTareaBase();
        tarea.setEstadoTarea("PENDIENTE");

        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        Tarea resultado = tareaService.create(tarea);

        assertThat(resultado.getPorcentajeAvance()).isEqualTo(0);
        assertThat(resultado.getEstadoTarea()).isEqualTo("PENDIENTE");
    }

    @Test
    @DisplayName("Tarea EN_PROGRESO debe tener avance 50%")
    void tareaConEstadoEN_PROGRESO_debeQuedarCon50PorcientoAvance() {
        Tarea tarea = crearTareaBase();
        tarea.setEstadoTarea("EN_PROGRESO");

        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        Tarea resultado = tareaService.create(tarea);

        assertThat(resultado.getPorcentajeAvance()).isEqualTo(50);
        assertThat(resultado.getEstadoTarea()).isEqualTo("EN_PROGRESO");
    }

    @Test
    @DisplayName("Tarea COMPLETADA debe tener avance 100%")
    void tareaConEstadoCOMPLETADA_debeQuedarCon100PorcientoAvance() {
        Tarea tarea = crearTareaBase();
        tarea.setEstadoTarea("COMPLETADA");

        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        Tarea resultado = tareaService.create(tarea);

        assertThat(resultado.getPorcentajeAvance()).isEqualTo(100);
        assertThat(resultado.getEstadoTarea()).isEqualTo("COMPLETADA");
    }

    // ============================================================
    // TESTS DE cambiarEstado
    // ============================================================

    @Test
    @DisplayName("cambiarEstado a PENDIENTE → avance queda en 0%")
    void cambiarEstadoAPENDIENTE_debeSetear0PorcientoAvance() {
        Tarea tareaExistente = crearTareaBase();
        tareaExistente.setId(10L);
        tareaExistente.setEstadoTarea("EN_PROGRESO");
        tareaExistente.setPorcentajeAvance(50);

        when(tareaRepository.findById(10L)).thenReturn(Optional.of(tareaExistente));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        Tarea resultado = tareaService.cambiarEstado(10L, "PENDIENTE");

        assertThat(resultado.getEstadoTarea()).isEqualTo("PENDIENTE");
        assertThat(resultado.getPorcentajeAvance()).isEqualTo(0);
    }

    @Test
    @DisplayName("cambiarEstado a EN_PROGRESO → avance queda en 50%")
    void cambiarEstadoAEN_PROGRESO_debeSetear50PorcientoAvance() {
        Tarea tareaExistente = crearTareaBase();
        tareaExistente.setId(10L);
        tareaExistente.setEstadoTarea("PENDIENTE");
        tareaExistente.setPorcentajeAvance(0);

        when(tareaRepository.findById(10L)).thenReturn(Optional.of(tareaExistente));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        Tarea resultado = tareaService.cambiarEstado(10L, "EN_PROGRESO");

        assertThat(resultado.getEstadoTarea()).isEqualTo("EN_PROGRESO");
        assertThat(resultado.getPorcentajeAvance()).isEqualTo(50);
    }

    @Test
    @DisplayName("cambiarEstado a COMPLETADA → avance queda en 100%")
    void cambiarEstadoACOMPLETADA_debeSetear100PorcientoAvance() {
        Tarea tareaExistente = crearTareaBase();
        tareaExistente.setId(10L);
        tareaExistente.setEstadoTarea("EN_PROGRESO");
        tareaExistente.setPorcentajeAvance(50);

        when(tareaRepository.findById(10L)).thenReturn(Optional.of(tareaExistente));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        Tarea resultado = tareaService.cambiarEstado(10L, "COMPLETADA");

        assertThat(resultado.getEstadoTarea()).isEqualTo("COMPLETADA");
        assertThat(resultado.getPorcentajeAvance()).isEqualTo(100);
    }

    @Test
    @DisplayName("Al cambiar estado, se recalcula el proyecto")
    void alCambiarEstado_debeInvocarRecalculoDelProyecto() {
        Tarea tareaExistente = crearTareaBase();
        tareaExistente.setId(10L);
        tareaExistente.setEstadoTarea("PENDIENTE");
        tareaExistente.setPorcentajeAvance(0);

        when(tareaRepository.findById(10L)).thenReturn(Optional.of(tareaExistente));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        tareaService.cambiarEstado(10L, "COMPLETADA");

        verify(proyectoService, times(1)).recalcularAvanceYEstado(1L);
    }

    @Test
    @DisplayName("Al crear una tarea, se recalcula el proyecto asociado")
    void alCrearTarea_debeRecalcularElProyecto() {
        Tarea tarea = crearTareaBase();
        tarea.setEstadoTarea("PENDIENTE");

        when(proyectoRepository.findById(1L)).thenReturn(Optional.of(proyectoBase));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        tareaService.create(tarea);

        verify(proyectoService, times(1)).recalcularAvanceYEstado(1L);
    }

    // ============================================================
    // HELPER
    // ============================================================

    private Tarea crearTareaBase() {
        Tarea tarea = new Tarea();
        tarea.setNombreTarea("Tarea de prueba");
        tarea.setDescripcion("Descripción");
        tarea.setFechaInicio(LocalDate.now());
        tarea.setFechaLimite(LocalDate.now().plusDays(7));
        tarea.setIdResponsable(1L);
        tarea.setFechaCreacion(LocalDateTime.now());
        tarea.setProyecto(proyectoBase);
        return tarea;
    }
}