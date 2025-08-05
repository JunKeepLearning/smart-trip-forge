export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      museums: {
        Row: {
          address: string | null
          administrative_division: string | null
          affiliation_level: string | null
          annual_visitors: string | null
          building_area: string | null
          building_type: string | null
          collection_count: string | null
          credit_code: string | null
          description: string | null
          education_activities_count: string | null
          education_area: string | null
          email: string | null
          established_date: string | null
          exhibition_area: string | null
          exhibitions: string | null
          first_open_date: string | null
          former_name: string | null
          free_entry: string | null
          lab_area: string | null
          legal_person_type: string | null
          legal_representative: string | null
          location_info: string | null
          name: string | null
          open_all_year: string | null
          open_days_per_year: string | null
          organizer: string | null
          phone: string | null
          postal_code: string | null
          property_type: string | null
          public_service_area: string | null
          quality_grade: string | null
          registration_agency: string | null
          reservation_info: string | null
          social_media_account: string | null
          storage_area: string | null
          theme_type: string | null
          type: string | null
          url: string | null
          valuable_collections: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          administrative_division?: string | null
          affiliation_level?: string | null
          annual_visitors?: string | null
          building_area?: string | null
          building_type?: string | null
          collection_count?: string | null
          credit_code?: string | null
          description?: string | null
          education_activities_count?: string | null
          education_area?: string | null
          email?: string | null
          established_date?: string | null
          exhibition_area?: string | null
          exhibitions?: string | null
          first_open_date?: string | null
          former_name?: string | null
          free_entry?: string | null
          lab_area?: string | null
          legal_person_type?: string | null
          legal_representative?: string | null
          location_info?: string | null
          name?: string | null
          open_all_year?: string | null
          open_days_per_year?: string | null
          organizer?: string | null
          phone?: string | null
          postal_code?: string | null
          property_type?: string | null
          public_service_area?: string | null
          quality_grade?: string | null
          registration_agency?: string | null
          reservation_info?: string | null
          social_media_account?: string | null
          storage_area?: string | null
          theme_type?: string | null
          type?: string | null
          url?: string | null
          valuable_collections?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          administrative_division?: string | null
          affiliation_level?: string | null
          annual_visitors?: string | null
          building_area?: string | null
          building_type?: string | null
          collection_count?: string | null
          credit_code?: string | null
          description?: string | null
          education_activities_count?: string | null
          education_area?: string | null
          email?: string | null
          established_date?: string | null
          exhibition_area?: string | null
          exhibitions?: string | null
          first_open_date?: string | null
          former_name?: string | null
          free_entry?: string | null
          lab_area?: string | null
          legal_person_type?: string | null
          legal_representative?: string | null
          location_info?: string | null
          name?: string | null
          open_all_year?: string | null
          open_days_per_year?: string | null
          organizer?: string | null
          phone?: string | null
          postal_code?: string | null
          property_type?: string | null
          public_service_area?: string | null
          quality_grade?: string | null
          registration_agency?: string | null
          reservation_info?: string | null
          social_media_account?: string | null
          storage_area?: string | null
          theme_type?: string | null
          type?: string | null
          url?: string | null
          valuable_collections?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
