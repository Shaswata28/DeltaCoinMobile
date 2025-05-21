// lib/auth.ts
import { supabase } from './supabase';
import { Database } from '@/types/supabase';

export type AuthError = {
  message: string;
  status?: number;
};

export async function signUp(params: {
  username: string;
  password: string;
  fullName: string;
  studentId: string;
  contactNumber: string;
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

    // Create auth user with generated email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${crypto.randomUUID()}@users.deltacoin.app`,
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
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user!.id,
        username: params.username,
        full_name: params.fullName,
        student_id: params.studentId,
        contact_number: params.contactNumber,
      });

    if (userError) throw userError;

    // Create initial wallet for the user
    const { error: walletError } = await supabase
      .from('wallets')
      .insert({
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

// Rest of the file remains unchanged...
