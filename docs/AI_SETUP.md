# AI Integration Setup Guide

## Environment Variables

Create a `.env.local` file in the root of your project with the following content:

```bash
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4o-mini

# Your existing Supabase configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## AI Features Implemented

### 1. 🤖 AI-Powered Volunteer Recommendations
- **Location**: Events page (for logged-in volunteers)
- **Features**:
  - Personalized event recommendations based on volunteer profile
  - Match scoring and reasoning
  - Personalized motivational messages
  - Click to register for recommended events

### 2. ✍️ AI Event Description Generator
- **Location**: Admin Shifts page (for administrators)
- **Features**:
  - Generate engaging event descriptions
  - Professional, community-focused tone
  - One-click application to events
  - Preview before applying

### 3. 🛠️ AI Service Functions
- **File**: `src/services/openaiClient.ts`
- **Available Functions**:
  - `generateVolunteerRecommendations()`
  - `generateEventDescription()`
  - `generateWelcomeMessage()`
  - `generateAppreciationMessage()`
  - `generateEventReminder()`

### 4. 🎣 Custom AI Hook
- **File**: `src/hooks/useAI.ts`
- **Features**:
  - Loading states
  - Error handling
  - Easy-to-use AI functions

## How to Use

### For Volunteers:
1. Log in to the application
2. Go to the Events page
3. See AI-powered recommendations at the top
4. Click on recommended events to register

### For Administrators:
1. Log in as admin
2. Go to Admin > Events Management
3. Click "🤖 AI Description" on any event
4. Generate and apply AI-generated descriptions

## API Usage

The AI features use the OpenAI GPT-4o-mini model for:
- **Cost-effective**: ~$0.00015 per 1K input tokens, ~$0.0006 per 1K output tokens
- **Fast responses**: Optimized for quick generation
- **Quality output**: Professional, contextual responses

## Security Notes

- API keys are stored in environment variables
- Keys are prefixed with `VITE_` for client-side access
- Consider implementing server-side API calls for production

## Troubleshooting

### Common Issues:
1. **API Key Error**: Ensure your `.env.local` file is in the project root
2. **CORS Issues**: OpenAI API calls are made from the client
3. **Rate Limits**: OpenAI has usage limits based on your account

### Testing:
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test with a simple AI generation first

## Future Enhancements

Potential AI features to add:
- 📧 Automated volunteer communications
- 📊 Predictive analytics for volunteer turnout
- 🎯 Smart shift scheduling optimization
- 💬 AI chatbot for volunteer support
- 📈 Volunteer engagement scoring
