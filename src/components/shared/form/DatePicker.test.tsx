import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import DatePicker from './DatePicker'

// Mock Calendar component
vi.mock('./Calendar', () => ({
  default: ({ onSelectSlot }: any) => (
    <div data-testid="calendar">
      <button
        onClick={() =>
          onSelectSlot({
            start: new Date('2024-01-15T10:00:00'),
            end: new Date('2024-01-15T11:00:00'),
          })
        }
      >
        Select Date
      </button>
    </div>
  ),
}))

describe('DatePicker Component - Unit Tests', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render date picker with label', () => {
    render(<DatePicker onChange={mockOnChange} label="Select Date" />)
    
    expect(screen.getByText('Select Date')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument()
  })

  it('should display placeholder when no value is provided', () => {
    render(<DatePicker onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('Select date')
    expect(input).toHaveValue('')
  })

  it('should display formatted date when value is provided', () => {
    // Use date with explicit time to avoid timezone issues
    render(
      <DatePicker
        onChange={mockOnChange}
        value="2024-01-15T12:00:00"
      />
    )
    
    const input = screen.getByPlaceholderText('Select date')
    expect(input).toHaveValue('Jan 15, 2024')
  })

  it('should open calendar when input is clicked', async () => {
    render(<DatePicker onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('Select date')
    fireEvent.click(input)

    await waitFor(() => {
      expect(screen.getByTestId('calendar')).toBeInTheDocument()
    })
  })

  it('should call onChange when date is selected', async () => {
    render(<DatePicker onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('Select date')
    fireEvent.click(input)

    await waitFor(() => {
      expect(screen.getByTestId('calendar')).toBeInTheDocument()
    })

    const selectButton = screen.getByText('Select Date')
    fireEvent.click(selectButton)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  it('should close calendar when date is selected', async () => {
    render(<DatePicker onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('Select date')
    fireEvent.click(input)

    await waitFor(() => {
      expect(screen.getByTestId('calendar')).toBeInTheDocument()
    })

    const selectButton = screen.getByText('Select Date')
    fireEvent.click(selectButton)

    await waitFor(() => {
      expect(screen.queryByTestId('calendar')).not.toBeInTheDocument()
    })
  })

  it('should show clear button when date is selected', () => {
    // Use date with explicit time to avoid timezone issues
    render(
      <DatePicker
        onChange={mockOnChange}
        value="2024-01-15T12:00:00"
      />
    )
    
    const clearButton = screen.getByTitle('Clear date')
    expect(clearButton).toBeInTheDocument()
  })

  it('should clear date when clear button is clicked', async () => {
    // Use date with explicit time to avoid timezone issues
    render(
      <DatePicker
        onChange={mockOnChange}
        value="2024-01-15T12:00:00"
      />
    )
    
    const clearButton = screen.getByTitle('Clear date')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('')
    })
  })

  it('should be disabled when disabled prop is true', () => {
    render(<DatePicker onChange={mockOnChange} disabled />)
    
    const input = screen.getByPlaceholderText('Select date')
    expect(input).toBeDisabled()
  })

  it('should not open calendar when disabled', () => {
    render(<DatePicker onChange={mockOnChange} disabled />)
    
    const input = screen.getByPlaceholderText('Select date')
    fireEvent.click(input)

    expect(screen.queryByTestId('calendar')).not.toBeInTheDocument()
  })

  it('should show required indicator when required prop is true', () => {
    render(<DatePicker onChange={mockOnChange} label="Date" required />)
    
    const label = screen.getByText('Date')
    expect(label).toHaveTextContent('Date *')
  })

  it('should format date with time when showTime is true', () => {
    render(
      <DatePicker
        onChange={mockOnChange}
        value="2024-01-15T14:30:00"
        showTime
      />
    )
    
    const input = screen.getByPlaceholderText('Select date')
    expect(input).toHaveValue('Jan 15, 2024, 02:30 PM')
  })
})

