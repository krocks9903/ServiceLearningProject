# UI Components Library

A comprehensive collection of reusable React components for building consistent and accessible user interfaces.

## Components

### Skeleton Loaders
Provide visual feedback while content is loading.

**Available Components:**
- `Skeleton` - Base skeleton component
- `SkeletonCard` - Card-shaped skeleton
- `SkeletonListItem` - List item skeleton
- `SkeletonTableRow` - Table row skeleton
- `SkeletonText` - Text block skeleton
- `SkeletonDashboardCard` - Dashboard card skeleton
- `SkeletonEventCard` - Event card skeleton
- `SkeletonTable` - Full table skeleton

**Usage:**
```tsx
import { SkeletonCard, SkeletonListItem } from '@components/shared'

// While loading
if (loading) {
  return (
    <div>
      <SkeletonCard />
      <SkeletonListItem showAvatar />
    </div>
  )
}
```

### Button
Versatile button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `fullWidth`: boolean
- `icon`: ReactNode
- `iconPosition`: 'left' | 'right'

**Usage:**
```tsx
import { Button } from '@components/shared'

<Button variant="primary" size="md" isLoading={submitting}>
  Submit
</Button>
```

### Card
Container component for grouping related content.

**Components:**
- `Card` - Main card container
- `CardHeader` - Card header section
- `CardBody` - Card content area
- `CardFooter` - Card footer section

**Props:**
- `variant`: 'default' | 'outlined' | 'elevated'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hoverable`: boolean
- `onClick`: function

**Usage:**
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@components/shared'

<Card variant="elevated" hoverable>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>
    Content goes here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Input & TextArea
Form input components with labels, errors, and helper text.

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `fullWidth`: boolean
- `inputSize`: 'sm' | 'md' | 'lg'
- `icon`: ReactNode
- `iconPosition`: 'left' | 'right'

**Usage:**
```tsx
import { Input, TextArea } from '@components/shared'

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  fullWidth
/>

<TextArea
  label="Description"
  rows={4}
  helperText="Enter a detailed description"
/>
```

### Badge
Display status or category indicators.

**Props:**
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'

**Usage:**
```tsx
import { Badge } from '@components/shared'

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
```

### Spinner
Loading indicators for async operations.

**Components:**
- `Spinner` - Simple spinner
- `SpinnerOverlay` - Full-screen spinner with message

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `color`: string

**Usage:**
```tsx
import { Spinner, SpinnerOverlay } from '@components/shared'

<Spinner size="md" />

{isProcessing && <SpinnerOverlay message="Processing..." />}
```

### Alert
Display important messages and notifications.

**Props:**
- `variant`: 'info' | 'success' | 'warning' | 'danger'
- `title`: string
- `dismissible`: boolean
- `onDismiss`: function
- `icon`: ReactNode

**Usage:**
```tsx
import { Alert } from '@components/shared'

<Alert variant="success" title="Success!" dismissible onDismiss={handleClose}>
  Your changes have been saved.
</Alert>
```

### Modal
Dialog component for focused interactions.

**Components:**
- `Modal` - Main modal container
- `ModalFooter` - Modal footer for actions

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `closeOnOverlayClick`: boolean
- `showCloseButton`: boolean

**Usage:**
```tsx
import { Modal, ModalFooter, Button } from '@components/shared'

<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm Action">
  <p>Are you sure you want to continue?</p>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

## Features

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

### Dark Mode
All components support dark mode automatically using CSS media queries.

### Responsive
Components adapt to different screen sizes and devices.

### Customizable
All components accept `className` and `style` props for custom styling.

## Import Patterns

```tsx
// Import individual components
import { Button, Card, Input } from '@components/shared'

// Import with types
import { Button, type ButtonProps } from '@components/shared'

// Import specific skeleton loaders
import { SkeletonCard, SkeletonListItem } from '@components/shared'
```

## Demo Page

Visit `/ui-components-demo` to see all components in action with interactive examples.
