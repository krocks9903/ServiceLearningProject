import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AdminAuthProvider, useAdminAuth } from './useAdminAuth'
import { supabase } from '../services/supabaseClient'

// Mock Supabase client
vi.mock('../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}))

describe('useAdminAuth Hook - Unit Tests', () => {
  const mockUnsubscribe = vi.fn()
  const mockOnAuthStateChange = vi.fn(() => ({
    data: {
      subscription: {
        unsubscribe: mockUnsubscribe,
      },
    },
  }))

  beforeEach(() => {
    vi.clearAllMocks()
    ;(supabase.auth.onAuthStateChange as any) = mockOnAuthStateChange
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should provide admin auth context to children', () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('profile')
    expect(result.current).toHaveProperty('isAdmin')
    expect(result.current).toHaveProperty('loading')
    expect(result.current).toHaveProperty('signOut')
  })

  it('should throw error when used outside AdminAuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAdminAuth())
    }).toThrow('useAdminAuth must be used within an AdminAuthProvider')

    consoleSpy.mockRestore()
  })

  it('should initialize with loading state', () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current.loading).toBeDefined()
  })

  it('should set user and profile when admin session exists', async () => {
    const mockUser = {
      id: 'admin-123',
      email: 'admin@example.com',
    }

    const mockAdminProfile = {
      id: 'admin-123',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      status: 'active',
    }

    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
    })

    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockAdminProfile,
        error: null,
      }),
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 }
    )

    await waitFor(
      () => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.profile).toEqual(mockAdminProfile)
        expect(result.current.isAdmin).toBe(true)
      },
      { timeout: 3000 }
    )
  })

  it('should set isAdmin to false when profile role is not admin', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
    }

    const mockVolunteerProfile = {
      id: 'user-123',
      email: 'user@example.com',
      first_name: 'Regular',
      last_name: 'User',
      role: 'volunteer',
      status: 'active',
    }

    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
    })

    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockVolunteerProfile,
        error: null,
      }),
    })

    ;(supabase.auth.signOut as any).mockResolvedValue({})

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 }
    )

    // When user is not admin, profile should be null and they should be signed out
    await waitFor(
      () => {
        expect(result.current.profile).toBeNull()
        expect(result.current.isAdmin).toBe(false)
      },
      { timeout: 3000 }
    )
  })

  it('should handle profile fetch error gracefully', async () => {
    const mockUser = {
      id: 'admin-123',
      email: 'admin@example.com',
    }

    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
    })

    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
      }),
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 }
    )

    await waitFor(
      () => {
        expect(result.current.profile).toBeNull()
        expect(result.current.isAdmin).toBe(false)
      },
      { timeout: 3000 }
    )
  })

  it('should call signOut when signOut is invoked', async () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
    })
    ;(supabase.auth.signOut as any).mockResolvedValue({})

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 }
    )

    await result.current.signOut()

    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('should handle signOut errors gracefully', async () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
    })
    ;(supabase.auth.signOut as any).mockRejectedValue(
      new Error('Sign out failed')
    )

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 }
    )

    await result.current.signOut()

    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should handle auth state changes', async () => {
    const mockUser = {
      id: 'admin-123',
      email: 'admin@example.com',
    }

    const mockAdminProfile = {
      id: 'admin-123',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      status: 'active',
    }

    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
    })

    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockAdminProfile,
        error: null,
      }),
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    renderHook(() => useAdminAuth(), { wrapper })

    // Verify that onAuthStateChange was called
    expect(mockOnAuthStateChange).toHaveBeenCalled()

    // Simulate auth state change
    const authStateChangeCallback = mockOnAuthStateChange.mock.calls[0][0]
    if (authStateChangeCallback) {
      await authStateChangeCallback('SIGNED_IN', {
        user: mockUser,
        session: { user: mockUser },
      } as any)
    }
  })

  it('should clear user and profile on sign out', async () => {
    const mockUser = {
      id: 'admin-123',
      email: 'admin@example.com',
    }

    const mockAdminProfile = {
      id: 'admin-123',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      status: 'active',
    }

    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
    })

    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockAdminProfile,
        error: null,
      }),
    })

    ;(supabase.auth.signOut as any).mockResolvedValue({})

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 }
    )

    await result.current.signOut()

    await waitFor(
      () => {
        expect(result.current.user).toBeNull()
        expect(result.current.profile).toBeNull()
        expect(result.current.isAdmin).toBe(false)
      },
      { timeout: 3000 }
    )
  })

  it('should cleanup subscription on unmount', () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { unmount } = renderHook(() => useAdminAuth(), { wrapper })

    unmount()

    // Verify cleanup was called
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should handle session error gracefully', async () => {
    ;(supabase.auth.getSession as any).mockRejectedValue(
      new Error('Session error')
    )

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    )

    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 3000 }
    )

    expect(consoleSpy).toHaveBeenCalled()
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()

    consoleSpy.mockRestore()
  })
})

