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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          approval_enabled: boolean | null
          banner_url: string | null
          contest_type: string | null
          created_at: string
          date: string
          description: string | null
          display_image_url: string | null
          duration: number | null
          eligibility: string | null
          end_date: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_bulk_uploaded: boolean | null
          judges_and_mentors: Json | null
          judging_criteria: string | null
          max_participants: number | null
          mode: string | null
          name: string
          networking: string | null
          prerequisites: string | null
          prizes: string | null
          prizes_and_tracks: Json | null
          refreshments: string | null
          rules: string | null
          short_id: string
          speaker: string | null
          speakers: string[] | null
          submission_end: string | null
          submission_format: string | null
          submission_start: string | null
          team_size: number | null
          tech_stack: string[] | null
          timeline: Json | null
          timezone: string | null
          topics: string[] | null
          updated_at: string
          venue: string
        }
        Insert: {
          approval_enabled?: boolean | null
          banner_url?: string | null
          contest_type?: string | null
          created_at?: string
          date: string
          description?: string | null
          display_image_url?: string | null
          duration?: number | null
          eligibility?: string | null
          end_date?: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          is_bulk_uploaded?: boolean | null
          judges_and_mentors?: Json | null
          judging_criteria?: string | null
          max_participants?: number | null
          mode?: string | null
          name: string
          networking?: string | null
          prerequisites?: string | null
          prizes?: string | null
          prizes_and_tracks?: Json | null
          refreshments?: string | null
          rules?: string | null
          short_id: string
          speaker?: string | null
          speakers?: string[] | null
          submission_end?: string | null
          submission_format?: string | null
          submission_start?: string | null
          team_size?: number | null
          tech_stack?: string[] | null
          timeline?: Json | null
          timezone?: string | null
          topics?: string[] | null
          updated_at?: string
          venue: string
        }
        Update: {
          approval_enabled?: boolean | null
          banner_url?: string | null
          contest_type?: string | null
          created_at?: string
          date?: string
          description?: string | null
          display_image_url?: string | null
          duration?: number | null
          eligibility?: string | null
          end_date?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_bulk_uploaded?: boolean | null
          judges_and_mentors?: Json | null
          judging_criteria?: string | null
          max_participants?: number | null
          mode?: string | null
          name?: string
          networking?: string | null
          prerequisites?: string | null
          prizes?: string | null
          prizes_and_tracks?: Json | null
          refreshments?: string | null
          rules?: string | null
          short_id?: string
          speaker?: string | null
          speakers?: string[] | null
          submission_end?: string | null
          submission_format?: string | null
          submission_start?: string | null
          team_size?: number | null
          tech_stack?: string[] | null
          timeline?: Json | null
          timezone?: string | null
          topics?: string[] | null
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          created_at: string
          description: string | null
          field_type: Database["public"]["Enums"]["form_field_type"]
          form_id: string
          id: string
          label: string
          options: Json | null
          order_index: number
          placeholder: string | null
          required: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          field_type: Database["public"]["Enums"]["form_field_type"]
          form_id: string
          id?: string
          label: string
          options?: Json | null
          order_index: number
          placeholder?: string | null
          required?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          field_type?: Database["public"]["Enums"]["form_field_type"]
          form_id?: string
          id?: string
          label?: string
          options?: Json | null
          order_index?: number
          placeholder?: string | null
          required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          form_id: string
          id: string
          submission_data: Json
          submitted_at: string
        }
        Insert: {
          form_id: string
          id?: string
          submission_data: Json
          submitted_at?: string
        }
        Update: {
          form_id?: string
          id?: string
          submission_data?: Json
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          require_signin: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          require_signin?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          require_signin?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          branch: string | null
          city_state: string | null
          codechef_handle: string | null
          codeforces_handle: string | null
          college: string | null
          country: string | null
          created_at: string
          current_role: string | null
          date_of_birth: string | null
          degree: string | null
          discord_username: string | null
          email: string
          full_name: string | null
          github_url: string | null
          graduation_year: number | null
          id: string
          instagram_handle: string | null
          leetcode_url: string | null
          linkedin_url: string | null
          organisation: string | null
          phone_number: string | null
          pin_code: string | null
          profile_completed: boolean | null
          resume_link: string | null
          role: string | null
          skills: string[] | null
          twitter_handle: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          branch?: string | null
          city_state?: string | null
          codechef_handle?: string | null
          codeforces_handle?: string | null
          college?: string | null
          country?: string | null
          created_at?: string
          current_role?: string | null
          date_of_birth?: string | null
          degree?: string | null
          discord_username?: string | null
          email: string
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id: string
          instagram_handle?: string | null
          leetcode_url?: string | null
          linkedin_url?: string | null
          organisation?: string | null
          phone_number?: string | null
          pin_code?: string | null
          profile_completed?: boolean | null
          resume_link?: string | null
          role?: string | null
          skills?: string[] | null
          twitter_handle?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          branch?: string | null
          city_state?: string | null
          codechef_handle?: string | null
          codeforces_handle?: string | null
          college?: string | null
          country?: string | null
          created_at?: string
          current_role?: string | null
          date_of_birth?: string | null
          degree?: string | null
          discord_username?: string | null
          email?: string
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id?: string
          instagram_handle?: string | null
          leetcode_url?: string | null
          linkedin_url?: string | null
          organisation?: string | null
          phone_number?: string | null
          pin_code?: string | null
          profile_completed?: boolean | null
          resume_link?: string | null
          role?: string | null
          skills?: string[] | null
          twitter_handle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          added_at: string
          added_by: string | null
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          id?: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          demo_video_link: string | null
          description: string | null
          event_id: string | null
          github_link: string | null
          id: string
          live_link: string | null
          ppt_link: string | null
          project_name: string
          tags: string[] | null
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          demo_video_link?: string | null
          description?: string | null
          event_id?: string | null
          github_link?: string | null
          id?: string
          live_link?: string | null
          ppt_link?: string | null
          project_name: string
          tags?: string[] | null
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          demo_video_link?: string | null
          description?: string | null
          event_id?: string | null
          github_link?: string | null
          id?: string
          live_link?: string | null
          ppt_link?: string | null
          project_name?: string
          tags?: string[] | null
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "registration_leaderboard"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: Database["public"]["Enums"]["registration_status"] | null
          user_id: string
          utm_source: string | null
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"] | null
          user_id: string
          utm_source?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"] | null
          user_id?: string
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "registration_leaderboard"
            referencedColumns: ["event_id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          event_id: string
          id: string
          name: string
          referral_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id: string
          id?: string
          name: string
          referral_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string
          id?: string
          name?: string
          referral_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "registration_leaderboard"
            referencedColumns: ["event_id"]
          },
        ]
      }
    }
    Views: {
      registration_leaderboard: {
        Row: {
          event_id: string | null
          event_name: string | null
          referral_count: number | null
          referrer_name: string | null
          utm_source: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_project_with_owner: {
        Args: {
          p_demo_video_link?: string
          p_description?: string
          p_event_id?: string
          p_github_link?: string
          p_live_link?: string
          p_ppt_link?: string
          p_project_name: string
          p_tags?: string[]
          p_team_id?: string
        }
        Returns: string
      }
      generate_short_id: { Args: never; Returns: string }
      generate_team_referral_code: { Args: never; Returns: string }
      generate_unique_short_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_project_editable: { Args: { p_project_id: string }; Returns: boolean }
      is_project_member: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      is_registered_for_event: {
        Args: { event_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      event_type:
        | "webinar"
        | "hackathon"
        | "meetup"
        | "contest"
        | "bootcamp"
        | "seminar"
        | "workshop"
        | "conference"
        | "fellowship"
        | "cohort"
        | "hiring_challenge"
        | "ideathon"
        | "learnathon"
      form_field_type:
        | "text"
        | "email"
        | "number"
        | "textarea"
        | "radio"
        | "checkbox"
        | "select"
        | "date"
        | "time"
        | "file"
      project_role: "owner" | "contributor"
      registration_status: "pending" | "approved" | "rejected"
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
      event_type: [
        "webinar",
        "hackathon",
        "meetup",
        "contest",
        "bootcamp",
        "seminar",
        "workshop",
        "conference",
        "fellowship",
        "cohort",
        "hiring_challenge",
        "ideathon",
        "learnathon",
      ],
      form_field_type: [
        "text",
        "email",
        "number",
        "textarea",
        "radio",
        "checkbox",
        "select",
        "date",
        "time",
        "file",
      ],
      project_role: ["owner", "contributor"],
      registration_status: ["pending", "approved", "rejected"],
    },
  },
} as const
