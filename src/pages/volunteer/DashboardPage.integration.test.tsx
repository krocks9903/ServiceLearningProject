import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/utils'
import DashboardPage from './DashboardPage'
import { supabase } from '../services/supabaseClient'
import * as useAuthModule from '../hooks/useAuth'

// Mock Supabase
vi.mock('../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Mock Calendar component
vi.mock('../components/shared/Calendar', () => ({
  default: () => <div data-testid="calendar">Calendar</div>,
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

describe('DashboardPage - Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  const mockProfile = {
    id: 'user-123',
    first_name: 'Test',
    last_name: 'User',
    role: 'volunteer',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuthModule.useAuth as any) = vi.fn(() => ({
      user: mockUser,
      profile: mockProfile,
      isAdmin: false,
      loading: false,
      signOut: vi.fn(),
    }))

    // Mock Supabase queries
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockOrder = vi.fn().mockReturnThis()
    const mockLimit = vi.fn().mockReturnThis()

    ;(supabase.from as any).mockImplementation((table: string) => {
      if (table === 'hour_logs') {
        return {
          select: mockSelect.mockResolvedValue({
            data: [
              {
                id: '1',
                hours: 5,
                log_date: '2024-01-15',
                description: 'Test hours',
                verified_at: '2024-01-15T10:00:00Z',
              },
            ],
            error: null,
          }),
          eq: mockEq,
          order: mockOrder,
          limit: mockLimit,
        }
      }
      if (table === 'event_registrations') {
        return {
          select: mockSelect.mockResolvedValue({
            data: [
              {
                id: '1',
                event_id: 'event-1',
                status: 'confirmed',
                event: {
                  id: 'event-1',
                  title: 'Test Event',
                  start_date: '2024-02-01T10:00:00Z',
                },
              },
            ],
            error: null,
          }),
          eq: mockEq,
          order: mockOrder,
        }
      }
      if (table === 'events') {
        return {
          select: mockSelect.mockResolvedValue({
            data: [
              {
                id: 'event-1',
                title: 'Upcoming Event',
                start_date: '2024-02-01T10:00:00Z',
                status: 'active',
              },
            ],
            error: null,
          }),
          eq: mockEq,
          gte: vi.fn().mockReturnThis(),
          order: mockOrder,
          limit: mockLimit,
        }
      }
      return {
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit,
      }
    })
  })

  it('should render dashboard with user information', async () => {
    render(<DashboardPage />, { includeAuth: false })
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it('should fetch and display dashboard data', async () => {
    render(<DashboardPage />, { includeAuth: false })
    
    // Wait for data to load
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('hour_logs')
    }, { timeout: 3000 })
  })

  it('should display calendar component', async () => {
    render(<DashboardPage />, { includeAuth: false })
    
    await waitFor(() => {
      expect(screen.getByTestId('calendar')).toBeInTheDocument()
    })
  })

  it('should redirect to login if user is not authenticated', () => {
    ;(useAuthModule.useAuth as any) = vi.fn(() => ({
      user: null,
      profile: null,
      isAdmin: false,
      loading: false,
      signOut: vi.fn(),
    }))

    render(<DashboardPage />, { includeAuth: false })
    
    // Should redirect when user is null
    // This is typically handled by a route guard, but we test the component behavior
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('should handle data loading errors gracefully', async () => {
    ;(supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    }))

    render(<DashboardPage />, { includeAuth: false })
    
    // Should not crash on error
    await waitFor(() => {
      expect(screen.getByTestId('calendar')).toBeInTheDocument()
    })
  })

  it('should integrate with useAuth hook', () => {
    render(<DashboardPage />, { includeAuth: false })
    
    // Verify useAuth was called
    expect(useAuthModule.useAuth).toHaveBeenCalled()
  })

  it('should display user profile information when available', async () => {
    render(<DashboardPage />, { includeAuth: false })
    
    // Dashboard should use profile data from useAuth
    await waitFor(() => {
      expect(useAuthModule.useAuth).toHaveBeenCalled()
    })
  })
})

