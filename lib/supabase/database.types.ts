export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          role: string | null;
          status: 'オンライン' | 'オフライン' | '離席中' | null;
          joined_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          role?: string | null;
          status?: 'オンライン' | 'オフライン' | '離席中' | null;
          joined_date?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      statuses: {
        Row: {
          id: string;
          slug: string;
          name: string;
          color: string | null;
          icon: string | null;
          display_order: number | null;
        };
      };
      priorities: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string | null;
          display_order: number | null;
        };
      };
      labels: {
        Row: {
          id: string;
          slug: string;
          name: string;
          color: string;
        };
      };
      teams: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string | null;
          color: string | null;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          status_id: string | null;
          percent_complete: number | null;
        };
      };
      team_projects: {
        Row: {
          team_id: string;
          project_id: string;
        };
      };
      issues: {
        Row: {
          id: string;
          identifier: string;
          title: string;
          description: string | null;
          status_id: string | null;
          priority_id: string | null;
          project_id: string | null;
          created_by: string | null;
          created_at: string | null;
        };
      };
      issue_assignees: {
        Row: {
          issue_id: string;
          user_id: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
