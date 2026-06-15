package com.innovacore.ms_seguridad.Config;

import com.innovacore.ms_seguridad.Model.Rol;
import com.innovacore.ms_seguridad.Model.Usuario;
import com.innovacore.ms_seguridad.Repository.RolRepository;
import com.innovacore.ms_seguridad.Repository.UsuarioRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LoadDatabase {

    @Bean
    CommandLineRunner initDatabase(
            RolRepository rolRepository,
            UsuarioRepository usuarioRepository) {

        return args -> {
            crearRolSiNoExiste(
                    rolRepository,
                    "ADMINISTRADOR",
                    "Acceso completo al sistema, gestión de usuarios, proyectos y recursos"
            );

            crearRolSiNoExiste(
                    rolRepository,
                    "GESTOR_PROYECTOS",
                    "Gestiona proyectos, tareas, clientes y asignación de recursos"
            );

            crearRolSiNoExiste(
                    rolRepository,
                    "COLABORADOR",
                    "Empleado que visualiza y actualiza sus tareas asignadas"
            );

            crearRolSiNoExiste(
                    rolRepository,
                    "DIRECTIVO",
                    "Visualiza reportes, indicadores y estado general de la organización"
            );

            Rol rolAdmin = obtenerRol(rolRepository, "ADMINISTRADOR");
            Rol rolGestor = obtenerRol(rolRepository, "GESTOR_PROYECTOS");
            Rol rolEmpleado = obtenerRol(rolRepository, "COLABORADOR");
            Rol rolDirectivo = obtenerRol(rolRepository, "DIRECTIVO");

            crearUsuarioSiNoExiste(
                    usuarioRepository,
                    "Admin",
                    "Sistema",
                    "admin@innovacore.cl",
                    "Admin1234!",
                    rolAdmin
            );

            crearUsuarioSiNoExiste(
                    usuarioRepository,
                    "Gabriela",
                    "Muñoz",
                    "gestor@innovacore.cl",
                    "Gestor1234!",
                    rolGestor
            );

            crearUsuarioSiNoExiste(
                    usuarioRepository,
                    "Carlos",
                    "Pérez",
                    "empleado@innovacore.cl",
                    "Empleado1234!",
                    rolEmpleado
            );

            crearUsuarioSiNoExiste(
                    usuarioRepository,
                    "Marcela",
                    "Rojas",
                    "directivo@innovacore.cl",
                    "Directivo1234!",
                    rolDirectivo
            );

            System.out.println("✅ Roles y usuarios demo cargados correctamente");
            System.out.println("🔐 Admin: admin@innovacore.cl / Admin1234!");
            System.out.println("🔐 Gestor: gestor@innovacore.cl / Gestor1234!");
            System.out.println("🔐 Empleado: empleado@innovacore.cl / Empleado1234!");
            System.out.println("🔐 Directivo: directivo@innovacore.cl / Directivo1234!");
        };
    }

    private void crearRolSiNoExiste(
            RolRepository rolRepository,
            String nombreRol,
            String descripcion) {

        boolean existe = rolRepository.findByNombreRolIgnoreCase(nombreRol).isPresent();

        if (!existe) {
            Rol rol = new Rol();
            rol.setNombreRol(nombreRol);
            rol.setDescripcion(descripcion);
            rolRepository.save(rol);
        }
    }

    private Rol obtenerRol(RolRepository rolRepository, String nombreRol) {
        return rolRepository.findByNombreRolIgnoreCase(nombreRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + nombreRol));
    }

    private void crearUsuarioSiNoExiste(
            UsuarioRepository usuarioRepository,
            String nombre,
            String apellido,
            String correo,
            String contrasena,
            Rol rol) {

        if (!usuarioRepository.existsByCorreo(correo)) {
            Usuario usuario = new Usuario();
            usuario.setNombre(nombre);
            usuario.setApellido(apellido);
            usuario.setCorreo(correo);
            usuario.setContrasena(BCrypt.hashpw(contrasena, BCrypt.gensalt()));
            usuario.setEstado(1);
            usuario.setRol(rol);

            usuarioRepository.save(usuario);
        }
    }
}