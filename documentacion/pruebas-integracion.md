# Pruebas de Integración — InnovaCore

## Descripción

Este documento describe las pruebas de integración funcional realizadas sobre el sistema InnovaCore, verificando la comunicación entre microservicios a través del API Gateway (puerto 8080).

**Stack:** Spring Boot · React · Docker · RabbitMQ · Eureka  
**API Gateway:** `http://localhost:8080`

---

## Arquitectura de integración

```
Frontend (React)
      │
      ▼
API Gateway :8080
      │
      ├──► ms-seguridad  :8081  (autenticación y usuarios)
      ├──► ms-proyectos  :8082  (proyectos y tareas)
      ├──► ms-recursos   :8083  (empleados y asignaciones)
      └──► ms-analitica  :8084  (KPIs y dashboard)
            │
            └──► Consulta ms-proyectos y ms-recursos via WebClient
```

---

## Flujo 1 — Login de usuario

**Objetivo:** Verificar que un usuario puede autenticarse a través del API Gateway.

**Endpoint:** `POST http://localhost:8080/seguridad/usuarios/login`

**Request:**
```json
{
  "correo": "admin@innovacore.cl",
  "contrasena": "admin123"
}
```

**Resultado esperado:** `200 OK`
```json
{
  "id": 1,
  "nombre": "Admin",
  "apellido": "Sistema",
  "correo": "admin@innovacore.cl",
  "rol": {
    "nombreRol": "ADMINISTRADOR"
  }
}
```

**Resultado obtenido:** ✅ `200 OK` — Usuario retornado con rol correctamente.

---

## Flujo 2 — Crear proyecto

**Objetivo:** Verificar que se puede crear un proyecto y queda en estado PLANIFICADO con 0% de avance automáticamente.

**Endpoint:** `POST http://localhost:8080/proyectos/proyectos`

**Request:**
```json
{
  "nombreProyecto": "Sistema de Inventario",
  "descripcion": "Proyecto para gestionar inventario",
  "fechaInicio": "2026-06-01",
  "fechaFin": "2026-12-31",
  "prioridad": "ALTA",
  "idGestor": 2,
  "cliente": { "id": 1 }
}
```

**Resultado esperado:** `201 Created`
```json
{
  "id": 1,
  "nombreProyecto": "Sistema de Inventario",
  "estadoProyecto": "PLANIFICADO",
  "porcentajeAvance": 0
}
```

**Resultado obtenido:** ✅ `201 Created` — Proyecto creado con estado y avance automáticos.

---

## Flujo 3 — Asignar empleado a proyecto y verificar disponibilidad

**Objetivo:** Verificar que al asignar un empleado con ≥40 horas activas, su disponibilidad cambia a OCUPADO automáticamente.

### Paso 1 — Crear empleado

**Endpoint:** `POST http://localhost:8080/recursos/empleados`

```json
{
  "nombre": "Carlos",
  "apellido": "Mendoza",
  "correo": "carlos@innovacore.cl",
  "cargo": "Desarrollador",
  "especialidad": "Backend",
  "disponibilidad": "DISPONIBLE",
  "estado": 1
}
```

**Resultado:** ✅ `201 Created` — Empleado con disponibilidad DISPONIBLE.

### Paso 2 — Asignar empleado al proyecto (40 horas)

**Endpoint:** `POST http://localhost:8080/recursos/asignaciones/proyecto/1/multiple`

```json
{
  "empleadosIds": [1],
  "horasAsignadas": 40,
  "rolEnProyecto": "DESARROLLADOR"
}
```

**Resultado:** ✅ `201 Created` — Asignación creada. Disponibilidad del empleado cambia a **OCUPADO** automáticamente.

### Paso 3 — Verificar disponibilidad

**Endpoint:** `GET http://localhost:8080/recursos/empleados/1`

**Resultado:** ✅ `200 OK`
```json
{
  "id": 1,
  "nombre": "Carlos",
  "disponibilidad": "OCUPADO"
}
```

---

## Flujo 4 — Crear tarea y verificar recálculo de avance del proyecto

