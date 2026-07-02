import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'
import { AddTaskBar } from '../../src/components/tasks/AddTaskBar.js'

const defaultProps = {
  listId: 1,
  listName: 'My Day',
  onTaskCreated: vi.fn(),
}

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    () =>
      Promise.resolve(
        new Response(JSON.stringify({ id: 1, title: 'Test' }), { status: 201 }),
      ),
  )
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Estado Collapsed (T1–T5)
// ---------------------------------------------------------------------------
describe('AddTaskBar — collapsed', () => {
  it('T1: renderiza contenedor fixed', () => {
    const { container } = render(<AddTaskBar {...defaultProps} />)
    const outer = container.firstChild as HTMLElement
    expect(outer.className).toContain('fixed')
    expect(outer.className).toContain('bottom-8')
  })

  it('T2: muestra placeholder con nombre de lista', () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText("Add a task to 'My Day'...")
    expect(input).toBeDefined()
  })

  it('T3: muestra icono add', () => {
    render(<AddTaskBar {...defaultProps} />)
    expect(screen.getByText('add')).toBeDefined()
  })

  it('T4: no muestra toolbar en collapsed', () => {
    render(<AddTaskBar {...defaultProps} />)
    expect(screen.queryByTitle('Set due date')).toBeNull()
    expect(screen.queryByTitle('Set reminder')).toBeNull()
    expect(screen.queryByTitle('Repeat')).toBeNull()
  })

  it('T5: input está vacío por defecto', () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement
    expect(input.value).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Expansión / Focus (T6–T10)
// ---------------------------------------------------------------------------
describe('AddTaskBar — focus/expansion', () => {
  it('T6: focus muestra toolbar', () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText("Add a task to 'My Day'...")
    fireEvent.focus(input)

    expect(screen.getByTitle('Set due date')).toBeDefined()
    expect(screen.getByTitle('Set reminder')).toBeDefined()
    expect(screen.getByTitle('Repeat')).toBeDefined()
  })

  it('T7: focus cambia borde a border-primary/20', () => {
    const { container } = render(<AddTaskBar {...defaultProps} />)
    const inner = container.firstChild!.firstChild as HTMLElement
    expect(inner.className).toContain('border-border-subtle-light')

    const input = screen.getByPlaceholderText("Add a task to 'My Day'...")
    fireEvent.focus(input)

    expect(inner.className).toContain('border-primary/20')
  })

  it('T8: blur sin contenido vuelve a collapsed', () => {
    const { container } = render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText("Add a task to 'My Day'...")

    fireEvent.focus(input)
    expect(screen.getByTitle('Set due date')).toBeDefined()

    fireEvent.blur(input)
    expect(screen.queryByTitle('Set due date')).toBeNull()

    const inner = container.firstChild!.firstChild as HTMLElement
    expect(inner.className).toContain('border-border-subtle-light')
  })

  it('T9: blur con contenido mantiene focused', () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Some task' } })
    fireEvent.blur(input)

    expect(screen.getByTitle('Set due date')).toBeDefined()
  })

  it('T10: escape vuelve a collapsed y limpia', () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Some task' } })
    expect((input as HTMLInputElement).value).toBe('Some task')

    fireEvent.keyDown(input, { key: 'Escape' })

    expect((input as HTMLInputElement).value).toBe('')
    expect(screen.queryByTitle('Set due date')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Validación y Envío (T11–T16)
// ---------------------------------------------------------------------------
describe('AddTaskBar — validación y envío', () => {
  it('T11: enter con título corto muestra error', () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByRole('alert')).toBeDefined()
    expect(screen.getByText('Title must be at least 3 characters')).toBeDefined()
  })

  it('T12: error desaparece al editar', () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByRole('alert')).toBeDefined()

    fireEvent.change(input, { target: { value: 'abc' } })
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('T13: enter con título válido envía POST', async () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Comprar leche' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/tasks', expect.anything())
    })

    const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(callArgs[0]).toBe('/api/tasks')
    expect(callArgs[1]).toMatchObject({ method: 'POST' })
  })

  it('T14: POST body contiene title y list como número', async () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled()
    })

    const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(callArgs[1].body)
    expect(body).toEqual({ title: 'Test', list: 1 })
  })

  it('T15: éxito limpia input y colapsa', async () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('')
    })

    expect(screen.queryByTitle('Set due date')).toBeNull()
  })

  it('T16: onTaskCreated se llama tras éxito', async () => {
    const onTaskCreated = vi.fn()
    render(<AddTaskBar {...defaultProps} onTaskCreated={onTaskCreated} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(onTaskCreated).toHaveBeenCalledTimes(1)
    })
  })
})

