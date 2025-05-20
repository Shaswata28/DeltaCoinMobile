import { supabase } from './supabase';
import { Database } from '@/types/supabase';

export type AuthError = {
  message: string;
  status?: number;
};

export async function signIn(params: {
  username: string;
  password: string;
}): Promise<{ data: any; error: AuthError | null }> {
  try {
    // First get the email associated with the username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('username', params.username)
      .single();

    if (userError || !userData) {
      throw new Error('Invalid username or password');
    }

    // Then sign in with email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: params.password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'An error occurred during sign in',
        status: error.status,
      },
    };
  }
}

export async function signUp(params: {
  username: string;
  password: string;
  fullName: string;
  studentId: string;
  contactNumber: string;
}): Promise<{ data: any; error: AuthError | null }> {
  try {
    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', params.username)
      .single();

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Generate email from student ID
    const email = `${params.studentId}@eastdelta.edu.bd`;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: params.password,
      options: {
        data: {
          username: params.username,
          full_name: params.fullName,
          student_id: params.studentId,
          contact_number: params.contactNumber,
        },
      },
    });

    if (authError) throw authError;

    return { data: authData, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'An error occurred during sign up',
        status: error.status,
      },
    };
  }
}

export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'An error occurred during password reset',
        status: error.status,
      },
    };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'An error occurred during sign out',
        status: error.status,
      },
    };
  }
}

export async function updatePassword(password: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'An error occurred updating password',
        status: error.status,
      },
    };
  }
}