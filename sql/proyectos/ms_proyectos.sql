-- =============================================
-- MICROSERVICIO: Gestión de Proyectos
-- Base de datos: db_proyectos
-- =============================================

CREATE DATABASE IF NOT EXISTS db_proyectos;
USE db_proyectos;

-- ---------------------------------------------
-- Tabla: cliente
-- Se crea primero porque proyecto depende de ella
-- ---------------------------------------------
CREATE TABLE cliente (
    id_cliente        INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente    VARCHAR(150) NOT NULL,
    rubro             VARCHAR(100) NOT NULL,
    correo_contacto   VARCHAR(150) NOT NULL UNIQUE,
    telefono          VARCHAR(20),
    fecha_registro    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------
-- Tabla: proyecto
-- estado_proyecto: PLANIFICADO, EN_CURSO, PAUSADO, FINALIZADO
-- prioridad: BAJA, MEDIA, ALTA, CRITICA
-- porcentaje_avance: 0 a 100
-- ---------------------------------------------
CREATE TABLE proyecto (
    id_proyecto         INT AUTO_INCREMENT PRIMARY KEY,
    nombre_proyecto     VARCHAR(200) NOT NULL,
    descripcion         TEXT,
    fecha_inicio        DATE         NOT NULL,
    fecha_fin           DATE         NOT NULL,
    estado_proyecto     VARCHAR(20)  NOT NULL DEFAULT 'PLANIFICADO',
    prioridad           VARCHAR(10)  NOT NULL DEFAULT 'MEDIA',
    porcentaje_avance   INT          NOT NULL DEFAULT 0,
    id_cliente          INT          NOT NULL,
    id_gestor           INT          NOT NULL, -- referencia logica a usuario en db_seguridad
    fecha_creacion      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proyecto_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    CONSTRAINT chk_avance_proyecto CHECK (porcentaje_avance BETWEEN 0 AND 100)
);

-- ---------------------------------------------
-- Tabla: tarea
-- id_responsable: referencia logica al id_usuario
-- de db_seguridad (sin FK real por ser otra BD)
-- estado_tarea: PENDIENTE, EN_PROGRESO, COMPLETADA, CANCELADA
-- prioridad: BAJA, MEDIA, ALTA, CRITICA
-- ---------------------------------------------
CREATE TABLE tarea (
    id_tarea            INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tarea        VARCHAR(200) NOT NULL,
    descripcion         TEXT,
    fecha_inicio        DATE         NOT NULL,
    fecha_limite        DATE         NOT NULL,
    estado_tarea        VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
    prioridad           VARCHAR(10)  NOT NULL DEFAULT 'MEDIA',
    porcentaje_avance   INT          NOT NULL DEFAULT 0,
    id_proyecto         INT          NOT NULL,
    id_responsable      INT          NOT NULL, -- referencia logica a usuario en db_seguridad
    fecha_creacion      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tarea_proyecto FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
    CONSTRAINT chk_avance_tarea CHECK (porcentaje_avance BETWEEN 0 AND 100)
);