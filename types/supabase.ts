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
          contact_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          full_name: string
          student_id: string
          contact_number: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          student_id?: string
          contact_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          wallet_id: string
          type: 'send' | 'receive'
          amount: number
          recipient: string
          category: string
          status: 'completed' | 'pending' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          type: 'send' | 'receive'
          amount: number
          recipient: string
          category: string
          status: 'completed' | 'pending' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          wallet_id?: string
          type?: 'send' | 'receive'
          amount?: number
          recipient?: string
          category?: string
          status?: 'completed' | 'pending' | 'failed'
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'weekly'
          notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'weekly'
          notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: 'monthly' | 'weekly'
          notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}