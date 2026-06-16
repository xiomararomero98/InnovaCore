package com.innovacore.ms_seguridad.Service;

import com.innovacore.ms_seguridad.Model.Rol;
import com.innovacore.ms_seguridad.Model.Usuario;
import com.innovacore.ms_seguridad.Repository.RolRepository;
import com.innovacore.ms_seguridad.Repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mindrot.jbcrypt.BCrypt;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UsuarioService - Tests de login, creación y validaciones")
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private RolRepository rolRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    private Rol rolColaborador;
    private Rol rolAdmin;
    private Usuario usuarioBase;

    @BeforeEach
    void setUp() {
        rolColaborador = new Rol();
        rolColaborador.setId(1L);
        rolColaborador.setNombreRol("COLABORADOR");

        rolAdmin = new Rol();
        rolAdmin.setId(2L);
        rolAdmin.setNombreRol("ADMINISTRADOR");

        usuarioBase = new Usuario();
        usuarioBase.setId(1L);
        usuarioBase.setNombre("Ana");
        usuarioBase.setApellido("García");
        usuarioBase.setCorreo("ana@innovacore.cl");
        usuarioBase.setContrasena(BCrypt.hashpw("password123", BCrypt.gensalt()));
        usuarioBase.setEstado(1);
        usuarioBase.setRol(rolColaborador);
    }

    // ============================================================
    // TESTS DE LOGIN
    // ============================================================

    @Test
    @DisplayName("Login exitoso con credenciales correctas")
    void login_conCredencialesCorrectas_debeRetornarUsuario() {
        when(repository.findByCorreo("ana@innovacore.cl")).thenReturn(Optional.of(usuarioBase));

        Usuario resultado = usuarioService.login("ana@innovacore.cl", "password123");

        assertThat(resultado).isNotNull();
        assertThat(resultado.getCorreo()).isEqualTo("ana@innovacore.cl");
    }

    @Test
    @DisplayName("Login con correo inexistente lanza excepción")
    void login_conCorreoInexistente_debeLanzarExcepcion() {
        when(repository.findByCorreo(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.login("noexiste@innovacore.cl", "password123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Correo no registrado");
    }

    @Test
    @DisplayName("Login con contraseña incorrecta lanza excepción")
    void login_conContrasenaIncorrecta_debeLanzarExcepcion() {
        when(repository.findByCorreo("ana@innovacore.cl")).thenReturn(Optional.of(usuarioBase));

        assertThatThrownBy(() -> usuarioService.login("ana@innovacore.cl", "contrasenaEquivocada"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Contraseña incorrecta");
    }

    @Test
    @DisplayName("Login con usuario desactivado lanza excepción")
    void login_conUsuarioDesactivado_debeLanzarExcepcion() {
        usuarioBase.setEstado(0);
        when(repository.findByCorreo("ana@innovacore.cl")).thenReturn(Optional.of(usuarioBase));

        assertThatThrownBy(() -> usuarioService.login("ana@innovacore.cl", "password123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario desactivado");
    }

    // ============================================================
    // TESTS DE CREACIÓN
    // ============================================================

    @Test
    @DisplayName("Crear usuario con datos válidos lo guarda correctamente")
    void crear_conDatosValidos_debeGuardarUsuario() {
        Usuario nuevo = new Usuario();
        nuevo.setNombre("Luis");
        nuevo.setApellido("Pérez");
        nuevo.setCorreo("luis@innovacore.cl");
        nuevo.setContrasena("mipass123");
        nuevo.setEstado(1);

        when(repository.existsByCorreo("luis@innovacore.cl")).thenReturn(false);
        when(rolRepository.findByNombreRolIgnoreCase("COLABORADOR")).thenReturn(Optional.of(rolColaborador));
        when(repository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = usuarioService.create(nuevo);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getNombre()).isEqualTo("Luis");
        verify(repository).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Crear usuario con correo duplicado lanza excepción")
    void crear_conCorreoDuplicado_debeLanzarExcepcion() {
        Usuario nuevo = new Usuario();
        nuevo.setNombre("Luis");
        nuevo.setApellido("Pérez");
        nuevo.setCorreo("ana@innovacore.cl");
        nuevo.setContrasena("mipass123");

        when(repository.existsByCorreo("ana@innovacore.cl")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.create(nuevo))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("correo ya está registrado");
    }

    @Test
    @DisplayName("Crear usuario sin nombre lanza excepción")
    void crear_sinNombre_debeLanzarExcepcion() {
        Usuario nuevo = new Usuario();
        nuevo.setNombre("");
        nuevo.setApellido("Pérez");
        nuevo.setCorreo("luis@innovacore.cl");
        nuevo.setContrasena("mipass123");

        assertThatThrownBy(() -> usuarioService.create(nuevo))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("nombre es obligatorio");
    }

    @Test
    @DisplayName("Crear usuario con contraseña menor a 6 caracteres lanza excepción")
    void crear_conContrasenaCorta_debeLanzarExcepcion() {
        Usuario nuevo = new Usuario();
        nuevo.setNombre("Luis");
        nuevo.setApellido("Pérez");
        nuevo.setCorreo("luis@innovacore.cl");
        nuevo.setContrasena("123");

        assertThatThrownBy(() -> usuarioService.create(nuevo))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("al menos 6 caracteres");
    }

    @Test
    @DisplayName("Crear usuario con correo inválido lanza excepción")
    void crear_conCorreoInvalido_debeLanzarExcepcion() {
        Usuario nuevo = new Usuario();
        nuevo.setNombre("Luis");
        nuevo.setApellido("Pérez");
        nuevo.setCorreo("correoSinArroba");
        nuevo.setContrasena("mipass123");

        assertThatThrownBy(() -> usuarioService.create(nuevo))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("correo no es válido");
    }

    // ============================================================
    // TESTS DE DESACTIVAR / ACTIVAR
    // ============================================================

    @Test
    @DisplayName("Desactivar usuario cambia estado a 0")
    void desactivar_debePonerEstadoEnCero() {
        when(repository.findById(1L)).thenReturn(Optional.of(usuarioBase));
        when(repository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = usuarioService.desactivar(1L);

        assertThat(resultado.getEstado()).isEqualTo(0);
    }

    @Test
    @DisplayName("Activar usuario cambia estado a 1")
    void activar_debePonerEstadoEnUno() {
        usuarioBase.setEstado(0);
        when(repository.findById(1L)).thenReturn(Optional.of(usuarioBase));
        when(repository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = usuarioService.activar(1L);

        assertThat(resultado.getEstado()).isEqualTo(1);
    }

    // ============================================================
    // TESTS DE RESET CONTRASEÑA
    // ============================================================

    @Test
    @DisplayName("Resetear contraseña con nueva contraseña válida funciona correctamente")
    void resetearContrasena_conContrasenaValida_debeGuardar() {
        when(repository.findById(1L)).thenReturn(Optional.of(usuarioBase));
        when(repository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = usuarioService.resetearContrasena(1L, "nuevaPass123");

        assertThat(resultado).isNotNull();
        verify(repository).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Resetear contraseña con menos de 6 caracteres lanza excepción")
    void resetearContrasena_conContrasenaCorta_debeLanzarExcepcion() {
        assertThatThrownBy(() -> usuarioService.resetearContrasena(1L, "123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("al menos 6 caracteres");
    }
}