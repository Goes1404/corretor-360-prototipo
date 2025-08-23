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
      activities: {
        Row: {
          client_id: string
          created_at: string
          data_hora: string
          descricao: string
          id: string
          tipo_atividade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          data_hora?: string
          descricao: string
          id?: string
          tipo_atividade: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          data_hora?: string
          descricao?: string
          id?: string
          tipo_atividade?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          client_id: string
          corretor_id: string
          created_at: string
          date_time: string
          id: string
          location: string | null
          notes: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          corretor_id: string
          created_at?: string
          date_time: string
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          corretor_id?: string
          created_at?: string
          date_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_documents: {
        Row: {
          approved_date: string | null
          client_id: string
          created_at: string | null
          due_date: string | null
          file_url: string | null
          id: string
          name: string
          notes: string | null
          received_date: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          approved_date?: string | null
          client_id: string
          created_at?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          name: string
          notes?: string | null
          received_date?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          approved_date?: string | null
          client_id?: string
          created_at?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          name?: string
          notes?: string | null
          received_date?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          corretor_id: string
          cpf: string | null
          created_at: string | null
          desqualificado: boolean | null
          email: string | null
          id: string
          motivo_desqualificacao: string | null
          name: string
          notes: string | null
          observacoes_desqualificacao: string | null
          phone: string | null
          qualificado: boolean | null
          source: string | null
          status: string
          status_negociacao: string | null
          updated_at: string | null
        }
        Insert: {
          corretor_id: string
          cpf?: string | null
          created_at?: string | null
          desqualificado?: boolean | null
          email?: string | null
          id?: string
          motivo_desqualificacao?: string | null
          name: string
          notes?: string | null
          observacoes_desqualificacao?: string | null
          phone?: string | null
          qualificado?: boolean | null
          source?: string | null
          status?: string
          status_negociacao?: string | null
          updated_at?: string | null
        }
        Update: {
          corretor_id?: string
          cpf?: string | null
          created_at?: string | null
          desqualificado?: boolean | null
          email?: string | null
          id?: string
          motivo_desqualificacao?: string | null
          name?: string
          notes?: string | null
          observacoes_desqualificacao?: string | null
          phone?: string | null
          qualificado?: boolean | null
          source?: string | null
          status?: string
          status_negociacao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_analysis: {
        Row: {
          avg_price: number | null
          avg_time_on_market: number | null
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          price_change_percent: number | null
          property_type: string
          region: string
          total_sales: number | null
        }
        Insert: {
          avg_price?: number | null
          avg_time_on_market?: number | null
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          price_change_percent?: number | null
          property_type: string
          region: string
          total_sales?: number | null
        }
        Update: {
          avg_price?: number | null
          avg_time_on_market?: number | null
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          price_change_percent?: number | null
          property_type?: string
          region?: string
          total_sales?: number | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          avg_closing_time: number | null
          conversions_count: number | null
          corretor_id: string
          created_at: string | null
          id: string
          leads_count: number | null
          month_year: string
          most_sold_product_type: string | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          avg_closing_time?: number | null
          conversions_count?: number | null
          corretor_id: string
          created_at?: string | null
          id?: string
          leads_count?: number | null
          month_year: string
          most_sold_product_type?: string | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_closing_time?: number | null
          conversions_count?: number | null
          corretor_id?: string
          created_at?: string | null
          id?: string
          leads_count?: number | null
          month_year?: string
          most_sold_product_type?: string | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          corretor_id: string
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          location: string | null
          price: number | null
          status: string
          title: string
          type: string
          updated_at: string | null
          videos: string[] | null
        }
        Insert: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          corretor_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
          videos?: string[] | null
        }
        Update: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          corretor_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          videos?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          client_id: string
          closed_at: string | null
          commission: number | null
          corretor_id: string
          created_at: string | null
          id: string
          product_id: string | null
          status: string
          updated_at: string | null
          value: number
        }
        Insert: {
          client_id: string
          closed_at?: string | null
          commission?: number | null
          corretor_id: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          status?: string
          updated_at?: string | null
          value: number
        }
        Update: {
          client_id?: string
          closed_at?: string | null
          commission?: number | null
          corretor_id?: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          status?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
