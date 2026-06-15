package com.innovacore.ms_recursos.Service;

import com.innovacore.ms_recursos.DTO.AsignacionMultipleRequest;
import com.innovacore.ms_recursos.Event.AsignacionEventPublisher;
import com.innovacore.ms_recursos.Model.Asignacion;
import com.innovacore.ms_recursos.Model.Empleado;
import com.innovacore.ms_recursos.Repository.AsignacionRepository;
import com.innovacore.ms_recursos.Repository.EmpleadoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AsignacionService - Tests de asignación múltiple y disponibilidad")
class AsignacionServiceTest {

    @Mock
    private AsignacionRepository repository;

    @Mock
    private EmpleadoRepository empleadoRepository;

    @Mock
    private AsignacionEventPublisher eventPublisher;

    @InjectMocks
    private AsignacionService asignacionService;

    private Empleado empleado1;
    private Empleado empleado2;

    @BeforeEach
    void setUp() {
        empleado1 = new Empleado();
        empleado1.setId(1L);
        empleado1.setNombre("Ana");
        empleado1.setApellido("García");
        empleado1.setCorreo("ana@innovacore.cl");
        empleado1.setCargo("Desarrolladora");
        empleado1.setEspecialidad("Backend");
        empleado1.setDisponibilidad("DISPONIBLE");
        empleado1.setEstado(1);
        empleado1.setFechaRegistro(LocalDateTime.now());

        empleado2 = new Empleado();
        empleado2.setId(2L);
        empleado2.setNombre("Luis");
        empleado2.setApellido("Pérez");
        empleado2.setCorreo("luis@innovacore.cl");
        empleado2.setCargo("Analista");
        empleado2.setEspecialidad("Frontend");
        empleado2.setDisponibilidad("DISPONIBLE");
        empleado2.setEstado(1);
        empleado2.setFechaRegistro(LocalDateTime.now());
    }

    // ============================================================
    // TESTS DE ASIGNACIÓN MÚLTIPLE
    // ============================================================

    @Test
    @DisplayName("Asignación múltiple con 2 empleados crea 2 asignaciones individuales")
    void asignacionMultiple_con2Empleados_debeCrear2Asignaciones() {
        // Arrange
        AsignacionMultipleRequest request = new AsignacionMultipleRequest(
                List.of(1L, 2L), 20, "DESARROLLADOR"
        );

        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        when(empleadoRepository.findById(2L)).thenReturn(Optional.of(empleado2));
        when(repository.existsByEmpleadoIdAndIdProyectoAndIdTareaIsNullAndEstado(anyLong(), anyLong(), anyString()))
                .thenReturn(false);
        when(repository.save(any(Asignacion.class))).thenAnswer(inv -> {
            Asignacion a = inv.getArgument(0);
            a.setId((long) (Math.random() * 1000));
            return a;
        });
        when(repository.findByEmpleadoIdAndEstado(anyLong(), anyString())).thenReturn(List.of());
        doNothing().when(eventPublisher).publicarAsignacionCreada(any());

        // Act
        List<Asignacion> resultado = asignacionService.asignarMultiplesEmpleadosAProyecto(10L, request);

        // Assert
        assertThat(resultado).hasSize(2);
        verify(repository, times(2)).save(any(Asignacion.class));
    }

    @Test
    @DisplayName("Asignación múltiple asigna correctamente el proyecto a cada asignación")
    void asignacionMultiple_debeAsignarElMismoProyectoATodas() {
        // Arrange
        AsignacionMultipleRequest request = new AsignacionMultipleRequest(
                List.of(1L, 2L), 15, "ANALISTA"
        );
        Long idProyecto = 99L;

        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        when(empleadoRepository.findById(2L)).thenReturn(Optional.of(empleado2));
        when(repository.existsByEmpleadoIdAndIdProyectoAndIdTareaIsNullAndEstado(anyLong(), anyLong(), anyString()))
                .thenReturn(false);
        when(repository.save(any(Asignacion.class))).thenAnswer(inv -> inv.getArgument(0));
        when(repository.findByEmpleadoIdAndEstado(anyLong(), anyString())).thenReturn(List.of());
        doNothing().when(eventPublisher).publicarAsignacionCreada(any());

        // Act
        List<Asignacion> resultado = asignacionService.asignarMultiplesEmpleadosAProyecto(idProyecto, request);

        // Assert
        assertThat(resultado).allMatch(a -> a.getIdProyecto().equals(idProyecto));
        assertThat(resultado).allMatch(a -> a.getRolEnProyecto().equals("ANALISTA"));
        assertThat(resultado).allMatch(a -> a.getEstado().equals("ACTIVA"));
    }

