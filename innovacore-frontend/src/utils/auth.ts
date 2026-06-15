export type RolUsuario =
  | "ADMINISTRADOR"
  | "GESTOR_PROYECTOS"
  | "COLABORADOR"
  | "DIRECTIVO";

export const getUsuarioActual = () => {
  const usuarioStorage = localStorage.getItem("usuario");

  if (!usuarioStorage) {
    return null;
  }

  try {
    return JSON.parse(usuarioStorage);
  } catch (error) {
    console.error("Error leyendo usuario desde localStorage:", error);
    localStorage.removeItem("usuario");
    return null;
  }
};

export const getRolUsuario = (): RolUsuario | null => {
  const usuario = getUsuarioActual();

  if (!usuario) {
    return null;
  }

  const rol =
    usuario.rol?.nombreRol ||
    usuario.rol?.nombre ||
    usuario.nombreRol ||
    usuario.rol ||
    null;

  return rol as RolUsuario | null;
};

export const tieneRol = (rolesPermitidos: RolUsuario[]) => {
  const rolUsuario = getRolUsuario();

  if (!rolUsuario) {
    return false;
  }

  return rolesPermitidos.includes(rolUsuario);
};

export const puedeGestionarProyectos = () => {
  return tieneRol(["ADMINISTRADOR", "GESTOR_PROYECTOS"]);
};