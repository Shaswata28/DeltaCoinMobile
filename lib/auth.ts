import { supabase } from './supabase';
import { Database } from '@/types/supabase';
import * as Crypto from 'expo-crypto';

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
      .select('id')
      .eq('username', params.username)
      .single();

    if (userError || !userData) {
      throw new Error('Invalid username or password');
    }

    // Then sign in with the user's ID
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${userData.id}@users.deltacoin.app`, // Using ID as email
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
  pin: string;
}): Promise<{ data: any; error: AuthError | null }> {
  try {
    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', params.username)
      .single();

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Generate a UUID using expo-crypto
    const uuid = await Crypto.randomUUID();

    // Create auth user with generated email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${uuid}@users.deltacoin.app`,
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

    // Create user record in the database
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user!.id,
      username: params.username,
      full_name: params.fullName,
      student_id: params.studentId,
      contact_number: params.contactNumber,
      pin: params.pin,
    });

    if (userError) throw userError;

    // Create initial wallet for the user
    const { error: walletError } = await supabase.from('wallets').insert({
      user_id: authData.user!.id,
      balance: 0,
    });

    if (walletError) throw walletError;

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