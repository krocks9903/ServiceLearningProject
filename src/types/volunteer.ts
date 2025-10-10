export interface Volunteer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  status: string
  created_at: string
  total_hours: number
  events_attended: number
  last_volunteer_date: string | null
  // Additional comprehensive fields
  date_of_birth?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
  }
  emergency_contact_name?: string
  emergency_contact_phone?: string
  t_shirt_size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  skills?: string[]
  tags?: string[]
  profile_photo_url?: string
  updated_at?: string
  role?: string
  groups?: string[]
  verified_hours?: number
  pending_hours?: number
}

export interface VolunteerDetails extends Volunteer {
  // Additional detailed information for the modal
  onboarding_status?: {
    item: string
    completed: boolean
    completed_at?: string
  }[]
  recent_activities?: {
    type: string
    description: string
    date: string
  }[]
  achievements?: {
    name: string
    description: string
    earned_at: string
  }[]
}

export interface VolunteerReport {
  volunteer: VolunteerDetails
  summary: {
    total_hours: number
    verified_hours: number
    pending_hours: number
    events_attended: number
    average_hours_per_event: number
    first_volunteer_date: string
    last_volunteer_date: string
    days_since_last_activity: number
  }
  activities: {
    recent_shifts: any[]
    recent_achievements: any[]
    upcoming_events: any[]
  }
}
