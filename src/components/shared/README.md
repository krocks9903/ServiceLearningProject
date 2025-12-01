# Shared Components Library

A comprehensive collection of reusable React components organized by category for building consistent and accessible user interfaces.

## Directory Structure

```
shared/
├── ui/              # Core UI components
│   ├── Button      - Versatile button with variants and sizes
│   ├── Card        - Container component with sections
│   └── Badge       - Status and label indicators
├── form/            # Form input components
│   ├── Input       - Text input with validation
│   ├── TextArea    - Multi-line text input
│   └── DatePicker  - Date selection component
├── layout/          # Layout and container components
│   └── Modal       - Dialog for focused interactions
├── feedback/        # User feedback components
│   ├── Alert       - Notification messages
│   ├── Spinner     - Loading indicators
│   └── Skeleton    - Loading state placeholders
├── navigation/      # Navigation components
│   ├── Navbar      - Application navigation bar
│   └── Calendar    - Calendar view component
└── index.ts         # Barrel exports
```

## Usage

All components are exported from the shared index:

```tsx
import { Button, Card, Alert, Spinner } from '@components/shared'
```

## Component Categories

### UI Components (`ui/`)
Core interface elements for building user interfaces.
- **Button**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Card**: Container with header, body, and footer sections
- **Badge**: Status indicators with color variants

### Form Components (`form/`)
Input fields and form controls with validation support.
- **Input**: Text input with labels, errors, and helper text
- **TextArea**: Multi-line text input
- **DatePicker**: Date selection with validation

### Layout Components (`layout/`)
Structural components for organizing content.
- **Modal**: Dialog component with backdrop and close handling

### Feedback Components (`feedback/`)
Components for providing user feedback and loading states.
- **Alert**: Notification messages with variants (info, success, warning, danger)
- **Spinner**: Loading indicators with size options
- **Skeleton**: Loading placeholders (Card, List, Table, Dashboard, Event)

### Navigation Components (`navigation/`)
Components for site navigation and date selection.
- **Navbar**: Main navigation bar
- **Calendar**: Calendar view for events and scheduling

## Features

- **Accessibility**: Proper ARIA labels, keyboard navigation, focus management
- **Dark Mode**: Automatic support using CSS media queries
- **Responsive**: Adapts to different screen sizes
- **Customizable**: All components accept `className` and `style` props
- **TypeScript**: Full type safety with exported prop types

## Import Patterns

```tsx
// Import components
import { Button, Card, Input } from '@components/shared'

// Import with types
import { Button, type ButtonProps } from '@components/shared'

// Import skeleton loaders
import { SkeletonCard, SkeletonListItem } from '@components/shared'
```

## Demo Page

Visit `/ui-components-demo` to see all components in action with interactive examples.

For detailed component API documentation, see the individual component files in each category folder.
