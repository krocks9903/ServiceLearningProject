# Harry Chapin Food Bank - Volunteer Portal
## Project Structure

Last Updated: December 1, 2025

---

## 📁 Clean & Organized File Structure

```
ServiceLearningProject/
│
├── config/                  # All configuration files
│   ├── eslint.config.js    # ESLint configuration
│   ├── playwright.config.ts # E2E test configuration
│   ├── .prettierrc         # Code formatting
│   ├── tsconfig.json       # Main TypeScript config
│   ├── tsconfig.app.json   # App TypeScript config
│   ├── tsconfig.node.json  # Node TypeScript config
│   ├── vite.config.ts      # Vite build config
│   └── vitest.config.ts    # Unit test config
│
├── docs/                   # Public documentation
│   ├── ADMIN_FEATURES_IMPLEMENTATION.md
│   ├── CONTRIBUTING.md
│   ├── DESIGN_SYSTEM_COMPLETE.md
│   ├── PROJECT_STRUCTURE.md
│   └── TESTING.md
│
├── INTERNAL_DOCS/          # Private docs (not in git)
│   ├── database/           # Database migration scripts
│   ├── .env.local          # Local environment vars
│   └── SECURITY_ALERT.md
│
├── public/                 # Static assets
│   ├── images/
│   └── vite.svg
│
├── src/                    # Source code
│   │
│   ├── components/         # React components
│   │   ├── admin/         # Admin components (with index.ts)
│   │   │   ├── ShiftManagementModal.tsx
│   │   │   ├── VolunteerAssignmentsModal.tsx
│   │   │   ├── VolunteerDetailsModal.tsx
│   │   │   ├── VolunteerReportModal.tsx
│   │   │   └── index.ts   # Barrel export
│   │   │
│   │   ├── scheduling/    # Scheduling components (with index.ts)
│   │   │   ├── EventRegistrationModal.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── shared/        # Shared components (with index.ts)
│   │       ├── Calendar.tsx
│   │       ├── DatePicker.tsx
│   │       ├── Navbar.tsx
│   │       └── index.ts
│   │
│   ├── constants/         # Constants and theme
│   │   ├── theme.ts       # Design system
│   │   └── index.ts
│   │
│   ├── hooks/             # Custom React hooks (with index.ts)
│   │   ├── useAuth.tsx
│   │   ├── useAdminAuth.tsx
│   │   ├── useSupabase.ts
│   │   └── index.ts       # Barrel export
│   │
│   ├── pages/             # Page components
│   │   ├── admin/        # Admin pages
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminVolunteersPage.tsx
│   │   │   ├── AdminShiftsPage.tsx
│   │   │   ├── AdminHoursPage.tsx
│   │   │   └── AdminLoginPage.tsx
│   │   │
│   │   ├── Home.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── KioskPage.tsx
│   │
│   ├── services/          # External services (with index.ts)
│   │   ├── api.ts
│   │   ├── supabaseClient.ts
│   │   └── index.ts
│   │
│   ├── test/              # Test utilities
│   │   ├── setup.ts
│   │   └── utils.tsx
│   │
│   ├── types/             # TypeScript types (with index.ts)
│   │   ├── event.d.ts
│   │   ├── volunteer.ts
│   │   └── index.ts
│   │
│   ├── utils/             # Utility functions (with index.ts)
│   │   ├── formatDate.ts
│   │   ├── validations.ts
│   │   └── index.ts
│   │
│   ├── App.css            # App-level styles
│   ├── App.tsx            # Main app component
│   ├── index.css          # Global styles
│   ├── main.tsx           # App entry point
│   └── vite-env.d.ts      # Vite type definitions
│
├── tests/                 # E2E and acceptance tests
│   ├── e2e/
│   └── acceptance/
│
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
├── index.html            # HTML entry point
├── package.json          # Dependencies
├── README.md             # Documentation
├── tsconfig.json         # TS config reference
└── vite.config.ts        # Vite config reference

```

---

## 🎯 Clean Import Paths with Path Aliases

### Before (Messy Relative Paths):
```typescript
import { useAuth } from "../../../hooks/useAuth"
import { theme } from "../../../theme"
import Calendar from "../../../components/shared/Calendar"
import { supabase } from "../../../services/supabaseClient"
```

### After (Clean Path Aliases):
```typescript
import { useAuth } from "@hooks"
import { theme } from "@constants"
import { Calendar } from "@components/shared"
import { supabase } from "@services"
```

### Available Path Aliases:
- `@/*` - Root src folder
- `@components/*` - Components
- `@hooks/*` - Custom hooks  
- `@services/*` - Services/API
- `@utils/*` - Utilities
- `@types/*` - TypeScript types
- `@constants/*` - Constants/theme
- `@pages/*` - Page components

### Barrel Exports (index.ts)

Each major folder exports everything through `index.ts`:

```typescript
// hooks/index.ts
export { useAuth, AuthProvider } from './useAuth'
export { useAdminAuth, AdminAuthProvider } from './useAdminAuth'
export { useSupabase } from './useSupabase'

// Usage anywhere:
import { useAuth, useAdminAuth, useSupabase } from '@hooks'
```

---

## 🎯 Active Components Breakdown

### **Navigation (1 component)**
- ✅ `Navbar.tsx` - Professional sticky navigation with active states, user avatar

