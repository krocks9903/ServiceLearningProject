import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface AdminProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  status: string
}

interface AdminAuthContextType {
  user: User | null
  profile: AdminProfile | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await fetchAdminProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchAdminProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchAdminProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, status')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching admin profile:', error)
        setProfile(null)
        return
      }

      // Only set profile if user is actually an admin
      if (data.role === 'admin') {
        setProfile(data)
      } else {
        setProfile(null)
        // If user is not admin, sign them out
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error)
      setProfile(null)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    profile,
    isAdmin,
    loading,
    signOut
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
