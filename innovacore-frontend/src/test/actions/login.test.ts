import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login } from '../../actions/login'

// Mock del módulo api para no hacer llamadas reales al backend
vi.mock('../../actions/api', () => ({
  api: {
    post: vi.fn(),
  },
}))

import { api } from '../../actions/api'

const usuarioMock = {
  id: 1,
  nombre: 'Admin',
  apellido: 'Test',
  correo: 'admin@innovacore.cl',
  rol: { nombreRol: 'ADMINISTRADOR' },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('login action', () => {
  it('retorna el usuario cuando las credenciales son correctas', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: usuarioMock })

    const resultado = await login({
      correo: 'admin@innovacore.cl',
      contrasena: '123456',
    })

    expect(resultado).toEqual(usuarioMock)
  })

  it('llama al endpoint correcto con las credenciales', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: usuarioMock })

    await login({ correo: 'admin@innovacore.cl', contrasena: '123456' })

    expect(api.post).toHaveBeenCalledWith('/seguridad/usuarios/login', {
      correo: 'admin@innovacore.cl',
      contrasena: '123456',
    })
  })

  it('lanza error cuando las credenciales son incorrectas', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Unauthorized'))

    await expect(
      login({ correo: 'malo@test.cl', contrasena: 'incorrecta' })
    ).rejects.toThrow('Unauthorized')
  })

  it('lanza error cuando el servidor no responde', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Network Error'))

    await expect(
      login({ correo: 'admin@innovacore.cl', contrasena: '123456' })
    ).rejects.toThrow('Network Error')
  })
})