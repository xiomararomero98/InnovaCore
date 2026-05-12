-- =============================================
-- MICROSERVICIO: Recursos y Colaboración
-- Base de datos: db_recursos
-- =============================================

CREATE DATABASE IF NOT EXISTS db_recursos;
USE db_recursos;

-- ---------------------------------------------
-- Tabla: empleado
-- id_usuario: referencia logica al id_usuario
-- de db_seguridad (sin FK real por ser otra BD)
-- nombre, apellido y correo se duplican
-- intencionalmente para que este microservicio
-- funcione de forma autonoma aunque Seguridad
-- no este disponible.
-- La sincronizacion se mantiene via eventos:
-- cuando usuario se actualiza en Seguridad,
-- se emite un evento que actualiza esta tabla.
-- disponibilidad: DISPONIBLE, OCUPADO, VACACIONES
-- estado: 1 = activo, 0 = inactivo
-- ---------------------------------------------
CREATE TABLE empleado (
    id_empleado       INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario        INT          NOT NULL UNIQUE, -- referencia logica a usuario en db_seguridad
    nombre            VARCHAR(100) NOT NULL,
    apellido          VARCHAR(100) NOT NULL,
    correo            VARCHAR(150) NOT NULL UNIQUE,
    cargo             VARCHAR(100) NOT NULL,
    especialidad      VARCHAR(100) NOT NULL,
    disponibilidad    VARCHAR(20)  NOT NULL DEFAULT 'DISPONIBLE',
    foto_perfil       VARCHAR(255) NULL, -- URL de la foto de perfil
    estado            TINYINT(1)   NOT NULL DEFAULT 1,
    fecha_ingreso     DATE         NOT NULL
);

-- ---------------------------------------------
-- Tabla: asignacion
-- id_proyecto: referencia logica al id_proyecto
-- de db_proyectos (sin FK real por ser otra BD)
-- rol_en_proyecto: rol que cumple el empleado
-- en ese proyecto especifico
-- ---------------------------------------------
CREATE TABLE asignacion (
    id_asignacion     INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado       INT          NOT NULL,
    id_proyecto       INT          NOT NULL, -- referencia logica a proyecto en db_proyectos
    fecha_asignacion  DATE         NOT NULL,
    horas_asignadas   INT          NOT NULL DEFAULT 0,
    rol_en_proyecto   VARCHAR(100) NOT NULL,
    fecha_creacion    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asignacion_empleado FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    CONSTRAINT chk_horas CHECK (horas_asignadas >= 0)
);

-- ---------------------------------------------
-- Tabla: comentario
-- id_usuario: referencia logica a db_seguridad
-- id_proyecto y id_tarea: referencias logicas
-- a db_proyectos
-- id_tarea puede ser NULL si el comentario es
-- sobre el proyecto en general
-- ---------------------------------------------
CREATE TABLE comentario (
    id_comentario     INT AUTO_INCREMENT PRIMARY KEY,
    contenido         TEXT         NOT NULL,
    fecha_comentario  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario        INT          NOT NULL, -- referencia logica a usuario en db_seguridad
    id_proyecto       INT          NOT NULL, -- referencia logica a proyecto en db_proyectos
    id_tarea          INT          NULL      -- referencia logica a tarea en db_proyectos (opcional)
);

-- ---------------------------------------------
-- Tabla: notificacion
-- id_usuario: referencia logica a db_seguridad
-- leida: 0 = no leida, 1 = leida
-- tipo: TAREA_ASIGNADA, PROYECTO_ACTUALIZADO,
--       COMENTARIO_NUEVO, ALERTA_PLAZO
-- ---------------------------------------------
CREATE TABLE notificacion (
    id_notificacion   INT AUTO_INCREMENT PRIMARY KEY,
    titulo            VARCHAR(200) NOT NULL,
    mensaje           TEXT         NOT NULL,
    fecha_envio       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida             TINYINT(1)   NOT NULL DEFAULT 0,
    tipo              VARCHAR(50)  NOT NULL,
    id_usuario        INT          NOT NULL -- referencia logica a usuario en db_seguridad
);
