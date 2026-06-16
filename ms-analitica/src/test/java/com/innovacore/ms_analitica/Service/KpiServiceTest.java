package com.innovacore.ms_analitica.Service;

import com.innovacore.ms_analitica.DTO.*;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("KpiService - Tests de cálculo de KPIs")
class KpiServiceTest {

    @Mock
    private WebClient proyectosWebClient;

    @Mock
    private WebClient recursosWebClient;

    @Mock
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @Mock
    private CircuitBreaker circuitBreaker;

    private KpiService kpiService;

    private ProyectoDTO proyectoEnCurso;
    private ProyectoDTO proyectoFinalizado;
    private ProyectoDTO proyectoAtrasado;
    private EmpleadoDTO empleadoDisponible;
    private EmpleadoDTO empleadoOcupado;
    private TareaDTO tareaCompletada;
    private TareaDTO tareaPendiente;

    @BeforeEach
    void setUp() {
        when(circuitBreakerRegistry.circuitBreaker(anyString())).thenReturn(circuitBreaker);

        kpiService = spy(new KpiService(proyectosWebClient, recursosWebClient, circuitBreakerRegistry));

        proyectoEnCurso = new ProyectoDTO();
        proyectoEnCurso.setEstadoProyecto("EN_CURSO");
        proyectoEnCurso.setPorcentajeAvance(50);
        proyectoEnCurso.setFechaFin(LocalDate.now().plusDays(10));

        proyectoFinalizado = new ProyectoDTO();
        proyectoFinalizado.setEstadoProyecto("FINALIZADO");
        proyectoFinalizado.setPorcentajeAvance(100);
        proyectoFinalizado.setFechaFin(LocalDate.now().minusDays(5));

        proyectoAtrasado = new ProyectoDTO();
        proyectoAtrasado.setEstadoProyecto("ATRASADO");
        proyectoAtrasado.setPorcentajeAvance(30);
        proyectoAtrasado.setFechaFin(LocalDate.now().minusDays(3));

        empleadoDisponible = new EmpleadoDTO();
        empleadoDisponible.setDisponibilidad("DISPONIBLE");

        empleadoOcupado = new EmpleadoDTO();
        empleadoOcupado.setDisponibilidad("OCUPADO");

        tareaCompletada = new TareaDTO();
        tareaCompletada.setEstadoTarea("COMPLETADA");

        tareaPendiente = new TareaDTO();
        tareaPendiente.setEstadoTarea("PENDIENTE");
    }

    // ============================================================
    // TESTS DE PROYECTOS ACTIVOS
    // ============================================================

    @Test
    @DisplayName("KPI proyectos activos cuenta solo los EN_CURSO")
    void getTotalProyectosActivos_debeContarSoloEnCurso() {
        doReturn(List.of(proyectoEnCurso, proyectoFinalizado, proyectoAtrasado))
                .when(kpiService).obtenerProyectos();

        KpiDTO resultado = kpiService.getTotalProyectosActivos();

        assertThat(resultado.getValor()).isEqualTo(1.0);
        assertThat(resultado.getNombre()).isEqualTo("Proyectos Activos");
    }

    @Test
    @DisplayName("KPI proyectos activos retorna 0 si no hay proyectos EN_CURSO")
    void getTotalProyectosActivos_sinProyectosEnCurso_debeRetornarCero() {
        doReturn(List.of(proyectoFinalizado, proyectoAtrasado))
                .when(kpiService).obtenerProyectos();

        KpiDTO resultado = kpiService.getTotalProyectosActivos();

        assertThat(resultado.getValor()).isEqualTo(0.0);
    }

    // ============================================================
    // TESTS DE PROYECTOS ATRASADOS
    // ============================================================

    @Test
    @DisplayName("KPI proyectos atrasados cuenta proyectos con fecha vencida no finalizados")
    void getProyectosAtrasados_debeContarConFechaVencidaNoFinalizados() {
        doReturn(List.of(proyectoEnCurso, proyectoFinalizado, proyectoAtrasado))
                .when(kpiService).obtenerProyectos();

        KpiDTO resultado = kpiService.getProyectosAtrasados();

        assertThat(resultado.getValor()).isEqualTo(1.0);
    }

