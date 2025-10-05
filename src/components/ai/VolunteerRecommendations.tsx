import { useState, useEffect } from 'react'
import { useAI } from '../../hooks/useAI'
import { theme } from '../../theme'

interface Recommendation {
  eventId: string
  eventTitle: string
  matchScore: number
  reason: string
}

interface VolunteerRecommendationsProps {
  volunteerProfile: any
  availableEvents: any[]
  onEventSelect: (eventId: string) => void
}

export default function VolunteerRecommendations({ 
  volunteerProfile, 
  availableEvents, 
  onEventSelect 
}: VolunteerRecommendationsProps) {
  const { loading, error, generateVolunteerRecommendations } = useAI()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [personalizedMessage, setPersonalizedMessage] = useState<string>('')

  useEffect(() => {
    if (volunteerProfile && availableEvents.length > 0) {
      fetchRecommendations()
    }
  }, [volunteerProfile, availableEvents])

  const fetchRecommendations = async () => {
    const result = await generateVolunteerRecommendations(volunteerProfile, availableEvents)
    if (result) {
      setRecommendations(result.recommendations || [])
      setPersonalizedMessage(result.personalizedMessage || '')
    }
  }

  const styles = {
    container: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: '2rem',
      boxShadow: theme.shadows.lg,
      border: `1px solid ${theme.colors.neutral[200]}`,
      marginBottom: '2rem',
    } as React.CSSProperties,
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
    } as React.CSSProperties,
    icon: {
      fontSize: '2rem',
      marginRight: '1rem',
      color: theme.colors.primary,
    } as React.CSSProperties,
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      margin: 0,
    } as React.CSSProperties,
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginTop: '0.25rem',
    } as React.CSSProperties,
    personalizedMessage: {
      backgroundColor: theme.colors.primary[50],
      border: `1px solid ${theme.colors.primary[200]}`,
      borderRadius: theme.borderRadius.md,
      padding: '1rem',
      marginBottom: '1.5rem',
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      fontStyle: 'italic',
      lineHeight: 1.6,
    } as React.CSSProperties,
    recommendationCard: {
      backgroundColor: theme.colors.neutral[50],
      border: `1px solid ${theme.colors.neutral[200]}`,
      borderRadius: theme.borderRadius.md,
      padding: '1.5rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      transition: theme.transitions.base,
    } as React.CSSProperties,
    recommendationHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.75rem',
    } as React.CSSProperties,
    eventTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      margin: 0,
    } as React.CSSProperties,
    matchScore: {
      backgroundColor: theme.colors.success[100],
      color: theme.colors.success[800],
      padding: '0.25rem 0.75rem',
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
    } as React.CSSProperties,
    reason: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      lineHeight: 1.5,
      margin: 0,
    } as React.CSSProperties,
    loadingContainer: {
      textAlign: 'center' as const,
      padding: '2rem',
    } as React.CSSProperties,
    loadingSpinner: {
      display: 'inline-block',
      width: '24px',
      height: '24px',
      border: `3px solid ${theme.colors.neutral[300]}`,
      borderTop: `3px solid ${theme.colors.primary}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    } as React.CSSProperties,
    errorContainer: {
      backgroundColor: theme.colors.error[50],
      border: `1px solid ${theme.colors.error[200]}`,
      borderRadius: theme.borderRadius.md,
      padding: '1rem',
      color: theme.colors.error[800],
      fontSize: theme.typography.fontSize.sm,
    } as React.CSSProperties,
    emptyState: {
      textAlign: 'center' as const,
      padding: '2rem',
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.base,
    } as React.CSSProperties,
  }

  const handleRecommendationClick = (eventId: string) => {
    onEventSelect(eventId)
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={{ marginTop: '1rem', color: theme.colors.text.secondary }}>
            AI is analyzing your profile and finding the perfect volunteer opportunities...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <strong>Unable to load AI recommendations</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p>No AI recommendations available at the moment.</p>
          <p style={{ fontSize: theme.typography.fontSize.sm, marginTop: '0.5rem' }}>
            Check back later or browse all available events.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>🤖</span>
        <div>
          <h3 style={styles.title}>AI-Powered Recommendations</h3>
          <p style={styles.subtitle}>
            Personalized suggestions based on your profile and interests
          </p>
        </div>
      </div>

      {personalizedMessage && (
        <div style={styles.personalizedMessage}>
          "{personalizedMessage}"
        </div>
      )}

      {recommendations.map((rec, index) => (
        <div
          key={rec.eventId}
          style={{
            ...styles.recommendationCard,
            ':hover': {
              backgroundColor: theme.colors.primary[25],
              borderColor: theme.colors.primary[300],
            }
          }}
          onClick={() => handleRecommendationClick(rec.eventId)}
        >
          <div style={styles.recommendationHeader}>
            <h4 style={styles.eventTitle}>{rec.eventTitle}</h4>
            <span style={styles.matchScore}>
              {rec.matchScore}% match
            </span>
          </div>
          <p style={styles.reason}>{rec.reason}</p>
        </div>
      ))}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .recommendation-card:hover {
          background-color: ${theme.colors.primary[25]} !important;
          border-color: ${theme.colors.primary[300]} !important;
        }
      `}</style>
    </div>
  )
}
