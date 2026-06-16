import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import KpiCard from '../../components/KpiCard'

describe('KpiCard', () => {
  it('renderiza el título y el valor correctamente', () => {
    render(<KpiCard title="Proyectos activos" value={8} />)
    expect(screen.getByText('Proyectos activos')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('muestra la descripción si se pasa como prop', () => {
    render(<KpiCard title="Tareas" value={12} description="Tareas completadas este mes" />)
    expect(screen.getByText('Tareas completadas este mes')).toBeInTheDocument()
  })

  it('no muestra descripción si no se pasa', () => {
    render(<KpiCard title="Tareas" value={12} />)
    expect(screen.queryByText('Tareas completadas este mes')).toBeNull()
  })

  it('muestra el símbolo % cuando unit es "%"', () => {
    render(<KpiCard title="Avance" value={75} unit="%" />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('no muestra % cuando unit no es "%"', () => {
    render(<KpiCard title="Empleados" value={10} />)
    expect(screen.queryByText('%')).toBeNull()
  })

  it('llama a onClick al hacer click cuando es clickable', () => {
    const handleClick = vi.fn()
    render(<KpiCard title="Proyectos" value={5} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('muestra el hint de click cuando tiene onClick', () => {
    render(<KpiCard title="Proyectos" value={5} onClick={() => {}} />)
    expect(screen.getByText('Click para ver detalle')).toBeInTheDocument()
  })

  it('no muestra hint de click cuando no tiene onClick', () => {
    render(<KpiCard title="Proyectos" value={5} />)
    expect(screen.queryByText('Click para ver detalle')).toBeNull()
  })

  it('aplica la clase CSS del tipo correcto', () => {
    const { container } = render(<KpiCard title="Alerta" value={2} tipo="alerta" />)
    expect(container.firstChild).toHaveClass('alerta')
  })

  it('activa onClick al presionar Enter', () => {
    const handleClick = vi.fn()
    render(<KpiCard title="Proyectos" value={5} onClick={handleClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('activa onClick al presionar Espacio', () => {
    const handleClick = vi.fn()
    render(<KpiCard title="Proyectos" value={5} onClick={handleClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})