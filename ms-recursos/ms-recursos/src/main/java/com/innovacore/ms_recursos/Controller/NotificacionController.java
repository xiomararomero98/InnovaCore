package com.innovacore.ms_recursos.Controller;

import com.innovacore.ms_recursos.Model.Notificacion;
import com.innovacore.ms_recursos.Service.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Notificaciones", description = "Gestión de notificaciones del sistema")
@RestController
@RequestMapping("/notificaciones")
public class NotificacionController {

    private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;
    }

    @Operation(summary = "Listar notificaciones")
    @GetMapping
    public ResponseEntity<List<Notificacion>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Obtener notificación por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Notificacion> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Listar notificaciones por usuario")
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Notificacion>> getByUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(service.getByUsuario(idUsuario));
    }

    @Operation(summary = "Listar notificaciones no leídas por usuario")
    @GetMapping("/usuario/{idUsuario}/no-leidas")
    public ResponseEntity<List<Notificacion>> getNoLeidas(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(service.getNoLeidas(idUsuario));
    }

    @Operation(summary = "Crear notificación")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Notificación creada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<Notificacion> create(@RequestBody Notificacion notificacion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(notificacion));
    }

    @Operation(summary = "Marcar notificación como leída")
    @PutMapping("/{id}/leer")
    public ResponseEntity<Notificacion> marcarComoLeida(@PathVariable Long id) {
        return ResponseEntity.ok(service.marcarComoLeida(id));
    }

    @Operation(summary = "Marcar todas las notificaciones de un usuario como leídas")
    @PutMapping("/usuario/{idUsuario}/leer-todas")
    public ResponseEntity<Void> marcarTodasComoLeidas(@PathVariable Long idUsuario) {
        service.marcarTodasComoLeidas(idUsuario);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar notificación")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}