    @Test
    @DisplayName("Asignación múltiple elimina empleados duplicados en la lista")
    void asignacionMultiple_conEmpleadoDuplicadoEnLista_debeCrearSoloUnaAsignacion() {
        // Arrange: mismo id dos veces en la lista
        AsignacionMultipleRequest request = new AsignacionMultipleRequest(
                List.of(1L, 1L), 10, "DESARROLLADOR"
        );

        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        when(repository.existsByEmpleadoIdAndIdProyectoAndIdTareaIsNullAndEstado(anyLong(), anyLong(), anyString()))
                .thenReturn(false);
        when(repository.save(any(Asignacion.class))).thenAnswer(inv -> inv.getArgument(0));
        when(repository.findByEmpleadoIdAndEstado(anyLong(), anyString())).thenReturn(List.of());
        doNothing().when(eventPublisher).publicarAsignacionCreada(any());

        // Act
        List<Asignacion> resultado = asignacionService.asignarMultiplesEmpleadosAProyecto(10L, request);

        // Assert: distinct() en el service garantiza solo 1
        assertThat(resultado).hasSize(1);
        verify(repository, times(1)).save(any(Asignacion.class));
    }

    // ============================================================
    // TESTS DE DUPLICADOS ACTIVOS
    // ============================================================

    @Test
    @DisplayName("No permite asignación duplicada activa en el mismo proyecto")
    void asignacionMultiple_conDuplicadoActivo_debeLanzarExcepcion() {
        // Arrange
        AsignacionMultipleRequest request = new AsignacionMultipleRequest(
                List.of(1L), 10, "DESARROLLADOR"
        );

        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        // Simular que ya existe una asignación activa
        when(repository.existsByEmpleadoIdAndIdProyectoAndIdTareaIsNullAndEstado(1L, 10L, "ACTIVA"))
                .thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() ->
                asignacionService.asignarMultiplesEmpleadosAProyecto(10L, request)
        )
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("ya tiene una asignación activa");
    }

    @Test
    @DisplayName("No permite asignación duplicada activa en la misma tarea")
    void asignacionMultipleATarea_conDuplicadoActivo_debeLanzarExcepcion() {
        // Arrange
        AsignacionMultipleRequest request = new AsignacionMultipleRequest(
                List.of(1L), 10, "DESARROLLADOR"
        );

        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        when(repository.existsByEmpleadoIdAndIdProyectoAndIdTareaAndEstado(1L, 10L, 5L, "ACTIVA"))
                .thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() ->
                asignacionService.asignarMultiplesEmpleadosATarea(10L, 5L, request)
        )
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("ya tiene una asignación activa");
    }

    // ============================================================
    // TESTS DE DISPONIBILIDAD
    // ============================================================

    @Test
    @DisplayName("Empleado con menos de 40 horas activas queda DISPONIBLE")
    void empleadoConMenosDe40HorasActivas_debeQuedarDISPONIBLE() {
        // Arrange: asignaciones que suman 39 horas
        Asignacion a1 = crearAsignacion(empleado1, 20, "ACTIVA");
        Asignacion a2 = crearAsignacion(empleado1, 19, "ACTIVA");

        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        when(repository.findByEmpleadoIdAndEstado(1L, "ACTIVA")).thenReturn(List.of(a1, a2));
        when(empleadoRepository.save(any(Empleado.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Empleado resultado = asignacionService.recalcularDisponibilidadEmpleado(1L);

        // Assert
        assertThat(resultado.getDisponibilidad()).isEqualTo("DISPONIBLE");
    }

    @Test
    @DisplayName("Empleado con exactamente 40 horas activas queda OCUPADO")
    void empleadoConExactamente40HorasActivas_debeQuedarOCUPADO() {
        // Arrange: exactamente 40 horas
        Asignacion a1 = crearAsignacion(empleado1, 20, "ACTIVA");
        Asignacion a2 = crearAsignacion(empleado1, 20, "ACTIVA");

        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        when(repository.findByEmpleadoIdAndEstado(1L, "ACTIVA")).thenReturn(List.of(a1, a2));
        when(empleadoRepository.save(any(Empleado.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Empleado resultado = asignacionService.recalcularDisponibilidadEmpleado(1L);

        // Assert
        assertThat(resultado.getDisponibilidad()).isEqualTo("OCUPADO");
    }

    @Test
    @DisplayName("Empleado con más de 40 horas activas queda OCUPADO")
    void empleadoConMasDe40HorasActivas_debeQuedarOCUPADO() {
        // Arrange: 50 horas
        Asignacion a1 = crearAsignacion(empleado1, 30, "ACTIVA");
        Asignacion a2 = crearAsignacion(empleado1, 20, "ACTIVA");

        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        when(repository.findByEmpleadoIdAndEstado(1L, "ACTIVA")).thenReturn(List.of(a1, a2));
        when(empleadoRepository.save(any(Empleado.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Empleado resultado = asignacionService.recalcularDisponibilidadEmpleado(1L);

        // Assert
        assertThat(resultado.getDisponibilidad()).isEqualTo("OCUPADO");
    }

    @Test
    @DisplayName("Empleado sin asignaciones activas queda DISPONIBLE")
    void empleadoSinAsignacionesActivas_debeQuedarDISPONIBLE() {
        // Arrange: sin asignaciones activas
        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        when(repository.findByEmpleadoIdAndEstado(1L, "ACTIVA")).thenReturn(List.of());
        when(empleadoRepository.save(any(Empleado.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Empleado resultado = asignacionService.recalcularDisponibilidadEmpleado(1L);

        // Assert
        assertThat(resultado.getDisponibilidad()).isEqualTo("DISPONIBLE");
    }

    @Test
    @DisplayName("Al finalizar asignación, se recalcula disponibilidad del empleado")
    void alFinalizarAsignacion_debeRecalcularDisponibilidad() {
        // Arrange: empleado con 40h activas, al finalizar baja a 20h → DISPONIBLE
        Asignacion asignacionAFinalizar = crearAsignacion(empleado1, 20, "ACTIVA");
        asignacionAFinalizar.setId(5L);

        Asignacion otraAsignacion = crearAsignacion(empleado1, 20, "ACTIVA");

        when(repository.findById(5L)).thenReturn(Optional.of(asignacionAFinalizar));
        when(repository.save(any(Asignacion.class))).thenAnswer(inv -> inv.getArgument(0));
        when(empleadoRepository.findById(1L)).thenReturn(Optional.of(empleado1));
        // Después de finalizar quedan solo 20 horas activas
        when(repository.findByEmpleadoIdAndEstado(1L, "ACTIVA")).thenReturn(List.of(otraAsignacion));
        when(empleadoRepository.save(any(Empleado.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        asignacionService.finalizar(5L);

        // Assert: se guardó el empleado con disponibilidad recalculada
        ArgumentCaptor<Empleado> captor = ArgumentCaptor.forClass(Empleado.class);
        verify(empleadoRepository).save(captor.capture());
        assertThat(captor.getValue().getDisponibilidad()).isEqualTo("DISPONIBLE");
    }

    // ============================================================
    // HELPER
    // ============================================================

    private Asignacion crearAsignacion(Empleado empleado, int horas, String estado) {
        Asignacion a = new Asignacion();
        a.setEmpleado(empleado);
        a.setIdProyecto(10L);
        a.setHorasAsignadas(horas);
        a.setRolEnProyecto("DESARROLLADOR");
        a.setFechaAsignacion(LocalDateTime.now());
        a.setEstado(estado);
        return a;
    }
}