### **Pages (9 pages)**
1. ✅ `Home.tsx` - Landing page with hero, stats, and program cards
2. ✅ `LoginPage.tsx` - User authentication
3. ✅ `SignupPage.tsx` - Comprehensive volunteer registration form
4. ✅ `DashboardPage.tsx` - Volunteer dashboard with stats and actions
5. ✅ `EventsPage.tsx` - Browse and register for volunteer events
6. ✅ `ProfilePage.tsx` - Edit user profile
7. ✅ `AdminPage.tsx` - Admin dashboard (role-protected)
8. ✅ `ReportsPage.tsx` - Reporting and analytics (role-protected)
9. ✅ `KioskPage.tsx` - Check-in/out kiosk

### **Hooks (2 hooks)**
1. ✅ `useAuth.tsx` - Authentication, user state, profile management
2. ✅ `useSupabase.ts` - Supabase helper functions

### **Services (2 services)**
1. ✅ `supabaseClient.ts` - Supabase initialization and configuration
2. ✅ `api.ts` - API utilities

### **Types (2 type files)**
1. ✅ `event.d.ts` - Event-related TypeScript interfaces
2. ✅ `volunteer.d.ts` - Volunteer-related TypeScript interfaces

### **Utils (2 utilities)**
1. ✅ `formatDate.ts` - Date formatting functions
2. ✅ `validations.ts` - Form validation utilities

### **Core Files (3 files)**
1. ✅ `App.tsx` - Main app component with routing and footer
2. ✅ `theme.ts` - Professional SaaS design system
3. ✅ `index.css` - Global styles and CSS variables

---

## 🗑️ Cleaned Up (Empty/Unused Files Removed)

### Removed Empty Components:
- ❌ `components/auth/LoginForm.tsx` (empty)
- ❌ `components/auth/SignupForm.tsx` (empty)
- ❌ `components/dashboard/Dashboard.tsx` (empty)
- ❌ `components/shared/Button.tsx` (empty)
- ❌ `components/shared/Modal.tsx` (empty)
- ❌ `components/kiosk/KioskCheckIn.tsx` (unused)
- ❌ `components/kiosk/KioskCheckOut.tsx` (unused)

### Removed Documentation:
- ❌ `IMPLEMENTATION_GUIDE.md` (outdated)
- ❌ `FEATURES_SUMMARY.md` (outdated)
- ❌ `QUICK_START.md` (outdated)
- ❌ `SCHEMA_ALIGNMENT.md` (outdated)
- ❌ `README_UPDATES.md` (outdated)
- ❌ `START_HERE.md` (outdated)
- ❌ `SECURITY_FIX.md` (outdated)

---

## 📊 Statistics

- **Total Active Files**: 24
- **Components**: 1
- **Pages**: 9
- **Hooks**: 2
- **Services**: 2
- **Types**: 2
- **Utils**: 2
- **Core Files**: 3
- **Config Files**: 3

---

## 🎨 Design System

All components follow the professional SaaS design system defined in `theme.ts`:

- **Typography**: Inter font family, 10-level scale (xs to 6xl)
- **Colors**: Brand colors (red, navy) + neutral scale (50-900)
- **Spacing**: 8px base unit system
- **Shadows**: 4 levels (sm, md, lg, xl)
- **Transitions**: Consistent timing (150ms, 200ms, 300ms)
- **Border Radius**: 6 levels (none to xl)

---

## 🔐 Security Features

1. **Role-Based Access Control (RBAC)**
   - Admin pages protected with `isAdmin` checks
   - Automatic redirects for unauthorized access

2. **Authentication**
   - Supabase Auth integration
   - Profile management
   - Session handling

3. **Data Protection**
   - Row Level Security (RLS) in Supabase
   - Protected API endpoints
   - Secure password requirements (8+ characters)

---

## 🚀 Key Features

### For Volunteers:
- ✅ Comprehensive registration form (30+ fields)
- ✅ Personal dashboard
- ✅ Browse and register for events
- ✅ Profile management
- ✅ Check-in/out kiosk

### For Admins:
- ✅ Admin dashboard
- ✅ Reports and analytics
- ✅ Event management
- ✅ Volunteer oversight

---

## 📝 Database Tables

- `profiles` - Volunteer information
- `events` - Volunteer opportunities
- `shifts` - Event time slots
- `hour_logs` - Logged volunteer hours
- `volunteer_assignments` - Event registrations
- `onboarding_items` - Required onboarding tasks
- `volunteer_onboarding` - Completion tracking
- `achievements` - Volunteer achievements
- `organizations` - Partner organizations
- `sites` - Physical locations

---

## 🎯 Next Steps

### Recommended Enhancements:
1. Add image lazy loading for performance
2. Implement dark mode toggle
3. Add skeleton loaders for better UX
4. Create reusable UI components library
5. Add unit and integration tests
6. Implement PWA features
7. Add analytics tracking

### Database Enhancements:
1. Create indexes for common queries
2. Add database triggers for automation
3. Implement backup strategy
4. Add data validation constraints

---

## 📚 Documentation

- `DESIGN_SYSTEM_COMPLETE.md` - Complete design system guide
- `DATABASE_SETUP.sql` - Database schema and setup
- `ADD_SIGNUP_COLUMNS.sql` - Additional signup columns
- `PROJECT_STRUCTURE.md` - This file

---

**Status**: ✅ Production Ready
**Last Cleanup**: 2025-10-02
**Files Removed**: 14 empty/unused files
**Active Components**: All working and organized

