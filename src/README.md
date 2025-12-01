# Source Code Organization

## Quick Reference

### Import from anywhere using path aliases:

```typescript
// Hooks
import { useAuth, useAdminAuth } from "@hooks";

// Components
import { Navbar, Calendar } from "@components/shared";
import { ShiftManagementModal } from "@components/admin";
import { EventRegistrationModal } from "@components/scheduling";

// Services
import { supabase } from "@services";

// Types
import type { Event, VolunteerDetails } from "@types";

// Utils
import { formatDate, validateEmail } from "@utils";

// Constants
import { theme } from "@constants";
```

## Folder Purpose

- **components/** - Reusable React components
  - **admin/** - Admin-only components
  - **scheduling/** - Event/scheduling components
  - **shared/** - Common components used everywhere

- **constants/** - App-wide constants (theme, config)

- **hooks/** - Custom React hooks for state/logic

- **pages/** - Page-level components (routes)
  - **admin/** - Admin-only pages

- **services/** - External API/service integrations

- **test/** - Test utilities and setup

- **types/** - TypeScript type definitions

- **utils/** - Pure utility functions

## Adding New Files

1. Create your file in the appropriate folder
2. Add export to that folder's `index.ts`
3. Import using path alias: `@folder`

Example:

```typescript
// Create: hooks/useMyHook.ts
export function useMyHook() { ... }

// Add to: hooks/index.ts
export { useMyHook } from './useMyHook'

// Use anywhere:
import { useMyHook } from '@hooks'
```
