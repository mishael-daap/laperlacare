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
      caregiver_document_reviews: {
        Row: {
          caregiver_id: string
          decision: string
          document_id: string | null
          file_name: string | null
          id: string
          kind: string
          message: string | null
          reason: string | null
          reviewed_at: string
          reviewed_by: string | null
        }
        Insert: {
          caregiver_id: string
          decision: string
          document_id?: string | null
          file_name?: string | null
          id?: string
          kind: string
          message?: string | null
          reason?: string | null
          reviewed_at?: string
          reviewed_by?: string | null
        }
        Update: {
          caregiver_id?: string
          decision?: string
          document_id?: string | null
          file_name?: string | null
          id?: string
          kind?: string
          message?: string | null
          reason?: string | null
          reviewed_at?: string
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_document_reviews_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "caregiver_document_reviews_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "caregiver_documents"
            referencedColumns: ["id"]
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
          rejection_message: string | null
          rejection_reason: string | null
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
          rejection_message?: string | null
          rejection_reason?: string | null
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
          rejection_message?: string | null
          rejection_reason?: string | null
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
      caregiver_experience: {
        Row: {
          ages_and_needs: string | null
          caregiver_id: string
          created_at: string
          employer: string
          ended_on: string | null
          id: string
          position: number
          role: string
          started_on: string
        }
        Insert: {
          ages_and_needs?: string | null
          caregiver_id: string
          created_at?: string
          employer: string
          ended_on?: string | null
          id?: string
          position: number
          role: string
          started_on: string
        }
        Update: {
          ages_and_needs?: string | null
          caregiver_id?: string
          created_at?: string
          employer?: string
          ended_on?: string | null
          id?: string
          position?: number
          role?: string
          started_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_experience_caregiver_id_fkey"
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
      caregiver_references: {
        Row: {
          caregiver_id: string
          checked_at: string | null
          checked_by: string | null
          checked_outcome: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          known_for: string | null
          organisation: string | null
          phone: string | null
          position: number
          relationship: string
        }
        Insert: {
          caregiver_id: string
          checked_at?: string | null
          checked_by?: string | null
          checked_outcome?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          known_for?: string | null
          organisation?: string | null
          phone?: string | null
          position: number
          relationship: string
        }
        Update: {
          caregiver_id?: string
          checked_at?: string | null
          checked_by?: string | null
          checked_outcome?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          known_for?: string | null
          organisation?: string | null
          phone?: string | null
          position?: number
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_references_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["user_id"]
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
          address_city: string | null
          address_postal_code: string | null
          address_street: string | null
          age_max: number | null
          age_min: number | null
          approved_at: string | null
          approved_by: string | null
          avatar_path: string | null
          background_check_agreed: boolean
          bio: string | null
          car_and_insurance: boolean | null
          conditions: string[]
          counties: string[]
          created_at: string
          date_of_birth: string | null
          declined_at: string | null
          declined_by: string | null
          declined_reason: string | null
          difficult_moment: string | null
          display_name: string | null
          earliest_start_date: string | null
          gender: string | null
          hourly_rate: number | null
          interview_outcome: string | null
          interviewed_at: string | null
          languages: string[]
          legal_name: string | null
          max_travel_miles: number | null
          non_smoker: boolean | null
          other_condition: string | null
          other_county: string | null
          other_language: string | null
          pets: string | null
          referral_source: string | null
          regional_center_name: string | null
          regional_center_worker: boolean | null
          signature_name: string | null
          signed_at: string | null
          signed_ip: unknown
          signed_statement_version: string | null
          signed_user_agent: string | null
          submitted_at: string | null
          trustline_status: string | null
          user_id: string
          why_special_needs: string | null
          willing_to_drive: boolean | null
        }
        Insert: {
          address_city?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          age_max?: number | null
          age_min?: number | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_path?: string | null
          background_check_agreed?: boolean
          bio?: string | null
          car_and_insurance?: boolean | null
          conditions?: string[]
          counties?: string[]
          created_at?: string
          date_of_birth?: string | null
          declined_at?: string | null
          declined_by?: string | null
          declined_reason?: string | null
          difficult_moment?: string | null
          display_name?: string | null
          earliest_start_date?: string | null
          gender?: string | null
          hourly_rate?: number | null
          interview_outcome?: string | null
          interviewed_at?: string | null
          languages?: string[]
          legal_name?: string | null
          max_travel_miles?: number | null
          non_smoker?: boolean | null
          other_condition?: string | null
          other_county?: string | null
          other_language?: string | null
          pets?: string | null
          referral_source?: string | null
          regional_center_name?: string | null
          regional_center_worker?: boolean | null
          signature_name?: string | null
          signed_at?: string | null
          signed_ip?: unknown
          signed_statement_version?: string | null
          signed_user_agent?: string | null
          submitted_at?: string | null
          trustline_status?: string | null
          user_id: string
          why_special_needs?: string | null
          willing_to_drive?: boolean | null
        }
        Update: {
          address_city?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          age_max?: number | null
          age_min?: number | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_path?: string | null
          background_check_agreed?: boolean
          bio?: string | null
          car_and_insurance?: boolean | null
          conditions?: string[]
          counties?: string[]
          created_at?: string
          date_of_birth?: string | null
          declined_at?: string | null
          declined_by?: string | null
          declined_reason?: string | null
          difficult_moment?: string | null
          display_name?: string | null
          earliest_start_date?: string | null
          gender?: string | null
          hourly_rate?: number | null
          interview_outcome?: string | null
          interviewed_at?: string | null
          languages?: string[]
          legal_name?: string | null
          max_travel_miles?: number | null
          non_smoker?: boolean | null
          other_condition?: string | null
          other_county?: string | null
          other_language?: string | null
          pets?: string | null
          referral_source?: string | null
          regional_center_name?: string | null
          regional_center_worker?: boolean | null
          signature_name?: string | null
          signed_at?: string | null
          signed_ip?: unknown
          signed_statement_version?: string | null
          signed_user_agent?: string | null
          submitted_at?: string | null
          trustline_status?: string | null
          user_id?: string
          why_special_needs?: string | null
          willing_to_drive?: boolean | null
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
          created_at: string
          email: string | null
          id: string
          label: string
          phone: string | null
          preferred_contact_method: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          label: string
          phone?: string | null
          preferred_contact_method?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          label?: string
          phone?: string | null
          preferred_contact_method?: string
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
      admin_approve_caregiver: {
        Args: { p_user_id: string }
        Returns: undefined
      }
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
          address_city: string
          address_postal_code: string
          address_street: string
          age_max: number
          age_min: number
          approved_at: string
          approved_by: string
          avatar_path: string
          background_check_agreed: boolean
          bio: string
          car_and_insurance: boolean
          conditions: string[]
          counties: string[]
          created_at: string
          date_of_birth: string
          declined_at: string
          declined_reason: string
          difficult_moment: string
          display_name: string
          earliest_start_date: string
          email: string
          gender: string
          hourly_rate: number
          interview_outcome: string
          interviewed_at: string
          languages: string[]
          legal_name: string
          max_travel_miles: number
          need_slugs: string[]
          non_smoker: boolean
          other_condition: string
          other_county: string
          other_language: string
          pets: string
          referral_source: string
          regional_center_name: string
          regional_center_worker: boolean
          signature_name: string
          signed_at: string
          signed_statement_version: string
          submitted_at: string
          support_slugs: string[]
          trustline_status: string
          user_id: string
          verification_status: string
          why_special_needs: string
          willing_to_drive: boolean
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
      admin_check_reference: {
        Args: { p_outcome: string; p_reference_id: string }
        Returns: undefined
      }
      admin_decline_caregiver: {
        Args: { p_reason: string; p_user_id: string }
        Returns: undefined
      }
      admin_set_application_record: {
        Args: {
          p_interview_outcome?: string
          p_interviewed_at?: string
          p_trustline_status?: string
          p_user_id: string
        }
        Returns: undefined
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
      save_caregiver_experience: { Args: { p_rows?: Json }; Returns: undefined }
      save_caregiver_references: { Args: { p_rows?: Json }; Returns: undefined }
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
      submit_caregiver_application: {
        Args: { p_signature_name: string; p_statement_version: string }
        Returns: undefined
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
