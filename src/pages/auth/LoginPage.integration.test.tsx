import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/utils'
import LoginPage from './LoginPage'
import { supabase } from '../services/supabaseClient'

// Mock Supabase
vi.mock('../services/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
    from: vi.fn(),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('LoginPage - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isAdmin: false,
      loading: false,
      signOut: vi.fn(),
    })
  })

  it('should render login form with email and password fields', () => {
    render(<LoginPage />, { includeAuth: false })
    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should allow user to enter email and password', async () => {
    render(<LoginPage />, { includeAuth: false })
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('should call Supabase signInWithPassword on form submission', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    })

    ;(supabase.auth.signInWithPassword as any) = mockSignIn
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { role: 'volunteer' },
        error: null,
      }),
    })

    render(<LoginPage />, { includeAuth: false })
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should navigate to dashboard for regular volunteers', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    ;(supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { role: 'volunteer' },
        error: null,
      }),
    })

    render(<LoginPage />, { includeAuth: false })
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should navigate to admin dashboard for admin users', async () => {
    const mockUser = {
      id: 'admin-123',
      email: 'admin@example.com',
    }

    ;(supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { role: 'admin' },
        error: null,
      }),
    })

    render(<LoginPage />, { includeAuth: false })
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard')
    })
  })

  it('should display error message when login fails', async () => {
    ;(supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    render(<LoginPage />, { includeAuth: false })
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
  })

  it('should show loading state during login', async () => {
    let resolveLogin: any
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve
    })

    ;(supabase.auth.signInWithPassword as any).mockReturnValue(loginPromise)

    render(<LoginPage />, { includeAuth: false })
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Signing In...')).toBeInTheDocument()
    })

    // Resolve the promise
    resolveLogin({
      data: { user: null },
      error: null,
    })
  })

  it('should handle profile fetch error gracefully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    ;(supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
      }),
    })

    render(<LoginPage />, { includeAuth: false })
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Should still navigate to dashboard even if profile fetch fails
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})

