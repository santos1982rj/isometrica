import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Teste</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Teste')
  })

  it('applies variant classes', () => {
    render(<Button variant="destructive">Remover</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('destructive')
  })

  it('handles click events', () => {
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Click</Button>)
    screen.getByRole('button').click()
    expect(clicked).toBe(true)
  })
})
