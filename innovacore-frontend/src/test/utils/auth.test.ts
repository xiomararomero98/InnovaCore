import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getUsuarioActual,
  getRolUsuario,
  tieneRol,
  puedeGestionarProyectos,
} from '../../utils/auth'

// Usuario de prueba base
const usuarioAdmin = {
  id: 1,
  nombre: 'Admin',
  apellido: 'Test',
  correo: 'admin@innovacore.cl',
  rol: { nombreRol: 'ADMINISTRADOR' },
}

const usuarioColaborador = {
  id: 2,
  nombre: 'Juan',
  apellido: 'Pérez',
  correo: 'juan@innovacore.cl',
  rol: { nombreRol: 'COLABORADOR' },
}

const usuarioGestor = {
  id: 3,
  nombre: 'María',
  apellido: 'López',
  correo: 'maria@innovacore.cl',
  rol: { nombreRol: 'GESTOR_PROYECTOS' },
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

// ── getUsuarioActual ──────────────────────────────────────
describe('getUsuarioActual', () => {
  it('retorna null si no hay usuario en localStorage', () => {
    expect(getUsuarioActual()).toBeNull()
  })

  it('retorna el usuario parseado si existe en localStorage', () => {
    localStorage.setItem('usuario', JSON.stringify(usuarioAdmin))
    const resultado = getUsuarioActual()
    expect(resultado).toEqual(usuarioAdmin)
  })

  it('retorna null y limpia localStorage si el JSON está corrupto', () => {
    localStorage.setItem('usuario', 'json_invalido{{{')
    const resultado = getUsuarioActual()
    expect(resultado).toBeNull()
    expect(localStorage.getItem('usuario')).toBeNull()
  })
})

// ── getRolUsuario ─────────────────────────────────────────
describe('getRolUsuario', () => {
  it('retorna null si no hay usuario', () => {
    expect(getRolUsuario()).toBeNull()
  })

  it('retorna ADMINISTRADOR correctamente', () => {
    localStorage.setItem('usuario', JSON.stringify(usuarioAdmin))
    expect(getRolUsuario()).toBe('ADMINISTRADOR')
  })

  it('retorna COLABORADOR correctamente', () => {
    localStorage.setItem('usuario', JSON.stringify(usuarioColaborador))
    expect(getRolUsuario()).toBe('COLABORADOR')
  })

  it('retorna GESTOR_PROYECTOS correctamente', () => {
    localStorage.setItem('usuario', JSON.stringify(usuarioGestor))
    expect(getRolUsuario()).toBe('GESTOR_PROYECTOS')
  })
})

// ── tieneRol ─────────────────────────────────────────────
describe('tieneRol', () => {
  it('retorna false si no hay usuario logueado', () => {
    expect(tieneRol(['ADMINISTRADOR'])).toBe(false)
  })

  it('retorna true si el rol del usuario está en la lista permitida', () => {
    localStorage.setItem('usuario', JSON.stringify(usuarioAdmin))
    expect(tieneRol(['ADMINISTRADOR', 'GESTOR_PROYECTOS'])).toBe(true)
  })

  it('retorna false si el rol del usuario NO está en la lista permitida', () => {
    localStorage.setItem('usuario', JSON.stringify(usuarioColaborador))
    expect(tieneRol(['ADMINISTRADOR', 'GESTOR_PROYECTOS'])).toBe(false)
  })

  it('retorna true para DIRECTIVO con su rol', () => {
    const directivo = { ...usuarioAdmin, rol: { nombreRol: 'DIRECTIVO' } }
    localStorage.setItem('usuario', JSON.stringify(directivo))
    expect(tieneRol(['DIRECTIVO'])).toBe(true)
  })
})

// ── puedeGestionarProyectos ───────────────────────────────
describe('puedeGestionarProyectos', () => {
  it('retorna true para ADMINISTRADOR', () => {
    localStorage.setItem('usuario', JSON.stringify(usuarioAdmin))
    expect(puedeGestionarProyectos()).toBe(true)
  })

  it('retorna true para GESTOR_PROYECTOS', () => {
    localStorage.setItem('usuario', JSON.stringify(usuarioGestor))
    expect(puedeGestionarProyectos()).toBe(true)
  })

  it('retorna false para COLABORADOR', () => {
    localStorage.setItem('usuario', JSON.stringify(usuarioColaborador))
    expect(puedeGestionarProyectos()).toBe(false)
  })

  it('retorna false para DIRECTIVO', () => {
    const directivo = { ...usuarioAdmin, rol: { nombreRol: 'DIRECTIVO' } }
    localStorage.setItem('usuario', JSON.stringify(directivo))
    expect(puedeGestionarProyectos()).toBe(false)
  })

  it('retorna false si no hay sesión activa', () => {
    expect(puedeGestionarProyectos()).toBe(false)
  })
})