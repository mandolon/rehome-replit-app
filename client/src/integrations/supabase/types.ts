export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      emails: {
        Row: {
          avatar: string | null
          content: string | null
          created_at: string
          has_attachment: boolean | null
          id: string
          is_read: boolean | null
          is_starred: boolean | null
          preview: string | null
          recipient: string | null
          recipient_id: string | null
          sender_email: string | null
          sender_id: string
          sender_name: string
          status: string
          subject: string
          time: string | null
          to_emails: string[] | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          content?: string | null
          created_at?: string
          has_attachment?: boolean | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          preview?: string | null
          recipient?: string | null
          recipient_id?: string | null
          sender_email?: string | null
          sender_id: string
          sender_name: string
          status: string
          subject: string
          time?: string | null
          to_emails?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          content?: string | null
          created_at?: string
          has_attachment?: boolean | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          preview?: string | null
          recipient?: string | null
          recipient_id?: string | null
          sender_email?: string | null
          sender_id?: string
          sender_name?: string
          status?: string
          subject?: string
          time?: string | null
          to_emails?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      pdf_comments: {
        Row: {
          comment_number: number
          comment_text: string
          created_at: string
          id: string
          page_number: number
          updated_at: string
          user_id: string
          whiteboard_id: string
          x: number
          y: number
        }
        Insert: {
          comment_number: number
          comment_text: string
          created_at?: string
          id?: string
          page_number?: number
          updated_at?: string
          user_id: string
          whiteboard_id: string
          x: number
          y: number
        }
        Update: {
          comment_number?: number
          comment_text?: string
          created_at?: string
          id?: string
          page_number?: number
          updated_at?: string
          user_id?: string
          whiteboard_id?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "pdf_comments_whiteboard_id_fkey"
            columns: ["whiteboard_id"]
            isOneToOne: false
            referencedRelation: "whiteboards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      task_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          task_id: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          task_id: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          task_id?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          archived: boolean | null
          assignee: Json | null
          collaborators: Json | null
          created_at: string
          created_by: string
          date_created: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          due_date: string | null
          estimated_completion: string | null
          has_attachment: boolean | null
          id: number
          project: string | null
          project_id: string
          status: string | null
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean | null
          assignee?: Json | null
          collaborators?: Json | null
          created_at?: string
          created_by: string
          date_created?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_completion?: string | null
          has_attachment?: boolean | null
          id?: number
          project?: string | null
          project_id: string
          status?: string | null
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean | null
          assignee?: Json | null
          collaborators?: Json | null
          created_at?: string
          created_by?: string
          date_created?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_completion?: string | null
          has_attachment?: boolean | null
          id?: number
          project?: string | null
          project_id?: string
          status?: string | null
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whiteboards: {
        Row: {
          created_at: string
          created_by: string
          id: string
          last_modified: string
          pdf_url: string | null
          project_id: string
          shared_with_client: boolean
          thumbnail: string | null
          title: string
          tldraw_data: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id: string
          last_modified?: string
          pdf_url?: string | null
          project_id: string
          shared_with_client?: boolean
          thumbnail?: string | null
          title: string
          tldraw_data?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          last_modified?: string
          pdf_url?: string | null
          project_id?: string
          shared_with_client?: boolean
          thumbnail?: string | null
          title?: string
          tldraw_data?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_users_with_profile: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "team" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "team", "client"],
    },
  },
} as const
