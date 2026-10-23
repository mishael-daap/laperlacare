export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          avatar_path: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      caregiver_availability: {
        Row: {
          caregiver_id: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          caregiver_id: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          caregiver_id?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_availability_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      caregiver_documents: {
        Row: {
          caregiver_id: string
          created_at: string
          expires_at: string | null
          file_name: string | null
          id: string
          kind: string
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          storage_path: string
        }
        Insert: {
          caregiver_id: string
          created_at?: string
          expires_at?: string | null
          file_name?: string | null
          id?: string
          kind: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string
          expires_at?: string | null
          file_name?: string | null
          id?: string
          kind?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_documents_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      caregiver_needs: {
        Row: {
          caregiver_id: string
          need_id: string
        }
        Insert: {
          caregiver_id: string
          need_id: string
        }
        Update: {
          caregiver_id?: string
          need_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_needs_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "caregiver_needs_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "needs"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_supports: {
        Row: {
          caregiver_id: string
          support_id: string
        }
        Insert: {
          caregiver_id: string
          support_id: string
        }
        Update: {
          caregiver_id?: string
          support_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_supports_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "caregiver_supports_support_id_fkey"
            columns: ["support_id"]
            isOneToOne: false
            referencedRelation: "supports"
            referencedColumns: ["id"]
          },
        ]
      }
      caregivers: {
        Row: {
          age_max: number | null
          age_min: number | null
          avatar_path: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          gender: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          gender?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          gender?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      child_needs: {
        Row: {
          child_id: string
          need_id: string
        }
        Insert: {
          child_id: string
          need_id: string
        }
        Update: {
          child_id?: string
          need_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_needs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_needs_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "needs"
            referencedColumns: ["id"]
          },
        ]
      }
      child_supports: {
        Row: {
          child_id: string
          support_id: string
        }
        Insert: {
          child_id: string
          support_id: string
        }
        Update: {
          child_id?: string
          support_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_supports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_supports_support_id_fkey"
            columns: ["support_id"]
            isOneToOne: false
            referencedRelation: "supports"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          created_at: string
          date_of_birth: string | null
          full_name: string
          household_id: string
          id: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          household_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          household_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          label: string
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          label: string
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          label?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      household_availability: {
        Row: {
          day_of_week: number
          end_time: string
          household_id: string
          id: string
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          household_id: string
          id?: string
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          household_id?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_availability_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          preferred_caregiver_gender: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferred_caregiver_gender?: string
        }
        Update: {
          created_at?: string
          id?: string
          preferred_caregiver_gender?: string
        }
        Relationships: []
      }
      needs: {
        Row: {
          created_at: string
          id: string
          label: string
          position: number
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          position: number
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
      parents: {
        Row: {
          avatar_path: string | null
          created_at: string
          household_id: string
          user_id: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          household_id: string
          user_id: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          household_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      supports: {
        Row: {
          created_at: string
          id: string
          label: string
          position: number
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          position: number
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_caregiver_counts: {
        Args: never
        Returns: {
          approved_count: number
          onboarding_count: number
          pending_count: number
          rejected_count: number
          total_count: number
        }[]
      }
      admin_caregiver_detail: {
        Args: { p_user_id: string }
        Returns: {
          age_max: number
          age_min: number
          avatar_path: string
          bio: string
          created_at: string
          date_of_birth: string
          display_name: string
          email: string
          gender: string
          need_slugs: string[]
          submitted_at: string
          support_slugs: string[]
          user_id: string
          verification_status: string
        }[]
      }
      admin_caregiver_directory: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_status?: string
        }
        Returns: {
          created_at: string
          display_name: string
          email: string
          submitted_at: string
          total_count: number
          user_id: string
          verification_status: string
        }[]
      }
      ensure_household: { Args: never; Returns: string }
      my_caregiver_status: { Args: never; Returns: string }
      save_caregiver_capabilities: {
        Args: {
          p_age_max?: number
          p_age_min?: number
          p_date_of_birth?: string
          p_gender?: string
          p_needs?: string[]
          p_supports?: string[]
        }
        Returns: undefined
      }
      save_child: {
        Args: {
          p_child_id?: string
          p_date_of_birth?: string
          p_full_name?: string
          p_needs?: string[]
          p_notes?: string
          p_supports?: string[]
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
