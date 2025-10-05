import { useState } from 'react'
import { aiService } from '../services/openaiClient'

export const useAI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateVolunteerRecommendations = async (volunteerProfile: any, availableEvents: any[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const recommendations = await aiService.generateVolunteerRecommendations(volunteerProfile, availableEvents)
      return recommendations
    } catch (err) {
      setError('Failed to generate recommendations')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }


  const generateWelcomeMessage = async (volunteerProfile: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const message = await aiService.generateWelcomeMessage(volunteerProfile)
      return message
    } catch (err) {
      setError('Failed to generate welcome message')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const generateAppreciationMessage = async (volunteerProfile: any, hoursLogged: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const message = await aiService.generateAppreciationMessage(volunteerProfile, hoursLogged)
      return message
    } catch (err) {
      setError('Failed to generate appreciation message')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const generateEventReminder = async (eventData: any, volunteerProfile: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const reminder = await aiService.generateEventReminder(eventData, volunteerProfile)
      return reminder
    } catch (err) {
      setError('Failed to generate event reminder')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    generateVolunteerRecommendations,
    generateWelcomeMessage,
    generateAppreciationMessage,
    generateEventReminder
  }
}
