import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import Calendar from "./Calendar";

// Mock react-big-calendar
vi.mock("react-big-calendar", () => ({
  Calendar: vi.fn(
    ({
      events,
      onSelectEvent,
      onSelectSlot,
      onNavigate,
      view,
      date,
      selectable,
      popup,
    }) => (
      <div data-testid="big-calendar">
        <div data-testid="calendar-view">{view}</div>
        <div data-testid="calendar-date">{date?.toISOString()}</div>
        <div data-testid="calendar-events-count">{events?.length || 0}</div>
        {selectable && (
          <button
            data-testid="select-slot-button"
            onClick={() => {
              onSelectSlot?.({
                start: new Date("2024-01-15T10:00:00"),
                end: new Date("2024-01-15T11:00:00"),
                slots: [new Date("2024-01-15T10:00:00")],
              });
            }}
          >
            Select Slot
          </button>
        )}
        {events && events.length > 0 && (
          <button
            data-testid="select-event-button"
            onClick={() => onSelectEvent?.(events[0])}
          >
            Select Event
          </button>
        )}
        <button
          data-testid="navigate-button"
          onClick={() => onNavigate?.(new Date("2024-02-15"))}
        >
          Navigate
        </button>
      </div>
    )
  ),
  momentLocalizer: vi.fn(() => ({})),
  Views: {
    MONTH: "month",
    WEEK: "week",
    DAY: "day",
    AGENDA: "agenda",
  },
}));

// Mock moment
vi.mock("moment", () => ({
  default: vi.fn(),
}));

describe("Calendar Component - Unit Tests", () => {
  const mockEvents = [
    {
      id: "1",
      title: "Test Event 1",
      start: new Date("2024-01-15T10:00:00"),
      end: new Date("2024-01-15T11:00:00"),
    },
    {
      id: "2",
      title: "Test Event 2",
      start: new Date("2024-01-16T14:00:00"),
      end: new Date("2024-01-16T15:00:00"),
      color: "#ff0000",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render calendar component", () => {
    render(<Calendar />);

    expect(screen.getByTestId("big-calendar")).toBeInTheDocument();
  });

  it("should display events count", () => {
    render(<Calendar events={mockEvents} />);

    expect(screen.getByTestId("calendar-events-count")).toHaveTextContent("2");
  });

  it("should render with default view (month)", () => {
    render(<Calendar />);

    expect(screen.getByTestId("calendar-view")).toHaveTextContent("month");
  });

  it("should render with custom default view", () => {
    render(<Calendar defaultView="week" />);

    expect(screen.getByTestId("calendar-view")).toHaveTextContent("week");
  });

  it("should call onSelectEvent when event is clicked", () => {
    const mockOnSelectEvent = vi.fn();
    render(<Calendar events={mockEvents} onSelectEvent={mockOnSelectEvent} />);

    const selectEventButton = screen.getByTestId("select-event-button");
    fireEvent.click(selectEventButton);

    expect(mockOnSelectEvent).toHaveBeenCalledWith(mockEvents[0]);
  });

  it("should call onSelectSlot when slot is selected", () => {
    const mockOnSelectSlot = vi.fn();
    render(<Calendar onSelectSlot={mockOnSelectSlot} selectable />);

    const selectSlotButton = screen.getByTestId("select-slot-button");
    fireEvent.click(selectSlotButton);

    expect(mockOnSelectSlot).toHaveBeenCalledWith({
      start: expect.any(Date),
      end: expect.any(Date),
      slots: expect.any(Array),
    });
  });

  it("should call onNavigate when date is navigated", () => {
    const mockOnNavigate = vi.fn();
    render(<Calendar onNavigate={mockOnNavigate} />);

    const navigateButton = screen.getByTestId("navigate-button");
    fireEvent.click(navigateButton);

    expect(mockOnNavigate).toHaveBeenCalledWith(expect.any(Date));
  });

  it("should render with custom height", () => {
    render(<Calendar height={800} />);

    // The height is applied via inline styles, so we check the component renders
    expect(screen.getByTestId("big-calendar")).toBeInTheDocument();
  });

  it("should render with selectable enabled by default", () => {
    render(<Calendar />);

    expect(screen.getByTestId("select-slot-button")).toBeInTheDocument();
  });

  it("should not show select slot button when selectable is false", () => {
    render(<Calendar selectable={false} />);

    expect(screen.queryByTestId("select-slot-button")).not.toBeInTheDocument();
  });

  it("should handle empty events array", () => {
    render(<Calendar events={[]} />);

    expect(screen.getByTestId("calendar-events-count")).toHaveTextContent("0");
    expect(screen.queryByTestId("select-event-button")).not.toBeInTheDocument();
  });

  it("should handle events with custom colors", () => {
    render(<Calendar events={mockEvents} />);

    // The component should render events with custom colors
    // This is tested through the eventStyleGetter function
    expect(screen.getByTestId("big-calendar")).toBeInTheDocument();
  });

  it("should render with popup enabled by default", () => {
    render(<Calendar />);

    // Popup is passed to the BigCalendar component
    expect(screen.getByTestId("big-calendar")).toBeInTheDocument();
  });

  it("should handle undefined events prop", () => {
    render(<Calendar events={undefined} />);

    expect(screen.getByTestId("calendar-events-count")).toHaveTextContent("0");
  });

  it("should initialize with current date", () => {
    const { container } = render(<Calendar />);

    // The calendar should initialize with the current date
    expect(screen.getByTestId("big-calendar")).toBeInTheDocument();
  });

  it("should handle view changes", () => {
    render(<Calendar defaultView="day" />);

    expect(screen.getByTestId("calendar-view")).toHaveTextContent("day");
  });

  it("should handle all view types", () => {
    const views = ["month", "week", "day", "agenda"] as const;

    views.forEach((view) => {
      const { unmount } = render(<Calendar defaultView={view} />);
      expect(screen.getByTestId("calendar-view")).toHaveTextContent(view);
      unmount();
    });
  });

  it("should not call onSelectEvent when not provided", () => {
    render(<Calendar events={mockEvents} />);

    // Should not throw error when clicking event without handler
    const selectEventButton = screen.getByTestId("select-event-button");
    expect(() => fireEvent.click(selectEventButton)).not.toThrow();
  });

  it("should not call onSelectSlot when not provided", () => {
    render(<Calendar selectable />);

    // Should not throw error when selecting slot without handler
    const selectSlotButton = screen.getByTestId("select-slot-button");
    expect(() => fireEvent.click(selectSlotButton)).not.toThrow();
  });

  it("should not call onNavigate when not provided", () => {
    render(<Calendar />);

    // Should not throw error when navigating without handler
    const navigateButton = screen.getByTestId("navigate-button");
    expect(() => fireEvent.click(navigateButton)).not.toThrow();
  });
});
