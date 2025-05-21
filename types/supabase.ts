export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          full_name: string
          student_id: string
          email: string
          contact_number: string
          pin: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name: string
          student_id: string
          email: string
          contact_number: string
          pin: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          student_id?: string
          email?: string
          contact_number?: string
          pin?: string
          created_at?: string
        }
      }
      wallets: {
        Row: {
          user_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          user_id: string
          balance?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          balance?: number
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'topup' | 'payment'
          category: 'canteen' | 'library' | 'lab' | 'club' | 'others'
          club_name?: string
          description?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'topup' | 'payment'
          category: 'canteen' | 'library' | 'lab' | 'club' | 'others'
          club_name?: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'topup' | 'payment'
          category?: 'canteen' | 'library' | 'lab' | 'club' | 'others'
          club_name?: string
          description?: string
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          month: string
          category: 'canteen' | 'library' | 'lab' | 'club' | 'others'
          budget_limit: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          category: 'canteen' | 'library' | 'lab' | 'club' | 'others'
          budget_limit: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          category?: 'canteen' | 'library' | 'lab' | 'club' | 'others'
          budget_limit?: number
          created_at?: string
        }
      }
    }
  }
}