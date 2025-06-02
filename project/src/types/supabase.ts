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
          email: string
          name: string
          balance: number
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          balance?: number
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          balance?: number
          is_admin?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'credit' | 'debit'
          amount: number
          purpose: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'credit' | 'debit'
          amount: number
          purpose: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'credit' | 'debit'
          amount?: number
          purpose?: string
          created_at?: string
        }
      }
      otp_sessions: {
        Row: {
          id: string
          user_id: string
          service_id: string
          operator_id: string
          number: string
          otp: string | null
          session_token: string
          status: 'pending' | 'success' | 'canceled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          operator_id: string
          number: string
          otp?: string | null
          session_token: string
          status?: 'pending' | 'success' | 'canceled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          operator_id?: string
          number?: string
          otp?: string | null
          session_token?: string
          status?: 'pending' | 'success' | 'canceled'
          created_at?: string
        }
      }
    }
  }
}