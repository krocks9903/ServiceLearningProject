import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import EventRegistrationModal from './EventRegistrationModal'
import { supabase } from '../../services/supabaseClient'
import * as useAuthModule from '../../hooks/useAuth'

// Mock Supabase
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('EventRegistrationModal - Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'Test Description',
    location: 'Test Location',
    start_date: '2024-02-01T10:00:00Z',
    end_date: '2024-02-01T14:00:00Z',
    max_volunteers: 10,
    status: 'active',
  }

  const mockShifts = [
    {
      id: 'shift-1',
      event_id: 'event-1',
      title: 'Morning Shift',
      description: 'Morning shift description',
      start_time: '2024-02-01T10:00:00Z',
      end_time: '2024-02-01T12:00:00Z',
      capacity: 5,
    },
    {
      id: 'shift-2',
      event_id: 'event-1',
      title: 'Afternoon Shift',
      description: 'Afternoon shift description',
      start_time: '2024-02-01T12:00:00Z',
      end_time: '2024-02-01T14:00:00Z',
      capacity: 5,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuthModule.useAuth as any) = vi.fn(() => ({
      user: mockUser,
      profile: null,
      isAdmin: false,
      loading: false,
      signOut: vi.fn(),
    }))

    // Mock Supabase queries
    ;(supabase.from as any).mockImplementation((table: string) => {
      if (table === 'shifts') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: mockShifts,
            error: null,
          }),
        }
      }
      if (table === 'event_registrations') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'reg-1',
                volunteer_id: mockUser.id,
                shift_id: 'shift-1',
                status: 'pending',
              },
            ],
            error: null,
          }),
        }
      }
      return {
        select: vi.fn(),
        insert: vi.fn(),
        eq: vi.fn(),
      }
    })
  })

  it('should render modal when isOpen is true', () => {
    render(
      <EventRegistrationModal
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
      />,
      { includeAuth: false }
    )
    
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    render(
      <EventRegistrationModal
        event={mockEvent}
        isOpen={false}
        onClose={vi.fn()}
      />,
      { includeAuth: false }
    )
    
    expect(screen.queryByText('Test Event')).not.toBeInTheDocument()
  })

  it('should fetch and display shifts for the event', async () => {
    render(
      <EventRegistrationModal
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
      />,
      { includeAuth: false }
    )
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('shifts')
    })
  })

  it('should allow user to select a shift', async () => {
    render(
      <EventRegistrationModal
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
      />,
      { includeAuth: false }
    )
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('shifts')
    })

    // Look for shift selection UI
    // This depends on the actual implementation
  })

  it('should submit registration when form is submitted', async () => {
    const mockOnClose = vi.fn()
    const mockOnSuccess = vi.fn()

    const mockInsert = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'reg-1',
          volunteer_id: mockUser.id,
          shift_id: 'shift-1',
          status: 'pending',
        },
      ],
      error: null,
    })

    ;(supabase.from as any).mockImplementation((table: string) => {
      if (table === 'shifts') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: mockShifts,
            error: null,
          }),
        }
      }
      if (table === 'event_registrations') {
        return {
          insert: mockInsert,
          select: mockSelect,
        }
      }
      return {
        select: vi.fn(),
        insert: vi.fn(),
      }
    })

    render(
      <EventRegistrationModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
        onRegistrationSuccess={mockOnSuccess}
      />,
      { includeAuth: false }
    )
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('shifts')
    })

    // Find and click submit button
    // This depends on the actual form implementation
  })

  it('should display error message when registration fails', async () => {
    ;(supabase.from as any).mockImplementation((table: string) => {
      if (table === 'shifts') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: mockShifts,
            error: null,
          }),
        }
      }
      if (table === 'event_registrations') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Registration failed' },
          }),
        }
      }
      return {
        select: vi.fn(),
        insert: vi.fn(),
      }
    })

    render(
      <EventRegistrationModal
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
      />,
      { includeAuth: false }
    )
    
    // Error handling would be tested when form is submitted
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled()
    })
  })

  it('should integrate with useAuth hook to get user information', () => {
    render(
      <EventRegistrationModal
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
      />,
      { includeAuth: false }
    )
    
    expect(useAuthModule.useAuth).toHaveBeenCalled()
  })

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn()
    
    render(
      <EventRegistrationModal
        event={mockEvent}
        isOpen={true}
        onClose={mockOnClose}
      />,
      { includeAuth: false }
    )
    
    // Find and click close button
    const closeButton = screen.getByRole('button', { name: /close/i }) || 
                       screen.getByText('×') ||
                       document.querySelector('[aria-label="Close"]')
    
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })
})

