export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          display_name: string | null
          is_profile_public: boolean
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          display_name?: string | null
          is_profile_public?: boolean
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          display_name?: string | null
          is_profile_public?: boolean
        }
      }
      wallpapers: {
        Row: {
          id: string
          user_id: string
          prompt: string
          style: string | null
          aspect_ratio: string
          image_url: string
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          style?: string | null
          aspect_ratio: string
          image_url: string
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          style?: string | null
          aspect_ratio?: string
          image_url?: string
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_id: string | null
          plan_type: string | null
          status: string | null
          cancel_at_period_end: boolean | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string | null
          plan_type?: string | null
          status?: string | null
          cancel_at_period_end?: boolean | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string | null
          plan_type?: string | null
          status?: string | null
          cancel_at_period_end?: boolean | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      usage: {
        Row: {
          id: string
          user_id: string
          monthly_generations: number
          count: number
          total_generations: number
          reset_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          monthly_generations?: number
          count: number
          total_generations?: number
          reset_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          monthly_generations?: number
          count?: number
          total_generations?: number
          reset_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
