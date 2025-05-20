import { supabase } from './supabase';
import { Database } from '@/types/supabase';

export type AuthError = {
  message: string;
  status?: number;
};

export async function signUp(params: {
  email: string;
  password: string;
  fullName: string;
  studentId: string;
  contactNumber: string;
  username: string;
}): Promise<{ data: any; error: AuthError | null }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          student_id: params.studentId,
          contact_number: params.contactNumber,
          username: params.username,
        },
      },
    });

    if (authError) throw authError;

    // Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user!.id,
      username: params.username,
      full_name: params.fullName,
      student_id: params.studentId,
      contact_number: params.contactNumber,
    });

    if (profileError) throw profileError;

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

export async function signIn(params: {
  email: string;
  password: string;
}): Promise<{ data: any; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
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