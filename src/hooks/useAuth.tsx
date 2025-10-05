/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, createContext, useContext } from "react"
import { supabase } from "../services/supabaseClient"

type AuthContextType = {
  user: any
  profile: any
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        // If profile doesn't exist, try to create one but don't block
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log("Profile not found, attempting to create default profile...")
          // Don't await this - let it run in background
          createDefaultProfile(userId).catch(err => 
            console.warn("Background profile creation failed:", err)
          )
        }
        return null
      }

      return data
    } catch (error) {
      console.error("Error:", error)
      return null
    }
  }

  // Create a default profile for new users (simplified)
  const createDefaultProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      console.log("Creating profile for user:", user.email)

      // Create profile with minimal fields only
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
          last_name: user.user_metadata?.last_name || ''
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating profile:", error)
        return null
      }

      console.log("Profile created successfully:", data)
      return data
    } catch (error) {
      console.error("Error creating profile:", error)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    // Simplified - just check auth without profile
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Fetch profile in background after loading completes
        if (session?.user) {
          fetchProfile(session.user.id).then(profileData => {
            if (mounted) setProfile(profileData)
          }).catch(err => {
            console.warn("Background profile fetch failed:", err)
          })
        }
      } catch (error) {
        console.error("Error in getSession:", error)
        if (mounted) setLoading(false)
      }
    }

    // Short timeout as fallback
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn("Auth timeout - forcing loading to false")
        setLoading(false)
      }
    }, 2000) // 2 second timeout

    getSession()

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Fetch profile in background
        fetchProfile(session.user.id).then(profileData => {
          if (mounted) setProfile(profileData)
        }).catch(err => {
          console.warn("Background profile fetch failed:", err)
        })
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    // Clear any cached session data
    localStorage.removeItem('supabase.auth.token')
  }

  // Check if user is admin (default to false if no profile)
  const isAdmin = profile?.role === 'admin' || false

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
