# 🌟 Service Learning Management System

A comprehensive volunteer management platform built with React, TypeScript, and Supabase. This application streamlines volunteer coordination, event management, and community service tracking.

## ✨ Features

### 🔐 Authentication & User Management
- **Volunteer Registration & Login** - Secure user authentication
- **Admin Panel** - Dedicated administrative interface
- **Role-based Access Control** - Different permissions for volunteers and admins
- **Profile Management** - Comprehensive user profiles

### 📅 Event & Shift Management
- **Event Creation & Management** - Create and organize community service events
- **Shift Scheduling** - Assign volunteers to specific time slots
- **Real-time Updates** - Live updates for event availability
- **Registration System** - Easy event registration for volunteers

### 🤖 AI-Powered Features
- **Smart Recommendations** - AI suggests events based on volunteer preferences
- **Event Description Generation** - Automatically generate engaging event descriptions
- **Personalized Messaging** - AI-generated welcome and appreciation messages

### 📊 Analytics & Reporting
- **Volunteer Hours Tracking** - Comprehensive time tracking system
- **Performance Reports** - Detailed analytics for volunteers and events
- **Export Functionality** - Generate reports for record keeping

### 🏢 Admin Dashboard
- **Volunteer Management** - Oversee all volunteer activities
- **Event Oversight** - Manage and monitor all events
- **Data Analytics** - Insights into volunteer engagement
- **System Configuration** - Manage platform settings

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Built-in authentication

### AI Integration
- **OpenAI API** - GPT-4o-mini for AI features
- **Custom AI Hooks** - Reusable AI functionality

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Git** - Version control

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── ai/              # AI-powered components
│   ├── scheduling/      # Event and shift components
│   └── shared/          # Common UI elements
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Authentication logic
│   ├── useAI.ts         # AI functionality
│   └── useAdminAuth.tsx # Admin authentication
├── pages/               # Application pages/routes
│   ├── admin/           # Admin dashboard pages
│   ├── DashboardPage.tsx
│   ├── EventsPage.tsx
│   ├── LoginPage.tsx
│   └── ProfilePage.tsx
├── services/            # External service integrations
│   ├── supabaseClient.ts
│   └── openaiClient.ts
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
└── theme.ts             # Design system configuration
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- OpenAI API key (optional, for AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/krocks9903/ServiceLearningProject.git
cd ServiceLearningProject
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (Optional)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_OPENAI_MODEL=gpt-4o-mini
```

### 4. Database Setup
Run the SQL scripts in the `docs/database/` directory to set up your Supabase database:

```bash
# Execute these in your Supabase SQL editor:
docs/database/DATABASE_SETUP.sql
docs/database/ADMIN_SYSTEM_MIGRATION.sql
docs/database/ADD_SIGNUP_COLUMNS.sql
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database (Supabase)
- Database is hosted on Supabase
- Configure RLS policies as needed
- Set up proper backup strategies

## 📚 Documentation

- [AI Setup Guide](docs/AI_SETUP.md) - Configure AI features
- [Design System](docs/DESIGN_SYSTEM_COMPLETE.md) - UI/UX guidelines
- [Database Schema](docs/database/) - Database documentation
- [API Documentation](docs/API.md) - API endpoints and usage

## 🤝 Contributing

### Development Workflow
1. Create a feature branch from `main`
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

2. Make your changes and commit
```bash
git add .
git commit -m "Add: descriptive commit message"
```

3. Push and create a Pull Request
```bash
git push origin feature/your-feature-name
```

### Code Standards
- Use TypeScript for type safety
- Follow React best practices
- Write descriptive commit messages
- Add comments for complex logic
- Test your changes locally

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Krish Shah** - Project Lead & Full-Stack Development
- **Team Members** - Frontend & Backend Development

## 🔮 Roadmap

### Phase 1 ✅
- [x] Basic authentication system
- [x] Volunteer registration
- [x] Event management
- [x] Admin dashboard

### Phase 2 ✅
- [x] AI-powered recommendations
- [x] Advanced reporting
- [x] Mobile responsiveness
- [x] Real-time updates

### Phase 3 🚧
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with external calendar systems
- [ ] Automated email notifications

## 🆘 Support

For questions or issues:
1. Check the [documentation](docs/)
2. Search existing [GitHub issues](https://github.com/krocks9903/ServiceLearningProject/issues)
3. Create a new issue with detailed description

## 🙏 Acknowledgments

- Supabase for the amazing backend platform
- OpenAI for AI capabilities
- React and TypeScript communities
- All contributors and volunteers

---

**Made with ❤️ for community service management**