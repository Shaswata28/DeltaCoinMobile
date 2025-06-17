// supabase/auth.ts
import { supabase } from './client'
import type { User } from './client'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  studentId: string // Must be 9 digits
  contactNumber: string // Must be numeric
  username: string
  pin: string // Must be 5 digits
  profilePictureUrl?: string
}

export interface SignInData {
  email: string
  password: string
}

// Validation functions
function isValidStudentId(studentId: string): boolean {
  return /^\d{9}$/.test(studentId)
}

function isValidPin(pin: string): boolean {
  return /^\d{5}$/.test(pin)
}

function isValidContactNumber(contactNumber: string): boolean {
  return /^\d+$/.test(contactNumber)
}

// Sign up with email and create user profile
export async function signUp(userData: SignUpData) {
  try {
    // Validate input
    if (!isValidStudentId(userData.studentId)) {
      throw new Error('Student ID must be exactly 9 digits')
    }
    if (!isValidPin(userData.pin)) {
      throw new Error('PIN must be exactly 5 digits')
    }
    if (!isValidContactNumber(userData.contactNumber)) {
      throw new Error('Contact number must contain only digits')
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    })

    if (authError) throw authError

    if (authData.user) {
      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: userData.fullName,
          student_id: userData.studentId,
          contact_number: userData.contactNumber,
          username: userData.username,
          pin: userData.pin,
          password: userData.password,
          profile_picture_url: userData.profilePictureUrl,
        })
        .select()
        .single()

      if (profileError) throw profileError

      // Create wallet for the user
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: authData.user.id,
          balance: 0,
        })

      if (walletError) throw walletError

      return { user: authData.user, profile: profileData }
    }

    return { user: null, profile: null }
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

// Sign in with email and password
export async function signIn(credentials: SignInData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) throw error

    if (data.user) {
      // Log successful sign in
      console.log('User signed in successfully:', {
        userId: data.user.id,
        email: data.user.email,
        sessionId: data.session?.access_token,
        timestamp: new Date().toISOString()
      })

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError) throw userError

      return { user: userData }
    }

    throw new Error('Invalid email or password')
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Sign out
export async function signOut() {
  try {
    // Get current session before signing out
    const { data: { session } } = await supabase.auth.getSession()
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Log successful sign out
    if (session) {
      console.log('User signed out successfully:', {
        userId: session.user.id,
        sessionId: session.access_token,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error

    if (session) {
      console.log('Current session:', {
        userId: session.user.id,
        sessionId: session.access_token,
        expiresAt: session.expires_at,
        timestamp: new Date().toISOString()
      })
    }

    return session
  } catch (error) {
    console.error('Get session error:', error)
    throw error
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    throw error
  }
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<User | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get user profile error:', error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(updates: Partial<Omit<User, 'id' | 'created_at'>>) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Update profile error:', error)
    throw error
  }
}