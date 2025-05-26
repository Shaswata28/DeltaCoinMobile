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
  username: string
  password: string
}

export interface SignInWithUsernameData {
  username: string
  pin: string
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

// Sign in with username and password
export async function signIn(credentials: SignInData) {
  try {
    // Get the user by username and verify password
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', credentials.username)
      .eq('password', credentials.password)
      .single()

    if (userError || !userData) {
      throw new Error('Invalid username or password')
    }

    return { user: userData }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Sign in with username and PIN (custom logic)
export async function signInWithUsername(credentials: SignInWithUsernameData) {
  try {
    // First, get the user by username and verify PIN
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', credentials.username)
      .eq('pin', credentials.pin)
      .single()

    if (userError || !userData) {
      throw new Error('Invalid username or PIN')
    }

    // Get the auth user email to sign in
    const { data: authUser, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw new Error('Authentication failed')
    }

    return { user: userData }
  } catch (error) {
    console.error('Username sign in error:', error)
    throw error
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', error)
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