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
      locations: {
        Row: {
          id: string
          name: string
          address: string
          lat: number
          lng: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          lat: number
          lng: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          lat?: number
          lng?: number
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: 'signatures' | 'vegetarian' | 'sides' | 'drinks' | 'combos' | 'extras'
          is_vegetarian: boolean
          is_spicy: boolean
          is_gluten_free: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category: 'signatures' | 'vegetarian' | 'sides' | 'drinks' | 'combos' | 'extras'
          is_vegetarian?: boolean
          is_spicy?: boolean
          is_gluten_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: 'signatures' | 'vegetarian' | 'sides' | 'drinks' | 'combos' | 'extras'
          is_vegetarian?: boolean
          is_spicy?: boolean
          is_gluten_free?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          excerpt: string | null
          content: string | null
          image_url: string | null
          category: string
          author: string
          status: 'draft' | 'published' | 'archived'
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          excerpt?: string | null
          content?: string | null
          image_url?: string | null
          category: string
          author: string
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string | null
          content?: string | null
          image_url?: string | null
          category?: string
          author?: string
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          location_id: string
          status: 'pending' | 'preparing' | 'completed' | 'cancelled'
          total_amount: number
          pickup_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email: string
          customer_phone: string
          location_id: string
          status?: 'pending' | 'preparing' | 'completed' | 'cancelled'
          total_amount: number
          pickup_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          location_id?: string
          status?: 'pending' | 'preparing' | 'completed' | 'cancelled'
          total_amount?: number
          pickup_time?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          location_id: string
          date: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          date: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          date?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'pending' | 'preparing' | 'completed' | 'cancelled'
      menu_category: 'signatures' | 'vegetarian' | 'sides' | 'drinks' | 'combos' | 'extras'
      blog_status: 'draft' | 'published' | 'archived'
    }
  }
}