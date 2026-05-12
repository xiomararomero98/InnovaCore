package com.innovacore.ms_seguridad.Config;

import com.innovacore.ms_seguridad.Model.Rol;
import com.innovacore.ms_seguridad.Repository.RolRepository;
import org.mindrot.jbcrypt.BCrypt;
import com.innovacore.ms_seguridad.Model.Usuario;
import com.innovacore.ms_seguridad.Repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LoadDatabase {

    @Bean
    CommandLineRunner initDatabase(RolRepository rolRepository,
                                   UsuarioRepository usuarioRepository) {
        return args -> {

            // =====================
            // CARGAR ROLES
            // =====================
            if (rolRepository.count() == 0) {
                rolRepository.save(new Rol(null, "ADMINISTRADOR", "Acceso completo al sistema"));
                rolRepository.save(new Rol(null, "GESTOR_PROYECTOS", "Gestiona proyectos y recursos"));
                rolRepository.save(new Rol(null, "LIDER_TECNICO", "Supervisa decisiones tecnicas"));
                rolRepository.save(new Rol(null, "COLABORADOR", "Ejecuta tareas asignadas"));
                rolRepository.save(new Rol(null, "DIRECTIVO", "Visualiza reportes y KPIs"));
                System.out.println(" Roles cargados correctamente");
            }

            // =====================
            // CARGAR ADMIN INICIAL
            // =====================
            if (usuarioRepository.count() == 0) {
                Rol rolAdmin = rolRepository.findByNombreRolIgnoreCase("ADMINISTRADOR")
                        .orElseThrow(() -> new RuntimeException("Rol ADMINISTRADOR no encontrado"));

                Usuario admin = new Usuario();
                admin.setNombre("Admin");
                admin.setApellido("Sistema");
                admin.setCorreo("admin@innovacore.cl");
                admin.setContrasena(BCrypt.hashpw("Admin1234!", BCrypt.gensalt()));
                admin.setEstado(1);
                admin.setRol(rolAdmin);

                usuarioRepository.save(admin);
                System.out.println(" Usuario admin creado: admin@innovacore.cl / Admin1234!");
            }
        };
    }
}