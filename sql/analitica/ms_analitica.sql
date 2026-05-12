-- =============================================
-- MICROSERVICIO: Monitoreo y Analítica
-- Base de datos: db_analitica
-- =============================================

CREATE DATABASE IF NOT EXISTS db_analitica;
USE db_analitica;

-- NOTA IMPORTANTE:
-- Los KPIs NO se persisten en base de datos.
-- Se calculan en tiempo real en el backend
-- consultando los otros microservicios via REST.
-- Ejemplo: KPI de avance de proyecto se calcula
-- promediando porcentaje_avance de las tareas
-- en MS Proyectos al momento de la consulta.

-- ---------------------------------------------
-- Tabla: reporte
-- tipo_reporte: AVANCE, RECURSOS, GENERAL
-- contenido_resumen: resumen del reporte
-- generado_por: referencia logica a id_usuario
-- en db_seguridad
-- ---------------------------------------------
CREATE TABLE reporte (
    id_reporte          INT AUTO_INCREMENT PRIMARY KEY,
    nombre_reporte      VARCHAR(200) NOT NULL,
    fecha_generacion    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_reporte        VARCHAR(50)  NOT NULL,
    contenido_resumen   TEXT         NOT NULL,
    generado_por        INT          NOT NULL -- referencia logica a usuario en db_seguridad
);

-- ---------------------------------------------
-- Tabla: metrica_recurso
-- id_empleado: referencia logica a db_recursos
-- porcentaje_utilizacion: 0 a 100
-- permite ver la evolucion de la carga laboral
-- de cada empleado a lo largo del tiempo
-- ---------------------------------------------
CREATE TABLE metrica_recurso (
    id_metrica_recurso      INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado             INT           NOT NULL, -- referencia logica a empleado en db_recursos
    fecha_medicion          DATE          NOT NULL,
    porcentaje_utilizacion  DECIMAL(5,2)  NOT NULL DEFAULT 0,
    horas_asignadas         INT           NOT NULL DEFAULT 0,
    horas_disponibles       INT           NOT NULL DEFAULT 0,
    CONSTRAINT chk_utilizacion CHECK (porcentaje_utilizacion BETWEEN 0 AND 100),
    CONSTRAINT chk_horas_asig CHECK (horas_asignadas >= 0),
    CONSTRAINT chk_horas_disp CHECK (horas_disponibles >= 0)
);