-- =============================================
-- MICROSERVICIO: Seguridad y Usuarios
-- Base de datos: db_seguridad
-- =============================================

CREATE DATABASE IF NOT EXISTS db_seguridad;
USE db_seguridad;

-- ---------------------------------------------
-- Tabla: rol
-- Se crea antes que usuario porque usuario_rol
-- depende de ella
-- ---------------------------------------------
CREATE TABLE rol (
    id_rol        INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol    VARCHAR(50)  NOT NULL UNIQUE,
    descripcion   VARCHAR(200)
);

-- ---------------------------------------------
-- Tabla: privilegio
-- ---------------------------------------------
CREATE TABLE privilegio (
    id_privilegio      INT AUTO_INCREMENT PRIMARY KEY,
    nombre_privilegio  VARCHAR(100) NOT NULL UNIQUE,
    descripcion        VARCHAR(200)
);

-- ---------------------------------------------
-- Tabla: usuario
-- contrasena guarda el hash BCrypt (Spring Security)
-- estado: 1 = activo, 0 = inactivo
-- ---------------------------------------------
CREATE TABLE usuario (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    correo          VARCHAR(150) NOT NULL UNIQUE,
    contrasena      VARCHAR(255) NOT NULL,
    estado          TINYINT(1)   NOT NULL DEFAULT 1,
    fecha_creacion  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------
-- Tabla: usuario_rol
-- Resuelve relacion muchos a muchos
-- Un usuario puede tener varios roles
-- Un rol puede pertenecer a varios usuarios
-- ---------------------------------------------
CREATE TABLE usuario_rol (
    id_usuario_rol  INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    id_rol          INT NOT NULL,
    CONSTRAINT fk_ur_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_ur_rol     FOREIGN KEY (id_rol)     REFERENCES rol(id_rol)
);

-- ---------------------------------------------
-- Tabla: rol_privilegio
-- Resuelve relacion muchos a muchos
-- Un rol puede tener varios privilegios
-- Un privilegio puede pertenecer a varios roles
-- ---------------------------------------------
CREATE TABLE rol_privilegio (
    id_rol_privilegio  INT AUTO_INCREMENT PRIMARY KEY,
    id_rol             INT NOT NULL,
    id_privilegio      INT NOT NULL,
    CONSTRAINT fk_rp_rol        FOREIGN KEY (id_rol)        REFERENCES rol(id_rol),
    CONSTRAINT fk_rp_privilegio FOREIGN KEY (id_privilegio) REFERENCES privilegio(id_privilegio)
);

