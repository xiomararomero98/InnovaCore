import axios from "axios";

// URL base del API Gateway (todas las llamadas pasan por aquí)
export const API_GATEWAY = "http://localhost:8080";

// Cliente axios configurado
export const api = axios.create({
  baseURL: API_GATEWAY,
  headers: {
    "Content-Type": "application/json",
  },
});