import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'font-inter' }),
  Playfair_Display: () => ({ variable: 'font-playfair' })
}))
