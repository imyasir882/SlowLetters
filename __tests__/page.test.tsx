import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'

// Mock the AuthWrapper component since it depends on localStorage
jest.mock('@/components/AuthWrapper', () => {
  return function MockAuthWrapper() {
    return <div data-testid="auth-wrapper">Mocked AuthWrapper</div>
  }
})

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { name: /SlowLetters/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Home />)
    
    const tagline = screen.getByText(/Romance in every word/i)
    expect(tagline).toBeInTheDocument()
  })

  it('renders the auth wrapper', () => {
    render(<Home />)
    
    const authWrapper = screen.getByTestId('auth-wrapper')
    expect(authWrapper).toBeInTheDocument()
  })
})
