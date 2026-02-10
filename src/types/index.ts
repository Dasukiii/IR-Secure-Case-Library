// User Types
export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
}

// Case Types
export type CaseType = 'ER' | 'IR';
export type CaseSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type CaseStatus = 'Open' | 'Pending' | 'Closed';

export interface Case {
    id: string;
    title: string;
    type: CaseType;
    severity: CaseSeverity;
    status: CaseStatus;
    description?: string;
    parties: string[];
    key_dates: {
        reported_date?: string;
        incident_date?: string;
        resolution_date?: string;
    };
    // AI-generated content
    ai_summary?: string;
    ai_summary_generated_at?: string;
    ai_risk_analysis?: string;
    ai_risk_analysis_generated_at?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

// Timeline Event Types
export type EventType =
    | 'creation'
    | 'update'
    | 'evidence_uploaded'
    | 'note_added'
    | 'status_change'
    | 'meeting'
    | 'investigation'
    | 'resolution';

export interface TimelineEvent {
    id: string;
    case_id: string;
    event_type: EventType;
    description: string;
    event_date: string;
    created_by: string;
    created_at: string;
}

// Evidence Types
export type DocumentType =
    | 'document'
    | 'image'
    | 'video'
    | 'audio'
    | 'email'
    | 'report'
    | 'other';

export interface Evidence {
    id: string;
    case_id: string;
    document_name: string;
    document_type: DocumentType;
    file_url: string;
    file_size?: number;
    uploaded_by: string;
    uploaded_at: string;
}

// Outcome Types
export interface Outcome {
    id: string;
    case_id: string;
    outcome_type?: string;
    resolution_date?: string;
    settlement_notes?: string;
    what_worked?: string;
    what_to_improve?: string;
    lesson_tags: string[];
    created_at: string;
}

// Next Step Types
export interface NextStep {
    id: string;
    case_id: string;
    title: string;
    completed: boolean;
    completed_at?: string;
    due_date?: string;
    source: 'manual' | 'ai';
    created_by: string;
    created_at: string;
}

// Filter Types
export interface CaseFilters {
    type?: CaseType;
    severity?: CaseSeverity;
    status?: CaseStatus;
    date_from?: string;
    date_to?: string;
    search?: string;
}

// Auth Types
export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

// Modal Types
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

