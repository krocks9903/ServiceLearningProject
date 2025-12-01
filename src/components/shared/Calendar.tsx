import React, { useState, useMemo } from 'react'
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import { theme } from '../../theme'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: any
  color?: string
}

interface CalendarProps {
  events?: CalendarEvent[]
  onSelectEvent?: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[] }) => void
  onNavigate?: (date: Date) => void
  defaultView?: 'month' | 'week' | 'day' | 'agenda'
  height?: number
  showToolbar?: boolean
  selectable?: boolean
  popup?: boolean
}

export default function Calendar({
  events = [],
  onSelectEvent,
  onSelectSlot,
  onNavigate,
  defaultView = 'month',
  height = 600,
  showToolbar = true,
  selectable = true,
  popup = true
}: CalendarProps) {
  const [view, setView] = useState(defaultView)
  const [date, setDate] = useState(new Date())

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
    onNavigate?.(newDate)
  }

  const handleView = (newView: string) => {
    setView(newView)
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.color || theme.colors.primary
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  const styles = {
    calendar: {
      height: `${height}px`,
      margin: '20px 0',
      fontFamily: theme.typography.fontFamily.base,
      '& .rbc-header': {
        backgroundColor: theme.colors.primary,
        color: 'white',
        padding: '10px',
        fontWeight: theme.typography.fontWeight.semibold,
        fontSize: theme.typography.fontSize.sm
      },
      '& .rbc-today': {
        backgroundColor: theme.colors.primary + '20'
      },
      '& .rbc-event': {
        backgroundColor: theme.colors.primary,
        borderRadius: '4px',
        padding: '2px 4px',
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.medium
      },
      '& .rbc-event:hover': {
        backgroundColor: theme.colors.primary + 'CC'
      },
      '& .rbc-toolbar': {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
        gap: '10px'
      },
      '& .rbc-toolbar button': {
        backgroundColor: theme.colors.white,
        border: `1px solid ${theme.colors.neutral[300]}`,
        borderRadius: theme.borderRadius.base,
        padding: '8px 16px',
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text.primary,
        cursor: 'pointer',
        transition: theme.transitions.base
      },
      '& .rbc-toolbar button:hover': {
        backgroundColor: theme.colors.neutral[50],
        borderColor: theme.colors.primary
      },
      '& .rbc-toolbar button.rbc-active': {
        backgroundColor: theme.colors.primary,
        color: 'white',
        borderColor: theme.colors.primary
      },
      '& .rbc-toolbar-label': {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary
      },
      '& .rbc-month-view': {
        border: `1px solid ${theme.colors.neutral[200]}`,
        borderRadius: theme.borderRadius.lg
      },
      '& .rbc-time-view': {
        border: `1px solid ${theme.colors.neutral[200]}`,
        borderRadius: theme.borderRadius.lg
      },
      '& .rbc-day-bg': {
        borderColor: theme.colors.neutral[200]
      },
      '& .rbc-time-slot': {
        borderColor: theme.colors.neutral[200]
      },
      '& .rbc-time-header': {
        borderColor: theme.colors.neutral[200]
      },
      '& .rbc-time-header-content': {
        borderColor: theme.colors.neutral[200]
      },
      '& .rbc-day-slot .rbc-events-container': {
        marginRight: '0px'
      },
      '& .rbc-event-content': {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.medium
      },
      '& .rbc-agenda-view': {
        border: `1px solid ${theme.colors.neutral[200]}`,
        borderRadius: theme.borderRadius.lg
      },
      '& .rbc-agenda-date': {
        backgroundColor: theme.colors.neutral[50],
        color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.semibold
      },
      '& .rbc-agenda-event-cell': {
        borderBottom: `1px solid ${theme.colors.neutral[200]}`
      }
    }
  }

  return (
    <div style={styles.calendar}>
      <style>{`
        .rbc-header {
          background-color: ${theme.colors.primary} !important;
          color: white !important;
          padding: 10px !important;
          font-weight: ${theme.typography.fontWeight.semibold} !important;
          font-size: ${theme.typography.fontSize.sm} !important;
        }
        .rbc-today {
          background-color: ${theme.colors.primary}20 !important;
        }
        .rbc-event {
          background-color: ${theme.colors.primary} !important;
          border-radius: 4px !important;
          padding: 2px 4px !important;
          font-size: ${theme.typography.fontSize.xs} !important;
          font-weight: ${theme.typography.fontWeight.medium} !important;
        }
        .rbc-event:hover {
          background-color: ${theme.colors.primary}CC !important;
        }
        .rbc-toolbar {
          margin-bottom: 20px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          gap: 10px !important;
        }
        .rbc-toolbar button {
          background-color: ${theme.colors.white} !important;
          border: 1px solid ${theme.colors.neutral[300]} !important;
          border-radius: ${theme.borderRadius.base} !important;
          padding: 8px 16px !important;
          font-size: ${theme.typography.fontSize.sm} !important;
          font-weight: ${theme.typography.fontWeight.medium} !important;
          color: ${theme.colors.text.primary} !important;
          cursor: pointer !important;
          transition: ${theme.transitions.base} !important;
        }
        .rbc-toolbar button:hover {
          background-color: ${theme.colors.neutral[50]} !important;
          border-color: ${theme.colors.primary} !important;
        }
        .rbc-toolbar button.rbc-active {
          background-color: ${theme.colors.primary} !important;
          color: white !important;
          border-color: ${theme.colors.primary} !important;
        }
        .rbc-toolbar-label {
          font-size: ${theme.typography.fontSize.lg} !important;
          font-weight: ${theme.typography.fontWeight.bold} !important;
          color: ${theme.colors.text.primary} !important;
        }
        .rbc-month-view {
          border: 1px solid ${theme.colors.neutral[200]} !important;
          border-radius: ${theme.borderRadius.lg} !important;
        }
        .rbc-time-view {
          border: 1px solid ${theme.colors.neutral[200]} !important;
          border-radius: ${theme.borderRadius.lg} !important;
        }
        .rbc-day-bg {
          border-color: ${theme.colors.neutral[200]} !important;
        }
        .rbc-time-slot {
          border-color: ${theme.colors.neutral[200]} !important;
        }
        .rbc-time-header {
          border-color: ${theme.colors.neutral[200]} !important;
        }
        .rbc-time-header-content {
          border-color: ${theme.colors.neutral[200]} !important;
        }
        .rbc-day-slot .rbc-events-container {
          margin-right: 0px !important;
        }
        .rbc-event-content {
          font-size: ${theme.typography.fontSize.xs} !important;
          font-weight: ${theme.typography.fontWeight.medium} !important;
        }
        .rbc-agenda-view {
          border: 1px solid ${theme.colors.neutral[200]} !important;
          border-radius: ${theme.borderRadius.lg} !important;
        }
        .rbc-agenda-date {
          background-color: ${theme.colors.neutral[50]} !important;
          color: ${theme.colors.text.primary} !important;
          font-weight: ${theme.typography.fontWeight.semibold} !important;
        }
        .rbc-agenda-event-cell {
          border-bottom: 1px solid ${theme.colors.neutral[200]} !important;
        }
      `}</style>
      
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={view as any}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        date={date}
        onNavigate={handleNavigate}
        onView={handleView}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable={selectable}
        popup={popup}
        eventPropGetter={eventStyleGetter}
        showMultiDayTimes={true}
        step={30}
        timeslots={2}
        components={{
          toolbar: showToolbar ? undefined : () => null
        }}
      />
    </div>
  )
}
