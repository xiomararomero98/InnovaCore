package com.innovacore.ms_proyectos.Controller;

import com.innovacore.ms_proyectos.Model.Cliente;
import com.innovacore.ms_proyectos.Repository.ClienteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Clientes", description = "Gestión de clientes")
@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteRepository repository;

    @Operation(summary = "Listar clientes")
    @GetMapping
    public ResponseEntity<List<Cliente>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @Operation(summary = "Obtener cliente por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getById(@PathVariable Long id) {
        return ResponseEntity.ok(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado")));
    }

    @Operation(summary = "Crear cliente")
    @PostMapping
    public ResponseEntity<Cliente> create(@RequestBody Cliente cliente) {
        if (cliente.getFechaRegistro() == null)
            cliente.setFechaRegistro(java.time.LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(cliente));
    }

    @Operation(summary = "Actualizar cliente")
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> update(@PathVariable Long id, @RequestBody Cliente cliente) {
        Cliente db = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        db.setNombreCliente(cliente.getNombreCliente());
        db.setRubro(cliente.getRubro());
        db.setCorreoContacto(cliente.getCorreoContacto());
        db.setTelefono(cliente.getTelefono());
        return ResponseEntity.ok(repository.save(db));
    }

    @Operation(summary = "Eliminar cliente")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}