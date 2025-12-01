import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider } from '../hooks/useAuth'
import { AdminAuthProvider } from '../hooks/useAdminAuth'

// Mock Supabase client for testing
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
}

// Custom render function that includes providers
interface AllTheProvidersProps {
  children: React.ReactNode
  includeAuth?: boolean
  includeAdmin?: boolean
}

const AllTheProviders = ({ 
  children, 
  includeAuth = true,
  includeAdmin = false 
}: AllTheProvidersProps) => {
  let content = children

  if (includeAdmin) {
    content = <AdminAuthProvider>{content}</AdminAuthProvider>
  }

  if (includeAuth) {
    content = <AuthProvider>{content}</AuthProvider>
  }

  return (
    <BrowserRouter>
      {content}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    includeAuth?: boolean
    includeAdmin?: boolean
  }
) => {
  const { includeAuth = true, includeAdmin = false, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders 
        includeAuth={includeAuth} 
        includeAdmin={includeAdmin}
        {...props}
      />
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Helper to create mock user
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {},
  ...overrides,
})

// Helper to create mock profile
export const createMockProfile = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'volunteer',
  ...overrides,
})