**Objetivo:** Verificar que al completar una tarea, el avance del proyecto se recalcula automáticamente.

### Paso 1 — Crear tarea

**Endpoint:** `POST http://localhost:8080/proyectos/tareas`

```json
{
  "nombreTarea": "Diseño de base de datos",
  "descripcion": "Modelado ER del sistema",
  "fechaInicio": "2026-06-01",
  "fechaLimite": "2026-06-15",
  "prioridad": "ALTA",
  "idResponsable": 1,
  "proyecto": { "id": 1 }
}
```

**Resultado:** ✅ `201 Created` — Tarea creada con estado PENDIENTE y 0% de avance.

### Paso 2 — Cambiar estado a COMPLETADA

**Endpoint:** `PUT http://localhost:8080/proyectos/tareas/1/estado`

```json
{ "estado": "COMPLETADA" }
```

**Resultado:** ✅ `200 OK` — Tarea completada. El proyecto recalcula su avance automáticamente a **100%** y cambia su estado a **FINALIZADO**.

---

## Flujo 5 — Consultar KPIs en ms-analitica

**Objetivo:** Verificar que ms-analitica consulta correctamente ms-proyectos y ms-recursos para generar KPIs en tiempo real.

**Endpoint:** `GET http://localhost:8080/analitica/kpis`

**Resultado esperado:** `200 OK`
```json
[
  { "nombre": "Proyectos Activos", "valor": 2, "tipo": "PROYECTOS" },
  { "nombre": "Proyectos Atrasados", "valor": 1, "tipo": "PROYECTOS" },
  { "nombre": "Avance Promedio", "valor": 62.5, "tipo": "PROYECTOS" },
  { "nombre": "Recursos Disponibles", "valor": 3, "tipo": "RECURSOS" },
  { "nombre": "Recursos Ocupados", "valor": 2, "tipo": "RECURSOS" },
  { "nombre": "Utilización Recursos", "valor": 40.0, "tipo": "RECURSOS" },
  { "nombre": "Tareas Completadas", "valor": 5, "tipo": "PROYECTOS" }
]
```

**Resultado obtenido:** ✅ `200 OK` — 7 KPIs calculados en tiempo real agregando datos de ms-proyectos y ms-recursos. Circuit Breaker activo como fallback si algún microservicio no responde.

---

## Flujo 6 — Control de acceso por rol

**Objetivo:** Verificar que las rutas están protegidas por rol desde el frontend.

| Rol | Dashboard | Proyectos | Recursos | Analítica | Mi Panel |
|-----|-----------|-----------|----------|-----------|----------|
| ADMINISTRADOR | ✅ | ✅ | ✅ | ✅ | ❌ |
| GESTOR_PROYECTOS | ✅ | ✅ | ✅ | ❌ | ❌ |
| DIRECTIVO | ✅ | ✅ (solo lectura) | ❌ | ✅ | ❌ |
| COLABORADOR | ✅ | ❌ | ❌ | ❌ | ✅ |

**Resultado:** ✅ Roles validados correctamente en frontend mediante `ProtectedRoute` y `RoleRoute`.

---

## Resumen de resultados

| Flujo | Descripción | Estado |
|-------|-------------|--------|
| 1 | Login de usuario | ✅ Pasó |
| 2 | Crear proyecto | ✅ Pasó |
| 3 | Asignar empleado y verificar disponibilidad | ✅ Pasó |
| 4 | Crear tarea y recálculo de avance del proyecto | ✅ Pasó |
| 5 | KPIs en tiempo real desde ms-analitica | ✅ Pasó |
| 6 | Control de acceso por rol | ✅ Pasó |

---

## Herramientas utilizadas

- **Postman** — para ejecutar peticiones HTTP directas al API Gateway
- **Docker Compose** — para levantar todos los microservicios
- **GitHub Actions** — CI/CD automatizado que corre tests en cada push a `main`
- **Eureka Dashboard** (`http://localhost:8761`) — para verificar que todos los microservicios estén registrados