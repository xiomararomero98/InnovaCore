package com.innovacore.ms_seguridad.Service;

import com.innovacore.ms_seguridad.Model.Rol;
import com.innovacore.ms_seguridad.Model.Usuario;
import com.innovacore.ms_seguridad.Repository.RolRepository;
import com.innovacore.ms_seguridad.Repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository repository;
    private final RolRepository rolRepository;

    public UsuarioService(UsuarioRepository repository, RolRepository rolRepository) {
        this.repository = repository;
        this.rolRepository = rolRepository;
    }

    // ==========================================================
    // LISTAR TODOS
    // ==========================================================
    public List<Usuario> getAll() {
        return repository.findAll();
    }

    // ==========================================================
    // BUSCAR POR ID
    // ==========================================================
    public Usuario getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================
    private void validarDatosBase(Usuario usuario) {
        if (usuario.getNombre() == null || usuario.getNombre().isBlank())
            throw new RuntimeException("El nombre es obligatorio");
        if (usuario.getApellido() == null || usuario.getApellido().isBlank())
            throw new RuntimeException("El apellido es obligatorio");
        if (usuario.getCorreo() == null || usuario.getCorreo().isBlank())
            throw new RuntimeException("El correo es obligatorio");
        if (!usuario.getCorreo().contains("@"))
            throw new RuntimeException("El correo no es válido");
    }

    private void validarCreate(Usuario usuario) {
        validarDatosBase(usuario);
        if (usuario.getContrasena() == null || usuario.getContrasena().isBlank())
            throw new RuntimeException("La contraseña es obligatoria");
        if (usuario.getContrasena().length() < 6)
            throw new RuntimeException("La contraseña debe tener al menos 6 caracteres");
    }

    // ==========================================================
    // CREAR USUARIO
    // ==========================================================
    public Usuario create(Usuario usuario) {
        validarCreate(usuario);

        if (repository.existsByCorreo(usuario.getCorreo()))
            throw new RuntimeException("El correo ya está registrado");

        // Resolver rol
        if (usuario.getRol() != null && usuario.getRol().getId() != null) {
            Rol rol = rolRepository.findById(usuario.getRol().getId())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            usuario.setRol(rol);
        } else {
            Rol rolDefault = rolRepository.findByNombreRolIgnoreCase("COLABORADOR")
                    .orElseThrow(() -> new RuntimeException("Rol COLABORADOR no existe en BD"));
            usuario.setRol(rolDefault);
        }

        // Encriptar contraseña
        String hashed = BCrypt.hashpw(usuario.getContrasena(), BCrypt.gensalt());
        usuario.setContrasena(hashed);
        
        if (usuario.getEstado() == null) {
            usuario.setEstado(1);
        }

        return repository.save(usuario);
    }

    // ==========================================================
    // ACTUALIZAR USUARIO
    // ==========================================================
    public Usuario update(Long id, Usuario usuario) {
        Usuario dbUsuario = getById(id);

        validarDatosBase(usuario);

        if (!dbUsuario.getCorreo().equalsIgnoreCase(usuario.getCorreo())
                && repository.existsByCorreo(usuario.getCorreo()))
            throw new RuntimeException("El correo ya está registrado");

        dbUsuario.setNombre(usuario.getNombre());
        dbUsuario.setApellido(usuario.getApellido());
        dbUsuario.setCorreo(usuario.getCorreo());

        if (usuario.getContrasena() != null && !usuario.getContrasena().isBlank()) {
            String hashed = BCrypt.hashpw(usuario.getContrasena(), BCrypt.gensalt());
            dbUsuario.setContrasena(hashed);
            if (usuario.getEstado() == null) {
                usuario.setEstado(1);
}
        }

        if (usuario.getRol() != null && usuario.getRol().getId() != null) {
            Rol rol = rolRepository.findById(usuario.getRol().getId())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            dbUsuario.setRol(rol);
        }

        return repository.save(dbUsuario);
    }

    // ==========================================================
    // ELIMINAR USUARIO
    // ==========================================================
    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new RuntimeException("No existe un usuario con id: " + id);
        repository.deleteById(id);
    }

    // ==========================================================
    // LOGIN
    // ==========================================================
    public Usuario login(String correo, String contrasena) {
        Usuario usuario = repository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Correo no registrado"));

        if (!BCrypt.checkpw(contrasena, usuario.getContrasena()))
            throw new RuntimeException("Contraseña incorrecta");

        return usuario;
    }

    // ==========================================================
    // CAMBIAR ROL
    // ==========================================================
    public Usuario cambiarRol(Long idUsuario, Long idRol) {
        Usuario usuario = getById(idUsuario);
        Rol rol = rolRepository.findById(idRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + idRol));
        usuario.setRol(rol);
        return repository.save(usuario);
    }

    // ==========================================================
    // DESACTIVAR USUARIO
    // ==========================================================
    public Usuario desactivar(Long id) {
        Usuario usuario = getById(id);
        usuario.setEstado(0);
        return repository.save(usuario);
    }
}