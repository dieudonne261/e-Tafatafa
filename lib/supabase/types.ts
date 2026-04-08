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
          email: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          user_id: string
          content: string | null
          audio_url: string | null
          image_url: string | null
          gif_url: string | null
          file_url: string | null
          file_name: string | null
          reply_to_id: string | null
          is_edited: boolean
          created_at: string
          users: {
            id: string
            email: string | null
            username: string | null
            avatar_url: string | null
          } | null
          reactions: {
            id: string
            message_id: string
            user_id: string
            emoji: string
            created_at: string
          }[]
        }
        Insert: {
          id?: string
          user_id: string
          content?: string | null
          audio_url?: string | null
          image_url?: string | null
          gif_url?: string | null
          file_url?: string | null
          file_name?: string | null
          reply_to_id?: string | null
          is_edited?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string | null
          audio_url?: string | null
          image_url?: string | null
          gif_url?: string | null
          file_url?: string | null
          file_name?: string | null
          reply_to_id?: string | null
          is_edited?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          }
        ]
      }
      reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/* ── Convenience types ── */
export type UserProfile = Database['public']['Tables']['users']['Row']

export type Reaction = {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export type Message = Database['public']['Tables']['messages']['Row'] & {
  users: {
    id: string
    email: string | null
    username: string | null
    avatar_url: string | null
  } | null
  reactions: Reaction[]
}
