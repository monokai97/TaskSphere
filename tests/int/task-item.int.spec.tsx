import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import { TaskItem } from '../../src/components/tasks/TaskItem.js'
import type { Task } from '../../src/payload-types.js'

function todayStr(): string {
  return new Date().toISOString()
}

function tomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString()
}

function makeTask(overrides?: Partial<Task>): Task {
  return {
    id: 1,
    title: 'Comprar leche',
    description: null,
    status: 'pending',
    important: false,
    dueDate: todayStr(),
    list: { id: 1, name: 'My Day', icon: 'today', color: '#004ac6', guestId: 'abc', isDefault: true, sortOrder: 0, updatedAt: '', createdAt: '' },
    guestId: 'test-guest',
    sortOrder: 0,
    completedAt: null,
    subtasks: null,
    updatedAt: '',
    createdAt: '',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

// ---------------------------------------------------------------------------
// Renderizado Básico (T1–T5)
// ---------------------------------------------------------------------------
describe('TaskItem — renderizado básico', () => {
  it('T1: renderiza título de la tarea', () => {
    const task = makeTask()
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    expect(screen.getByText('Comprar leche')).toBeDefined()
  })

  it('T2: renderiza metadata de fecha (Today)', () => {
    const task = makeTask({ dueDate: todayStr() })
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    expect(screen.getByText('Today')).toBeDefined()
  })

  it('T2b: renderiza Tomorrow cuando corresponde', () => {
    const task = makeTask({ dueDate: tomorrowStr() })
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    expect(screen.getByText('Tomorrow')).toBeDefined()
  })

  it('T3: renderiza nombre de lista', () => {
    const task = makeTask()
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    expect(screen.getByText('My Day')).toBeDefined()
  })

  it('T4: renderiza estrella no importante', () => {
    const task = makeTask({ important: false })
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    const star = screen.getByLabelText('Marcar importante')
    expect(star).toBeDefined()
  })

  it('T5: renderiza drag handle', () => {
    const task = makeTask()
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    expect(screen.getByText('drag_indicator')).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Estados Visuales (T6–T10)
// ---------------------------------------------------------------------------
describe('TaskItem — estados visuales', () => {
  it('T6: estado completed', () => {
    const task = makeTask({ status: 'completed' })
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />,
    )
    const root = container.querySelector('[role="listitem"]')
    expect(root!.className).toContain('opacity-50')

    const title = screen.getByText('Comprar leche')
    expect(title.className).toContain('line-through')
  })

  it('T7: estado important', () => {
    const task = makeTask({ important: true })
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    const star = screen.getByLabelText('Quitar importante')
    expect(star).toBeDefined()
    expect(star.className).toContain('text-secondary')
  })

  it('T8: estado selected', () => {
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} selected />,
    )
    const root = container.querySelector('[role="listitem"]')
    expect(root!.className).toContain('border-primary/20')
  })

  it('T9: sin dueDate no renderiza metadata de fecha', () => {
    const task = makeTask({ dueDate: null })
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    expect(screen.queryByText('Today')).toBeNull()
    expect(screen.queryByText('calendar_today')).toBeNull()
  })

  it('T10: list como number (depth=0) no renderiza nombre', () => {
    const task = makeTask({ list: 1 })
    render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />,
    )
    expect(screen.queryByText('My Day')).toBeNull()
    expect(screen.getByText('Today')).toBeDefined()
    expect(screen.getByText('calendar_today')).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Interacciones (T11–T15)
// ---------------------------------------------------------------------------
describe('TaskItem — interacciones', () => {
  it('T11: click en checkbox llama onToggle con (id, completed)', () => {
    const onToggle = vi.fn()
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={onToggle} onToggleImportant={vi.fn()} />,
    )
    const checkbox = container.querySelector('.rounded-full.border-2')
    fireEvent.click(checkbox!)
    expect(onToggle).toHaveBeenCalledWith(1, 'completed')
  })

  it('T12: click en estrella llama onToggleImportant con (id, true)', () => {
    const onToggleImportant = vi.fn()
    const task = makeTask({ important: false })
    render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={onToggleImportant} />,
    )
    fireEvent.click(screen.getByLabelText('Marcar importante'))
    expect(onToggleImportant).toHaveBeenCalledWith(1, true)
  })

  it('T13: click en contenedor llama onClick con (id)', () => {
    const onClick = vi.fn()
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} onClick={onClick} />,
    )
    fireEvent.click(container.querySelector('[role="listitem"]')!)
    expect(onClick).toHaveBeenCalledWith(1)
  })

  it('T14: click en estrella no propaga al contenedor', () => {
    const onClick = vi.fn()
    const onToggleImportant = vi.fn()
    const task = makeTask()
    render(
      <TaskItem
        task={task}
        onToggle={vi.fn()}
        onToggleImportant={onToggleImportant}
        onClick={onClick}
      />,
    )
    fireEvent.click(screen.getByLabelText('Marcar importante'))
    expect(onToggleImportant).toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('T15: div completed check no es clickeable (no tiene onClick)', () => {
    const onToggle = vi.fn()
    const task = makeTask({ status: 'completed' })
    const { container } = render(
      <TaskItem task={task} onToggle={onToggle} onToggleImportant={vi.fn()} />,
    )
    const checkCircle = container.querySelector('.rounded-full.bg-primary')
    expect(checkCircle).toBeDefined()
    fireEvent.click(checkCircle!)
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('T13b: Enter activa onClick', () => {
    const onClick = vi.fn()
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} onClick={onClick} />,
    )
    fireEvent.keyDown(container.querySelector('[role="listitem"]')!, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledWith(1)
  })

  it('T13c: Space activa onClick', () => {
    const onClick = vi.fn()
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} onClick={onClick} />,
    )
    fireEvent.keyDown(container.querySelector('[role="listitem"]')!, { key: ' ' })
    expect(onClick).toHaveBeenCalledWith(1)
  })
})

// ---------------------------------------------------------------------------
// React.memo (T16–T17)
// ---------------------------------------------------------------------------
describe('TaskItem — React.memo', () => {
  it('T16: no re-renderiza con mismas props (referencia estable)', () => {
    const onToggle = vi.fn()
    const onToggleImportant = vi.fn()
    const task = makeTask()

    const { rerender, container } = render(
      <TaskItem task={task} onToggle={onToggle} onToggleImportant={onToggleImportant} />,
    )
    const html1 = container.innerHTML

    rerender(
      <TaskItem task={task} onToggle={onToggle} onToggleImportant={onToggleImportant} />,
    )
    const html2 = container.innerHTML

    expect(html1).toBe(html2)
  })

  it('T17: re-renderiza cuando cambia status', () => {
    const onToggle = vi.fn()
    const onToggleImportant = vi.fn()
    const task1 = makeTask({ status: 'pending' })
    const task2 = makeTask({ status: 'completed' })

    const { rerender, container } = render(
      <TaskItem task={task1} onToggle={onToggle} onToggleImportant={onToggleImportant} />,
    )
    const html1 = container.innerHTML

    rerender(
      <TaskItem task={task2} onToggle={onToggle} onToggleImportant={onToggleImportant} />,
    )
    const html2 = container.innerHTML

    expect(html1).not.toBe(html2)
  })
})

// ---------------------------------------------------------------------------
// Clases CSS / Visual (V1–V9)
// ---------------------------------------------------------------------------
describe('TaskItem — clases CSS', () => {
  it('V1: item normal tiene bg-surface-container-lowest', () => {
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />,
    )
    expect(container.querySelector('[role="listitem"]')!.className).toContain(
      'bg-surface-container-lowest',
    )
  })

  it('V2: item tiene hover:border-outline-variant', () => {
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />,
    )
    expect(container.querySelector('[role="listitem"]')!.className).toContain(
      'hover:border-outline-variant',
    )
  })

  it('V3: checkbox pending tiene border-2 border-outline', () => {
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />,
    )
    const checkbox = container.querySelector('.rounded-full.border-2')
    expect(checkbox!.className).toContain('border-outline')
  })

  it('V4: checkbox completed tiene bg-primary', () => {
    const task = makeTask({ status: 'completed' })
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />,
    )
    const checkCircle = container.querySelector('.rounded-full.bg-primary')
    expect(checkCircle).toBeDefined()
  })

  it('V5: drag handle tiene opacity-0', () => {
    const task = makeTask()
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    const drag = screen.getByText('drag_indicator')
    expect(drag.className).toContain('opacity-0')
  })

  it('V6: drag handle tiene group-hover:opacity-100', () => {
    const task = makeTask()
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    const drag = screen.getByText('drag_indicator')
    expect(drag.className).toContain('group-hover:opacity-100')
  })

  it('V7: gap-4 en contenedor', () => {
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />,
    )
    expect(container.querySelector('[role="listitem"]')!.className).toContain('gap-4')
  })

  it('V8: p-4 en contenedor', () => {
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />,
    )
    const root = container.querySelector('[role="listitem"]')
    expect(root!.className).toContain('p-4')
  })

  it('V9: rounded-xl en contenedor', () => {
    const task = makeTask()
    const { container } = render(
      <TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />,
    )
    const root = container.querySelector('[role="listitem"]')
    expect(root!.className).toContain('rounded-xl')
  })

  it('title tiene font-task-item y text-body-md', () => {
    const task = makeTask()
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    const title = screen.getByText('Comprar leche')
    expect(title.className).toContain('font-task-item')
    expect(title.className).toContain('text-body-md')
  })

  it('checkbox completed tiene check icon', () => {
    const task = makeTask({ status: 'completed' })
    render(<TaskItem task={task} onToggle={vi.fn()} onToggleImportant={vi.fn()} />)
    expect(screen.getByText('check')).toBeDefined()
  })
})
