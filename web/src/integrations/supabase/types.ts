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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          option_text: string
          order_index: number
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_text: string
          order_index: number
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_text?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "complete_responses"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          max_length: number | null
          max_rating: number | null
          min_rating: number | null
          order_index: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          survey_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          max_length?: number | null
          max_rating?: number | null
          min_rating?: number | null
          order_index: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          survey_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          max_length?: number | null
          max_rating?: number | null
          min_rating?: number | null
          order_index?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          survey_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "complete_responses"
            referencedColumns: ["survey_id"]
          },
          {
            foreignKeyName: "questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "survey_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      response_sentiment: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          processed_at: string
          response_id: string
          sentiment: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          processed_at?: string
          response_id: string
          sentiment: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          processed_at?: string
          response_id?: string
          sentiment?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_sentiment_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["id"]
          },
        ]
      }
      response_sessions: {
        Row: {
          completed_at: string | null
          id: string
          is_complete: boolean
          respondent_id: string | null
          respondent_ip: string | null
          respondent_user_agent: string | null
          started_at: string
          survey_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_complete?: boolean
          respondent_id?: string | null
          respondent_ip?: string | null
          respondent_user_agent?: string | null
          started_at?: string
          survey_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_complete?: boolean
          respondent_id?: string | null
          respondent_ip?: string | null
          respondent_user_agent?: string | null
          started_at?: string
          survey_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "response_sessions_respondent_id_fkey"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_sessions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "complete_responses"
            referencedColumns: ["survey_id"]
          },
          {
            foreignKeyName: "response_sessions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "survey_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_sessions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          answered_at: string
          id: string
          numeric_response: number | null
          question_id: string
          selected_option_id: string | null
          session_id: string
          text_response: string | null
        }
        Insert: {
          answered_at?: string
          id?: string
          numeric_response?: number | null
          question_id: string
          selected_option_id?: string | null
          session_id: string
          text_response?: string | null
        }
        Update: {
          answered_at?: string
          id?: string
          numeric_response?: number | null
          question_id?: string
          selected_option_id?: string | null
          session_id?: string
          text_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "complete_responses"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "complete_responses"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "response_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_metrics: {
        Row: {
          average_completion_time_seconds: number | null
          average_rating: number | null
          completed_responses: number
          completion_rate: number | null
          csat_score: number | null
          last_calculated_at: string
          nps_detractors: number
          nps_passives: number
          nps_promoters: number
          nps_score: number | null
          survey_id: string
          total_responses: number
          updated_at: string
        }
        Insert: {
          average_completion_time_seconds?: number | null
          average_rating?: number | null
          completed_responses?: number
          completion_rate?: number | null
          csat_score?: number | null
          last_calculated_at?: string
          nps_detractors?: number
          nps_passives?: number
          nps_promoters?: number
          nps_score?: number | null
          survey_id: string
          total_responses?: number
          updated_at?: string
        }
        Update: {
          average_completion_time_seconds?: number | null
          average_rating?: number | null
          completed_responses?: number
          completion_rate?: number | null
          csat_score?: number | null
          last_calculated_at?: string
          nps_detractors?: number
          nps_passives?: number
          nps_promoters?: number
          nps_score?: number | null
          survey_id?: string
          total_responses?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_metrics_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["survey_id"]
          },
          {
            foreignKeyName: "survey_metrics_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "survey_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_metrics_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          allow_anonymous: boolean
          closed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          duplicated_from: string | null
          id: string
          is_template: boolean
          published_at: string | null
          show_progress_bar: boolean
          status: Database["public"]["Enums"]["survey_status"]
          thank_you_message: string
          title: string
          total_responses: number
          updated_at: string
        }
        Insert: {
          allow_anonymous?: boolean
          closed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          duplicated_from?: string | null
          id?: string
          is_template?: boolean
          published_at?: string | null
          show_progress_bar?: boolean
          status?: Database["public"]["Enums"]["survey_status"]
          thank_you_message?: string
          title: string
          total_responses?: number
          updated_at?: string
        }
        Update: {
          allow_anonymous?: boolean
          closed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          duplicated_from?: string | null
          id?: string
          is_template?: boolean
          published_at?: string | null
          show_progress_bar?: boolean
          status?: Database["public"]["Enums"]["survey_status"]
          thank_you_message?: string
          title?: string
          total_responses?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_duplicated_from_fkey"
            columns: ["duplicated_from"]
            isOneToOne: false
            referencedRelation: "complete_responses"
            referencedColumns: ["survey_id"]
          },
          {
            foreignKeyName: "surveys_duplicated_from_fkey"
            columns: ["duplicated_from"]
            isOneToOne: false
            referencedRelation: "survey_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_duplicated_from_fkey"
            columns: ["duplicated_from"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      complete_responses: {
        Row: {
          completed_at: string | null
          numeric_response: number | null
          question_id: string | null
          question_text: string | null
          question_type: Database["public"]["Enums"]["question_type"] | null
          respondent_id: string | null
          selected_option_text: string | null
          session_id: string | null
          survey_id: string | null
          survey_title: string | null
          text_response: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_sessions_respondent_id_fkey"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_statistics: {
        Row: {
          avg_time_spent: number | null
          completed_sessions: number | null
          created_by: string | null
          id: string | null
          last_response_at: string | null
          status: Database["public"]["Enums"]["survey_status"] | null
          title: string | null
          total_responses: number | null
          total_sessions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_responses_by_date: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          date: string
          response_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "viewer"
      question_type:
        | "short_text"
        | "long_text"
        | "multiple_choice"
        | "rating"
        | "nps"
      survey_status: "draft" | "active" | "paused" | "completed"
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
    Enums: {
      app_role: ["admin", "manager", "viewer"],
      question_type: [
        "short_text",
        "long_text",
        "multiple_choice",
        "rating",
        "nps",
      ],
      survey_status: ["draft", "active", "paused", "completed"],
    },
  },
} as const