// ---------------------------------------------------------------------------
// Estado Submitting (T17–T20)
// ---------------------------------------------------------------------------
describe('AddTaskBar — submitting', () => {
  it('T17: input se deshabilita durante submit', async () => {
    let resolveFetch!: (value: unknown) => void
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve }),
    )

    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect((input as HTMLInputElement).disabled).toBe(true)

    resolveFetch!(
      new Response(JSON.stringify({ id: 1 }), { status: 201 }),
    )

    await waitFor(() => {
      expect((input as HTMLInputElement).disabled).toBe(false)
    })
  })

  it('T18: muestra spinner durante submit', async () => {
    let resolveFetch!: (value: unknown) => void
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve }),
    )

    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText('progress_activity')).toBeDefined()
    expect(screen.queryByText('add')).toBeNull()

    resolveFetch!(
      new Response(JSON.stringify({ id: 1 }), { status: 201 }),
    )

    await waitFor(() => {
      expect(screen.queryByText('progress_activity')).toBeNull()
    })
  })

  it('T19: toolbar oculto durante submit', async () => {
    let resolveFetch!: (value: unknown) => void
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve }),
    )

    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.queryByTitle('Set due date')).toBeNull()

    resolveFetch!(
      new Response(JSON.stringify({ id: 1 }), { status: 201 }),
    )
  })
})

// ---------------------------------------------------------------------------
// Estado Error (T21–T23)
// ---------------------------------------------------------------------------
describe('AddTaskBar — error', () => {
  it('T21: error del servidor se muestra', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              error: { fieldErrors: { title: ['Mínimo 3 caracteres'] } },
            }),
            { status: 400 },
          ),
        ),
    )

    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
    })
    expect(screen.getByText('Mínimo 3 caracteres')).toBeDefined()
  })

  it('T22: error de red se muestra', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
    })
    expect(screen.getByText('Network error')).toBeDefined()
  })

  it('T23: error tiene estilo border-error/50', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              error: { fieldErrors: { title: ['Error'] } },
            }),
            { status: 400 },
          ),
        ),
    )

    const { container } = render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      const inner = container.firstChild!.firstChild as HTMLElement
      expect(inner.className).toContain('border-error/50')
    })
  })
})

// ---------------------------------------------------------------------------
// Teclado (T24–T26)
// ---------------------------------------------------------------------------
describe('AddTaskBar — teclado', () => {
  it('T24: shift+enter no envía', () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('T25: enter sin shift envía', async () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Valid task' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled()
    })
  })

  it('T26: escape no envía fetch', () => {
    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Integración (I1–I3)
// ---------------------------------------------------------------------------
describe('AddTaskBar — integración', () => {
  it('I1: placeholder cambia con listName prop', () => {
    render(<AddTaskBar {...defaultProps} listName="Work" />)
    expect(
      screen.getByPlaceholderText("Add a task to 'Work'..."),
    ).toBeDefined()
  })

  it('I2: placeholder por defecto usa Tasks cuando listName no se provee', () => {
    render(<AddTaskBar listId={1} />)
    expect(
      screen.getByPlaceholderText("Add a task to 'Tasks'..."),
    ).toBeDefined()
  })

  it('I3: submit deshabilita hasta que fetch resuelve (debounce natural)', async () => {
    let resolveFetch!: (value: unknown) => void
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve }),
    )

    render(<AddTaskBar {...defaultProps} />)
    const input = screen.getByPlaceholderText(
      "Add a task to 'My Day'...",
    ) as HTMLInputElement

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'First' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect((input as HTMLInputElement).disabled).toBe(true)

    resolveFetch!(
      new Response(JSON.stringify({ id: 1 }), { status: 201 }),
    )

    await waitFor(() => {
      expect((input as HTMLInputElement).disabled).toBe(false)
    })
  })
})
