import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Required for client-side usage
})

export default openai

// AI Service functions for the volunteer management system
export const aiService = {
  // Generate personalized volunteer recommendations
  async generateVolunteerRecommendations(volunteerProfile: any, availableEvents: any[]) {
    try {
      const prompt = `
        You are an AI assistant helping match volunteers to opportunities at Harry Chapin Food Bank of SWFL.
        
        Volunteer Profile:
        - Name: ${volunteerProfile.first_name} ${volunteerProfile.last_name}
        - Skills: ${volunteerProfile.skills || 'Not specified'}
        - Interests: ${volunteerProfile.interests || 'Not specified'}
        - Availability: ${volunteerProfile.availability || 'Not specified'}
        
        Available Events:
        ${availableEvents.map(event => `
        - ${event.title}: ${event.description}
          Date: ${event.start_date}
          Location: ${event.location}
          Max Volunteers: ${event.max_volunteers}
        `).join('\n')}
        
        Please recommend the top 3 events that would be the best match for this volunteer, 
        considering their skills, interests, and availability. For each recommendation, 
        provide a brief explanation of why it's a good match.
        
        Format your response as JSON with this structure:
        {
          "recommendations": [
            {
              "eventId": "event_id",
              "eventTitle": "event_title",
              "matchScore": 85,
              "reason": "Brief explanation of why this is a good match"
            }
          ],
          "personalizedMessage": "A personalized message encouraging the volunteer"
        }
      `

      const response = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content
      return content ? JSON.parse(content) : null
    } catch (error) {
      console.error('Error generating volunteer recommendations:', error)
      return null
    }
  },


  // Generate personalized volunteer welcome message
  async generateWelcomeMessage(volunteerProfile: any) {
    try {
      const prompt = `
        Create a warm, personalized welcome message for a new volunteer at Harry Chapin Food Bank of SWFL.
        
        Volunteer Details:
        - Name: ${volunteerProfile.first_name} ${volunteerProfile.last_name}
        - Background: ${volunteerProfile.background || 'Community volunteer'}
        - Interests: ${volunteerProfile.interests || 'Helping the community'}
        
        The message should:
        1. Be warm and personal
        2. Thank them for joining the mission
        3. Explain the impact they'll make
        4. Be encouraging and supportive
        5. Be approximately 80-120 words
        
        Write as if from Ashley Fanslau, Volunteer Coordinator.
      `

      const response = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 200,
      })

      return response.choices[0]?.message?.content || null
    } catch (error) {
      console.error('Error generating welcome message:', error)
      return null
    }
  },

  // Generate volunteer appreciation message
  async generateAppreciationMessage(volunteerProfile: any, hoursLogged: number) {
    try {
      const prompt = `
        Create a heartfelt appreciation message for a volunteer at Harry Chapin Food Bank of SWFL.
        
        Volunteer Details:
        - Name: ${volunteerProfile.first_name} ${volunteerProfile.last_name}
        - Hours Logged: ${hoursLogged}
        - Recent Activity: Active volunteer
        
        The message should:
        1. Express genuine gratitude
        2. Highlight their specific impact
        3. Be personal and warm
        4. Encourage continued participation
        5. Be approximately 60-100 words
        
        Write as if from Ashley Fanslau, Volunteer Coordinator.
      `

      const response = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 150,
      })

      return response.choices[0]?.message?.content || null
    } catch (error) {
      console.error('Error generating appreciation message:', error)
      return null
    }
  },

  // Generate event reminders
  async generateEventReminder(eventData: any, volunteerProfile: any) {
    try {
      const prompt = `
        Create a friendly reminder message for an upcoming volunteer event at Harry Chapin Food Bank of SWFL.
        
        Event Details:
        - Title: ${eventData.title}
        - Date: ${eventData.start_date}
        - Time: ${eventData.start_time}
        - Location: ${eventData.location}
        
        Volunteer: ${volunteerProfile.first_name} ${volunteerProfile.last_name}
        
        The message should:
        1. Be friendly and encouraging
        2. Include important event details
        3. Remind about requirements (closed-toe shoes, etc.)
        4. Express excitement about their participation
        5. Be approximately 80-120 words
      `

      const response = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      })

      return response.choices[0]?.message?.content || null
    } catch (error) {
      console.error('Error generating event reminder:', error)
      return null
    }
  }
}