    @Test
    @DisplayName("KPI proyectos atrasados no cuenta proyectos FINALIZADOS aunque tengan fecha vencida")
    void getProyectosAtrasados_noDebeContarFinalizados() {
        doReturn(List.of(proyectoFinalizado))
                .when(kpiService).obtenerProyectos();

        KpiDTO resultado = kpiService.getProyectosAtrasados();

        assertThat(resultado.getValor()).isEqualTo(0.0);
    }

    // ============================================================
    // TESTS DE AVANCE PROMEDIO
    // ============================================================

    @Test
    @DisplayName("KPI avance promedio calcula correctamente con múltiples proyectos")
    void getPorcentajeAvancePromedio_debeCalcularPromedio() {
        doReturn(List.of(proyectoEnCurso, proyectoFinalizado))
                .when(kpiService).obtenerProyectos();

        KpiDTO resultado = kpiService.getPorcentajeAvancePromedio();

        // (50 + 100) / 2 = 75
        assertThat(resultado.getValor()).isEqualTo(75.0);
    }

    @Test
    @DisplayName("KPI avance promedio retorna 0 si no hay proyectos")
    void getPorcentajeAvancePromedio_sinProyectos_debeRetornarCero() {
        doReturn(List.of()).when(kpiService).obtenerProyectos();

        KpiDTO resultado = kpiService.getPorcentajeAvancePromedio();

        assertThat(resultado.getValor()).isEqualTo(0.0);
    }

    // ============================================================
    // TESTS DE RECURSOS
    // ============================================================

    @Test
    @DisplayName("KPI recursos disponibles cuenta solo empleados DISPONIBLE")
    void getRecursosDisponibles_debeContarSoloDisponibles() {
        doReturn(List.of(empleadoDisponible, empleadoDisponible, empleadoOcupado))
                .when(kpiService).obtenerEmpleados();

        KpiDTO resultado = kpiService.getRecursosDisponibles();

        assertThat(resultado.getValor()).isEqualTo(2.0);
    }

    @Test
    @DisplayName("KPI recursos ocupados cuenta solo empleados OCUPADO")
    void getRecursosOcupados_debeContarSoloOcupados() {
        doReturn(List.of(empleadoDisponible, empleadoOcupado, empleadoOcupado))
                .when(kpiService).obtenerEmpleados();

        KpiDTO resultado = kpiService.getRecursosOcupados();

        assertThat(resultado.getValor()).isEqualTo(2.0);
    }

    @Test
    @DisplayName("KPI utilización recursos calcula porcentaje correctamente")
    void getPorcentajeUtilizacionRecursos_debeCalcularPorcentaje() {
        doReturn(List.of(empleadoDisponible, empleadoDisponible, empleadoDisponible, empleadoOcupado))
                .when(kpiService).obtenerEmpleados();

        KpiDTO resultado = kpiService.getPorcentajeUtilizacionRecursos();

        assertThat(resultado.getValor()).isEqualTo(25.0);
    }

    @Test
    @DisplayName("KPI utilización recursos retorna 0 si no hay empleados")
    void getPorcentajeUtilizacionRecursos_sinEmpleados_debeRetornarCero() {
        doReturn(List.of()).when(kpiService).obtenerEmpleados();

        KpiDTO resultado = kpiService.getPorcentajeUtilizacionRecursos();

        assertThat(resultado.getValor()).isEqualTo(0.0);
    }

    // ============================================================
    // TESTS DE TAREAS
    // ============================================================

    @Test
    @DisplayName("KPI tareas completadas cuenta solo las COMPLETADA")
    void getTareasCompletadas_debeContarSoloCompletadas() {
        doReturn(List.of(tareaCompletada, tareaCompletada, tareaPendiente))
                .when(kpiService).obtenerTareas();

        KpiDTO resultado = kpiService.getTareasCompletadas();

        assertThat(resultado.getValor()).isEqualTo(2.0);
    }

    @Test
    @DisplayName("getAllKpis retorna 7 KPIs")
    void getAllKpis_debeRetornar7Kpis() {
        doReturn(List.of(proyectoEnCurso)).when(kpiService).obtenerProyectos();
        doReturn(List.of(empleadoDisponible)).when(kpiService).obtenerEmpleados();
        doReturn(List.of(tareaCompletada)).when(kpiService).obtenerTareas();

        List<KpiDTO> resultado = kpiService.getAllKpis();

        assertThat(resultado).hasSize(7);
    }
}