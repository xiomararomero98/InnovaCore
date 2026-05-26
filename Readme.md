# InnovaCore

InnovaCore es una plataforma de gestión integral de proyectos tecnológicos basada en microservicios. Permite administrar proyectos, recursos humanos y visualizar indicadores clave mediante dashboard y analítica.

## Tecnologías utilizadas

### Frontend
- React
- TypeScript
- Vite
- Axios
- React Router

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Spring Cloud Gateway
- Eureka Server
- RabbitMQ
- MySQL
- Maven

## Componentes

- innovacore-frontend
- api-gateway
- eureka-server
- ms-seguridad
- ms-proyectos
- ms-recursos
- ms-analitica

## Ejecución del proyecto

1. Iniciar MySQL.
2. Iniciar RabbitMQ.
3. Iniciar eureka-server.
4. Iniciar api-gateway.
5. Iniciar microservicios:
   - ms-seguridad
   - ms-proyectos
   - ms-recursos
   - ms-analitica
6. Iniciar frontend:

```bash
cd innovacore-frontend
npm install
npm run dev

http://localhost:5173