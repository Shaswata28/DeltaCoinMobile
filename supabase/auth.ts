import 'react-native-get-random-values';
import { supabase } from './client'
import type { User } from './client'
import { decode as atob } from 'base-64';
import { encode as btoa } from 'base-64';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-url-polyfill/auto';

export interface SignUpData {
  email: string
  password: string
  fullName: string
  studentId: string
  contactNumber: string
  username: string
  pin: string
}

export interface SignInData {
  email: string
  password: string
}

function isValidStudentId(studentId: string): boolean {
  return /^\d{9}$/.test(studentId)
}

function isValidPin(pin: string): boolean {
  return /^\d{5}$/.test(pin)
}

function isValidContactNumber(contactNumber: string): boolean {
  return /^\d+$/.test(contactNumber)
}

// Generate and store avatar using DiceBear API
export async function generateAndStoreAvatar(seed: string): Promise<string | null> {
  try {
    const avatarUrl = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundColor=FFD700&textColor=2C2C2C&size=128`;

    // Fetch PNG binary
    const response = await fetch(avatarUrl, {
      headers: {
        'Accept': 'image/png',
        'User-Agent': 'DeltaCoin-App',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch avatar image');
    }

    const blob = await response.blob();

    // Generate a unique file name
    const fileName = `avatars/${uuidv4()}.png`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error.message);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl || null;
  } catch (error: any) {
    console.error('Error generating and storing avatar:', error.message);
    return null;
  }
}

// Generate avatars for all existing users who don't have profile pictures
export async function generateAvatarsForExistingUsers(): Promise<{ success: number; failed: number; total: number }> {
  try {
    console.log('Starting avatar generation for existing users...');
    
    // Get all users without profile pictures
    const { data: usersWithoutAvatars, error: fetchError } = await supabase
      .from('users')
      .select('id, username, full_name')
      .or('profile_picture_url.is.null,profile_picture_url.eq.""');
    
    if (fetchError) {
      console.error('Error fetching users without avatars:', fetchError);
      throw fetchError;
    }
    
    if (!usersWithoutAvatars || usersWithoutAvatars.length === 0) {
      console.log('No users found without avatars');
      return { success: 0, failed: 0, total: 0 };
    }
    
    console.log(`Found ${usersWithoutAvatars.length} users without avatars`);
    
    let successCount = 0;
    let failedCount = 0;
    
    // Process each user
    for (const user of usersWithoutAvatars) {
      try {
        console.log(`Generating avatar for user ${user.id} (${user.full_name})`);
        
        const avatarUrl = await generateAndStoreAvatar(user.username);
        
        if (avatarUrl) {
          // Update user profile with the generated avatar URL
          await updateUserProfile({ profile_picture_url: avatarUrl }, user.id);
          successCount++;
          console.log(`✓ Avatar generated for ${user.full_name}: ${avatarUrl}`);
        } else {
          failedCount++;
          console.log(`✗ Failed to generate avatar for ${user.full_name}`);
        }
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        failedCount++;
        console.error(`Error generating avatar for user ${user.id}:`, error);
      }
    }
    
    console.log(`Avatar generation complete: ${successCount} successful, ${failedCount} failed, ${usersWithoutAvatars.length} total`);
    
    return {
      success: successCount,
      failed: failedCount,
      total: usersWithoutAvatars.length
    };
    
  } catch (error) {
    console.error('Error in generateAvatarsForExistingUsers:', error);
    throw error;
  }
}

export async function signUp(userData: SignUpData) {
  try {
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
        })
        .select()
        .single()

      if (profileError) throw profileError

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
    throw error
  }
}

export async function signIn(credentials: SignInData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) throw error

    if (data.user) {
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
    throw error
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    throw error
  }
}

export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    throw error
  }
}

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
    throw error
  }
}

export async function updateUserProfile(updates: Partial<Omit<User, 'id' | 'created_at'>>, userId?: string) {
  try {
    let targetUserId = userId;
    
    if (!targetUserId) {
      const user = await getCurrentUser()
      if (!user) throw new Error('No authenticated user')
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', targetUserId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    return false
  }
}