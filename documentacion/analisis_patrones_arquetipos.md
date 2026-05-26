# Análisis de Patrones y Arquetipos - InnovaCore

## 1. Contexto del proyecto

InnovaCore es una plataforma basada en microservicios para la gestión integral de proyectos tecnológicos. La solución permite administrar proyectos, recursos humanos y visualizar indicadores clave de desempeño mediante un dashboard y módulo de analítica.

## 2. Patrones de diseño implementados

### Repository Pattern
Se implementa mediante interfaces Repository en los microservicios con Spring Data JPA. Este patrón separa la lógica de acceso a datos de la lógica de negocio, permitiendo que los servicios trabajen con métodos de persistencia sin depender directamente de consultas SQL.

Ejemplo de aplicación:
- ProyectoRepository
- EmpleadoRepository
- UsuarioRepository
- ClienteRepository

Problema que resuelve:
Evita acoplar los controladores o servicios directamente a la base de datos, mejorando la mantenibilidad y facilitando futuras pruebas unitarias.

### Patrón Controller-Service-Repository
El backend está organizado en capas:
- Controller: recibe las solicitudes HTTP.
- Service: contiene la lógica de negocio.
- Repository: gestiona la persistencia de datos.

Problema que resuelve:
Permite separar responsabilidades, haciendo que el código sea más ordenado, escalable y fácil de mantener.

### DTO / Separación de modelos
Se utilizan estructuras de datos para transferir información entre capas y servicios, evitando exponer innecesariamente la estructura interna de las entidades.

Problema que resuelve:
Reduce el acoplamiento entre frontend, backend y base de datos.

### API Gateway / BFF
El API Gateway funciona como punto único de entrada para el frontend React. Desde el frontend no se consumen directamente todos los microservicios, sino que las peticiones pasan por el gateway.

Problema que resuelve:
Centraliza la comunicación, simplifica las rutas del frontend y permite desacoplar la interfaz de usuario de la ubicación real de cada microservicio.

### Circuit Breaker
Se considera el uso de Circuit Breaker para manejar fallos entre servicios y evitar que una caída de un microservicio afecte completamente al sistema.

Problema que resuelve:
Aumenta la resiliencia del sistema ante errores de comunicación.

### Publisher/Subscriber con RabbitMQ
El microservicio de proyectos publica eventos cuando se crea un proyecto. Esto permite comunicación asincrónica entre servicios.

Problema que resuelve:
Permite desacoplar microservicios y mejorar la escalabilidad.

## 3. Patrones arquitectónicos

### Arquitectura de Microservicios
El sistema se divide en componentes independientes:
- eureka-server
- api-gateway
- ms-seguridad
- ms-proyectos
- ms-recursos
- ms-analitica

Cada microservicio cumple una responsabilidad específica, lo que mejora la escalabilidad, mantenibilidad y separación de responsabilidades.

### Service Discovery con Eureka
Eureka permite registrar y descubrir microservicios dentro del ecosistema.

### API Gateway
Centraliza las solicitudes del frontend y las redirige hacia los microservicios correspondientes.

## 4. Arquetipos Maven

Los microservicios fueron construidos siguiendo una estructura base común basada en Maven y Spring Boot:

- pom.xml
- src/main/java
- controller
- service
- repository
- model/entity
- config
- resources/application.properties

Esta estructura permite reutilizar una base común para crear nuevos microservicios de forma ordenada.

## 5. Justificación general

La elección de microservicios, API Gateway, Repository Pattern y separación por capas permite que InnovaCore sea una solución modular, escalable y mantenible. Cada componente puede evolucionar de forma independiente sin afectar directamente a los demás.