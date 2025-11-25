# Service Learning Management System

A comprehensive volunteer management platform built with modern web technologies to streamline community service coordination and enhance volunteer engagement.

## Overview

This platform serves as a centralized hub for managing volunteer activities, events, and community service programs. Built with a focus on user experience, scalability, and maintainability, it provides both volunteer-facing features and administrative tools for program coordinators.

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **AI Integration**: OpenAI GPT-4 for intelligent recommendations
- **Styling**: CSS3 with custom design system
- **Development**: ESLint, Prettier, Husky for code quality

## Development Methodology

This project was developed using a combination of **Rapid Prototyping**, **Iterative Development**, and **Incremental Delivery** methodologies:

### Rapid Prototyping
- Initial MVP was built quickly to validate core concepts
- Focused on essential features: authentication, volunteer registration, event management
- Used modern tooling (Vite, React 19) for fast development cycles
- Leveraged Supabase for rapid backend setup

### Iterative Development
- Continuous refinement of features based on user feedback
- Regular code reviews and refactoring
- Progressive enhancement of UI/UX components
- Database schema evolution through migration scripts

### Incremental Delivery
- Features delivered in small, manageable increments
- Each increment builds upon previous functionality
- Modular architecture allows for independent feature development
- Version-controlled releases with clear feature sets

## Features

### Core Functionality
- **User Authentication**: Secure login/signup with role-based access
- **Volunteer Management**: Comprehensive volunteer profiles and tracking
- **Event Management**: Create, manage, and track volunteer events
- **Admin Dashboard**: Administrative tools for program oversight
- **Real-time Updates**: Live data synchronization across the platform

### Advanced Features
- **AI-Powered Recommendations**: Intelligent volunteer-event matching
- **Reporting System**: Comprehensive analytics and reporting tools
- **Kiosk Mode**: Check-in/out functionality for physical locations
- **Responsive Design**: Mobile-first approach for all devices

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── ai/             # AI integration components
│   ├── scheduling/     # Event scheduling components
│   └── shared/         # Shared components
├── hooks/              # Custom React hooks
├── pages/              # Application pages
│   └── admin/          # Admin pages
├── services/           # External service integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── theme.ts            # Design system configuration
```

## Setup Instructions

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm or yarn package manager
- Git
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ServiceLearningProject.git
   cd ServiceLearningProject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL scripts in `docs/database/` to set up your database schema
   - Configure Row Level Security (RLS) policies as needed

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## Database Schema

The application uses the following main database tables:

- **profiles** - User profile information
- **events** - Volunteer events and opportunities
- **shifts** - Event time slots
- **hour_logs** - Volunteer hour tracking
- **volunteer_assignments** - Event registrations
- **organizations** - Partner organizations
- **sites** - Physical locations

## Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row Level Security (RLS) policies
- **Input Validation**: Client and server-side validation
- **Secure Headers**: HTTPS enforcement and security headers

## Performance Optimizations

- **Code Splitting**: Dynamic imports for route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Builds**: Vite's optimized production builds
- **Caching**: Supabase real-time subscriptions with caching
- **Image Optimization**: Responsive images and lazy loading

## Contributing

Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

The project implements a comprehensive testing strategy covering all five levels of testing:

### Testing Levels

1. **Unit Testing** - Component-level testing (`src/**/*.test.{ts,tsx}`)
   - Tests individual functions and components in isolation
   - Fast execution with mocked dependencies
   - Run: `npm run test:unit`

2. **Integration Testing** - Component interaction testing (`src/**/*.integration.test.{ts,tsx}`)
   - Tests how components work together
   - Includes API/service integration
   - Run: `npm run test:integration`

3. **Product Testing (E2E)** - End-to-end application testing (`tests/e2e/*.spec.ts`)
   - Tests complete user workflows
   - Runs in real browser environments
   - Run: `npm run test:e2e`

4. **Acceptance Testing** - Business requirement validation (`tests/acceptance/*.spec.ts`)
   - Validates business requirements and user stories
   - Tests from user perspective
   - Run: `npm run test:acceptance`

5. **Regression Testing** - Automated test suite execution
   - Runs all tests to ensure no regressions
   - Integrated with CI/CD pipeline
   - Run: `npm run test:regression` or `npm run test:all`

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test suite
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # E2E tests only
npm run test:acceptance   # Acceptance tests only

# Generate coverage report
npm run test:coverage

# Watch mode (unit and integration)
npm run test:watch

# Test UI
npm run test:ui
```

### Test Coverage

- Target: 80%+ code coverage for unit tests
- Coverage reports generated in `coverage/` directory
- HTML, JSON, and LCOV formats available

For detailed testing documentation, see [TESTING.md](docs/TESTING.md)

For presentation guide, see [TESTING_PRESENTATION.md](docs/TESTING_PRESENTATION.md)

## Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform**
   - Vercel (recommended for frontend)
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

3. **Configure environment variables** in your hosting platform

4. **Set up Supabase** for production database and authentication

### Environment Variables

Ensure the following environment variables are set in production:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_OPENAI_API_KEY` - Your OpenAI API key (if using AI features)

## API Documentation

The application integrates with Supabase for backend services. Key API endpoints include:

- **Authentication**: User login, signup, and session management
- **Volunteers**: CRUD operations for volunteer profiles
- **Events**: Event creation, management, and registration
- **Analytics**: Reporting and data aggregation

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed and Node.js version is compatible
2. **Database Connection**: Verify Supabase credentials and project status
3. **Authentication Issues**: Check Supabase Auth configuration and RLS policies
4. **Performance Issues**: Review browser console for errors and check network requests

### Getting Help

- Check the [Issues](https://github.com/your-username/ServiceLearningProject/issues) page
- Review the [Documentation](docs/) folder
- Contact the development team

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies and best practices
- Designed for scalability and maintainability
- Community-driven development approach
- Special thanks to all contributors and volunteers

---

**Built with precision. Designed for impact.**