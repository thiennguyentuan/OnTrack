export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Table<Row extends Record<string, unknown>, Insert extends Record<string, unknown> = Partial<Row>, Update extends Record<string, unknown> = Partial<Row>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };
type UUID = string;
type Timestamp = string;
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Database = {
  public: {
    Tables: {
      profiles: Table<{ id: UUID; full_name: string; email: string; timezone: string; created_at: Timestamp; updated_at: Timestamp }>;
      user_settings: Table<{ user_id: UUID; daily_focus_minutes: number; notifications_enabled: boolean; created_at: Timestamp; updated_at: Timestamp }>;
      deadlines: Table<{ id: UUID; user_id: UUID; title: string; description: string | null; due_at: Timestamp; priority: Priority; status: string; progress: number; risk_level: string; created_at: Timestamp; updated_at: Timestamp }, { title: string; due_at: Timestamp; priority: Priority; description?: string | null }, Partial<{ title: string; due_at: Timestamp; priority: Priority; description: string | null }>>;
      milestones: Table<{ id: UUID; deadline_id: UUID; title: string; description: string | null; target_at: Timestamp; status: string; progress: number; position: number; created_at: Timestamp; updated_at: Timestamp }, { deadline_id: UUID; title: string; target_at: Timestamp; description?: string | null; position?: number }>;
      tasks: Table<{ id: UUID; milestone_id: UUID; title: string; description: string | null; priority: Priority; status: string; current_progress: number; position: number; created_at: Timestamp; updated_at: Timestamp }, { milestone_id: UUID; title: string; priority: Priority; description?: string | null; position?: number }>;
      sessions: Table<{ id: UUID; task_id: UUID; planned_start_at: Timestamp; estimated_minutes: number; focus_mode: 'NORMAL' | 'HIGH'; status: string; progress_before: number; progress_after: number | null; started_at: Timestamp | null; paused_at: Timestamp | null; expected_end_at: Timestamp | null; ended_at: Timestamp | null; actual_minutes: number | null; result_note: string | null; is_follow_up: boolean; previous_session_id: UUID | null }, { task_id: UUID; planned_start_at: Timestamp; estimated_minutes: number; focus_mode: 'NORMAL' | 'HIGH'; is_follow_up?: boolean; previous_session_id?: UUID | null }>;
      notifications: Table<{ id: UUID; user_id: UUID; session_id: UUID | null; type: string; scheduled_at: Timestamp; read_at: Timestamp | null }>;
    };
    Views: Record<string, never>;
    Functions: {
      start_session: { Args: { p_session_id: UUID }; Returns: unknown };
      pause_session: { Args: { p_session_id: UUID }; Returns: unknown };
      resume_session: { Args: { p_session_id: UUID }; Returns: unknown };
      end_session: { Args: { p_session_id: UUID; p_ended_early: boolean }; Returns: unknown };
      complete_session_review: { Args: { p_session_id: UUID; p_progress_after: number; p_actual_minutes: number; p_result_note: string | null }; Returns: unknown };
      create_follow_up_session: { Args: { p_previous_session_id: UUID; p_planned_start_at: Timestamp; p_estimated_minutes: number; p_focus_mode: 'NORMAL' | 'HIGH' }; Returns: unknown };
      get_today_dashboard: { Args: { p_now?: Timestamp }; Returns: unknown };
      get_deadline_risk: { Args: { p_deadline_id: UUID }; Returns: unknown };
    };
    Enums: { priority: Priority; deadline_status: string; milestone_status: string; task_status: string; session_status: string; focus_mode: 'NORMAL' | 'HIGH'; risk_level: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE' };
    CompositeTypes: Record<string, never>;
  };
};
