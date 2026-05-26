# Plan de Branching - InnovaCore

## 1. Estrategia seleccionada

Para el proyecto InnovaCore se utilizó una estrategia basada en GitHub Flow, manteniendo una rama principal estable y ramas de trabajo para cambios específicos.

## 2. Ramas utilizadas

### main
Rama principal del proyecto. Contiene la versión estable y funcional.

### feature/frontend
Rama utilizada para la implementación del frontend en React.

### feature/fix-analitica
Rama utilizada para corregir el endpoint del módulo de analítica, permitiendo consumir correctamente los KPIs desde el API Gateway.

### feature/crud-proyectos
Rama utilizada para implementar el CRUD de proyectos en el frontend.

## 3. Flujo de trabajo

1. Se crea una rama feature para cada cambio importante.
2. Se implementa la funcionalidad.
3. Se realizan pruebas locales.
4. Se confirma el cambio mediante commit.
5. Se integra a la rama main mediante merge.
6. Se suben los cambios al repositorio remoto en GitHub.

## 4. Ejemplos de commits

- frontend
- corrige endpoint de analitica
- agrega crud de proyectos
- actualiza documentacion

## 5. Gestión de conflictos

Durante el desarrollo no se presentaron conflictos críticos. En caso de conflicto, la estrategia definida consiste en:

1. Identificar los archivos afectados.
2. Comparar los cambios entre ramas.
3. Mantener la versión funcional y probada.
4. Ejecutar nuevamente el frontend y backend.
5. Realizar commit de la resolución.

## 6. Justificación

GitHub Flow permite mantener una versión estable en main y trabajar nuevas funcionalidades en ramas separadas, reduciendo el riesgo de afectar el sistema funcional.