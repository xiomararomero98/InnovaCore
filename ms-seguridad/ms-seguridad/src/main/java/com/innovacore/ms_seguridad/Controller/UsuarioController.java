package com.innovacore.ms_seguridad.Controller;

import com.innovacore.ms_seguridad.Model.Usuario;
import com.innovacore.ms_seguridad.Service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Usuarios", description = "Microservicio de Seguridad y Usuarios. Puerto: 8081")
@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService service;

    // ================================
    // LISTAR TODOS
    // ================================
    @Operation(summary = "Listar usuarios", description = "Obtiene todos los usuarios del sistema.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    @GetMapping
    public ResponseEntity<List<Usuario>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // ================================
    // BUSCAR POR ID
    // ================================
    @Operation(summary = "Obtener usuario por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // ================================
    // BUSCAR POR CORREO
    // ================================
    @Operation(summary = "Obtener usuario por correo")
    @GetMapping("/correo")
    public ResponseEntity<Usuario> getByCorreo(@RequestParam String correo) {
        return ResponseEntity.ok(service.getByCorreo(correo));
    }

    // ================================
    // BUSCAR POR EMPLEADO
    // ================================
    @Operation(summary = "Obtener usuario asociado a un empleado")
    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<Usuario> getByEmpleado(@PathVariable Long idEmpleado) {
        return ResponseEntity.ok(service.getByEmpleado(idEmpleado));
    }

    // ================================
    // CREAR USUARIO
    // ================================
    @Operation(summary = "Crear usuario", description = "Registra un nuevo usuario en el sistema.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "409", description = "Usuario ya existe")
    })
    @PostMapping
    public ResponseEntity<Usuario> create(@RequestBody Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(usuario));
    }

    // ================================
    // ACTUALIZAR USUARIO
    // ================================
    @Operation(summary = "Actualizar usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario actualizado correctamente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> update(@PathVariable Long id, @RequestBody Usuario usuario) {
        return ResponseEntity.ok(service.update(id, usuario));
    }

    // ================================
    // LOGIN
    // ================================
    @Operation(summary = "Login", description = "Autentica un usuario por correo y contraseña.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login exitoso"),
            @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            Usuario usuario = service.login(body.get("correo"), body.get("contrasena"));
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ================================
    // CAMBIAR ROL
    // ================================
    @Operation(summary = "Cambiar rol de usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rol actualizado correctamente"),
            @ApiResponse(responseCode = "404", description = "Usuario o rol no encontrado")
    })
    @PutMapping("/{idUsuario}/rol/{idRol}")
    public ResponseEntity<Usuario> cambiarRol(
            @PathVariable Long idUsuario,
            @PathVariable Long idRol) {
        return ResponseEntity.ok(service.cambiarRol(idUsuario, idRol));
    }

    // ================================
    // RESETEAR CONTRASEÑA
    // ================================
    @Operation(summary = "Resetear contraseña temporal")
    @PatchMapping("/{idUsuario}/reset-password")
    public ResponseEntity<Usuario> resetearContrasena(
            @PathVariable Long idUsuario,
            @RequestBody Map<String, String> body) {

        String nuevaContrasena = body.get("nuevaContrasena");
        return ResponseEntity.ok(service.resetearContrasena(idUsuario, nuevaContrasena));
    }

    // ================================
    // DESACTIVAR USUARIO
    // ================================
    @Operation(summary = "Desactivar usuario", description = "Desactiva un usuario (estado = 0).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario desactivado correctamente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @PutMapping("/{id}/desactivar")
    public ResponseEntity<Usuario> desactivar(@PathVariable Long id) {
        return ResponseEntity.ok(service.desactivar(id));
    }

    // ================================
    // ACTIVAR USUARIO
    // ================================
    @Operation(summary = "Activar usuario", description = "Activa un usuario (estado = 1).")
    @PutMapping("/{id}/activar")
    public ResponseEntity<Usuario> activar(@PathVariable Long id) {
        return ResponseEntity.ok(service.activar(id));
    }

    // ================================
    // ELIMINAR USUARIO
    // ================================
    @Operation(summary = "Eliminar usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Usuario eliminado correctamente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}