import { supabase } from './supabase';
import type { Case, CaseType, CaseSeverity, CaseStatus, TimelineEvent, Evidence, Outcome, NextStep } from '../types';

// ============== CASES ==============

export interface CreateCaseData {
    title: string;
    type: CaseType;
    severity: CaseSeverity;
    status: CaseStatus;
    description: string;
    parties: string[];
    reported_date?: string;
    incident_date?: string;
}

export interface UpdateCaseData extends Partial<CreateCaseData> {
    resolution_date?: string;
}

export async function getCases(filters?: {
    type?: CaseType;
    severity?: CaseSeverity;
    status?: CaseStatus;
    search?: string;
}) {
    let query = supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters?.type) {
        query = query.eq('type', filters.type);
    }
    if (filters?.severity) {
        query = query.eq('severity', filters.severity);
    }
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }
    if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Case[];
}

export async function getCaseById(id: string) {
    const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Case;
}

export async function createCase(caseData: CreateCaseData) {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('cases')
        .insert({
            title: caseData.title,
            type: caseData.type,
            severity: caseData.severity,
            status: caseData.status,
            description: caseData.description,
            parties: caseData.parties,
            key_dates: {
                reported_date: caseData.reported_date,
                incident_date: caseData.incident_date
            },
            created_by: user.user.id
        })
        .select()
        .single();

    if (error) throw error;

    // Auto-log case creation to timeline
    await logTimelineEvent(data.id, 'creation', 'Case created');

    return data as Case;
}

export async function updateCase(id: string, caseData: UpdateCaseData) {
    const updateData: Record<string, unknown> = {};

    if (caseData.title) updateData.title = caseData.title;
    if (caseData.type) updateData.type = caseData.type;
    if (caseData.severity) updateData.severity = caseData.severity;
    if (caseData.status) updateData.status = caseData.status;
    if (caseData.description) updateData.description = caseData.description;
    if (caseData.parties) updateData.parties = caseData.parties;

    if (caseData.reported_date || caseData.incident_date || caseData.resolution_date) {
        const { data: existingCase } = await supabase
            .from('cases')
            .select('key_dates')
            .eq('id', id)
            .single();

        updateData.key_dates = {
            ...existingCase?.key_dates,
            ...(caseData.reported_date && { reported_date: caseData.reported_date }),
            ...(caseData.incident_date && { incident_date: caseData.incident_date }),
            ...(caseData.resolution_date && { resolution_date: caseData.resolution_date })
        };
    }

    const { data, error } = await supabase
        .from('cases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    // Auto-log case update to timeline
    await logTimelineEvent(id, 'update', 'Case details updated');

    return data as Case;
}

export async function deleteCase(id: string) {
    const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============== AI CONTENT MANAGEMENT ==============

export async function updateCaseAISummary(caseId: string, summary: string) {
    const { data, error } = await supabase
        .from('cases')
        .update({
            ai_summary: summary,
            ai_summary_generated_at: new Date().toISOString()
        })
        .eq('id', caseId)
        .select()
        .single();

    if (error) throw error;
    return data as Case;
}

export async function updateCaseRiskAnalysis(caseId: string, analysis: string) {
    const { data, error } = await supabase
        .from('cases')
        .update({
            ai_risk_analysis: analysis,
            ai_risk_analysis_generated_at: new Date().toISOString()
        })
        .eq('id', caseId)
        .select()
        .single();

    if (error) throw error;
    return data as Case;
}

// ============== TIMELINE EVENTS ==============

export async function getTimelineEvents(caseId: string) {
    const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('case_id', caseId)
        .order('event_date', { ascending: false });

    if (error) throw error;
    return data as TimelineEvent[];
}

export async function createTimelineEvent(event: {
    case_id: string;
    event_type: string;
    description: string;
    event_date: string;
}) {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('timeline_events')
        .insert({
            ...event,
            created_by: user.user.id
        })
        .select()
        .single();

    if (error) throw error;
    return data as TimelineEvent;
}

// Auto-log timeline event helper
export async function logTimelineEvent(caseId: string, eventType: string, description: string) {
    try {
        await createTimelineEvent({
            case_id: caseId,
            event_type: eventType,
            description: description,
            event_date: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to log timeline event:', error);
        // Don't throw - timeline logging shouldn't break main operations
    }
}

// ============== NEXT STEPS ==============

export async function getNextSteps(caseId: string) {
    const { data, error } = await supabase
        .from('next_steps')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data as NextStep[];
}

export async function createNextSteps(caseId: string, steps: string[], source: 'manual' | 'ai') {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) throw new Error('Not authenticated');

    const stepsData = steps.map(title => ({
        case_id: caseId,
        title,
        completed: false,
        source,
        created_by: user.user!.id
    }));

    const { data, error } = await supabase
        .from('next_steps')
        .insert(stepsData)
        .select();

    if (error) throw error;

    // Log to timeline
    await logTimelineEvent(caseId, 'update', `${steps.length} next steps added${source === 'ai' ? ' (AI suggested)' : ''}`);

    return data as NextStep[];
}

export async function updateNextStep(id: string, completed: boolean, caseId?: string) {
    const { data, error } = await supabase
        .from('next_steps')
        .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    // Log to timeline if completed
    if (completed && caseId) {
        await logTimelineEvent(caseId, 'update', `Completed: ${data.title}`);
    }

    return data as NextStep;
}

export async function deleteNextStep(id: string) {
    const { error } = await supabase
        .from('next_steps')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Replace all AI next steps with new ones (for regeneration)
export async function replaceAINextSteps(caseId: string, newSteps: string[]) {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) throw new Error('Not authenticated');

    // Delete all existing AI-generated steps for this case
    const { error: deleteError } = await supabase
        .from('next_steps')
        .delete()
        .eq('case_id', caseId)
        .eq('source', 'ai');

    if (deleteError) throw deleteError;

    // Insert new steps
    if (newSteps.length > 0) {
        const stepsData = newSteps.map(title => ({
            case_id: caseId,
            title,
            completed: false,
            source: 'ai' as const,
            created_by: user.user!.id
        }));

        const { data, error } = await supabase
            .from('next_steps')
            .insert(stepsData)
            .select();

        if (error) throw error;

        // Log to timeline
        await logTimelineEvent(caseId, 'update', `Next steps regenerated (${newSteps.length} AI suggestions)`);

        return data as NextStep[];
    }

    return [];
}

// ============== EVIDENCE ==============

export async function getEvidence(caseId: string) {
    const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .eq('case_id', caseId)
        .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data as Evidence[];
}

export async function uploadEvidence(file: File, caseId: string, documentType: string) {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) throw new Error('Not authenticated');

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${caseId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('evidence')
        .getPublicUrl(fileName);

    // Create evidence record
    const { data, error } = await supabase
        .from('evidence')
        .insert({
            case_id: caseId,
            document_name: file.name,
            document_type: documentType,
            file_url: urlData.publicUrl,
            file_size: file.size,
            uploaded_by: user.user.id
        })
        .select()
        .single();

    if (error) throw error;

    // Auto-log to timeline
    await logTimelineEvent(caseId, 'evidence_uploaded', `Evidence uploaded: ${file.name}`);

    return data as Evidence;
}

export async function deleteEvidence(id: string, caseId: string, fileName: string) {
    const { error } = await supabase
        .from('evidence')
        .delete()
        .eq('id', id);

    if (error) throw error;

    // Log to timeline
    await logTimelineEvent(caseId, 'update', `Evidence removed: ${fileName}`);
}

// ============== OUTCOMES ==============

export async function getOutcome(caseId: string) {
    const { data, error } = await supabase
        .from('outcomes')
        .select('*')
        .eq('case_id', caseId)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data as Outcome | null;
}

export async function createOrUpdateOutcome(caseId: string, outcome: {
    outcome_type?: string;
    resolution_date?: string;
    settlement_notes?: string;
    what_worked?: string;
    what_to_improve?: string;
    lesson_tags?: string[];
}) {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) throw new Error('Not authenticated');

    // Check if outcome exists
    const existing = await getOutcome(caseId);

    if (existing) {
        const { data, error } = await supabase
            .from('outcomes')
            .update(outcome)
            .eq('case_id', caseId)
            .select()
            .single();

        if (error) throw error;

        // Log to timeline
        await logTimelineEvent(caseId, 'update', 'Case outcome updated');

        return data as Outcome;
    } else {
        const { data, error } = await supabase
            .from('outcomes')
            .insert({
                case_id: caseId,
                created_by: user.user.id,
                ...outcome
            })
            .select()
            .single();

        if (error) throw error;

        // Log to timeline
        await logTimelineEvent(caseId, 'resolution', 'Case outcome recorded');

        return data as Outcome;
    }
}

// ============== DASHBOARD STATS ==============

export async function getDashboardStats() {
    const { data: cases, error } = await supabase
        .from('cases')
        .select('status, severity, created_at');

    if (error) throw error;

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
        totalCases: cases.length,
        openCases: cases.filter(c => c.status === 'Open').length,
        pendingCases: cases.filter(c => c.status === 'Pending').length,
        closedCases: cases.filter(c => c.status === 'Closed').length,
        criticalCases: cases.filter(c => c.severity === 'Critical' && c.status !== 'Closed').length,
        casesThisMonth: cases.filter(c => new Date(c.created_at) >= thisMonth).length
    };
}

export async function getRecentCases(limit = 5) {
    const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as Case[];
}

// ============== SEARCH & PRECEDENTS ==============

export interface SearchFilters {
    query?: string;
    type?: CaseType;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
    outcomeType?: string;
}

export async function searchCasesWithOutcomes(filters: SearchFilters) {
    // First get cases that match the basic filters
    let caseQuery = supabase
        .from('cases')
        .select('*')
        .eq('status', 'Closed') // Only search closed cases for precedents
        .order('created_at', { ascending: false });

    if (filters.query) {
        caseQuery = caseQuery.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    if (filters.type) {
        caseQuery = caseQuery.eq('type', filters.type);
    }

    if (filters.dateFrom) {
        caseQuery = caseQuery.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
        caseQuery = caseQuery.lte('created_at', filters.dateTo);
    }

    const { data: cases, error: caseError } = await caseQuery;
    if (caseError) throw caseError;
    if (!cases || cases.length === 0) return [];

    // Get outcomes for these cases
    const caseIds = cases.map(c => c.id);
    const { data: outcomes, error: outcomeError } = await supabase
        .from('outcomes')
        .select('*')
        .in('case_id', caseIds);

    if (outcomeError) throw outcomeError;

    // Map outcomes to cases
    const outcomeMap = new Map(outcomes?.map(o => [o.case_id, o]) || []);

    // Filter by outcome type and tags if specified
    let results = cases.map(caseItem => ({
        ...caseItem,
        outcome: outcomeMap.get(caseItem.id) || null
    }));

    // Filter by outcome type
    if (filters.outcomeType) {
        results = results.filter(r =>
            r.outcome?.outcome_type?.toLowerCase().includes(filters.outcomeType!.toLowerCase())
        );
    }

    // Filter by lesson tags
    if (filters.tags && filters.tags.length > 0) {
        results = results.filter(r => {
            const caseTags = r.outcome?.lesson_tags || [];
            return filters.tags!.some(tag => caseTags.includes(tag));
        });
    }

    // Also search in outcome fields
    if (filters.query) {
        const query = filters.query.toLowerCase();
        results = results.filter(r => {
            const matchesCase =
                r.title.toLowerCase().includes(query) ||
                (r.description?.toLowerCase().includes(query) || false);
            const matchesOutcome = r.outcome && (
                r.outcome.settlement_notes?.toLowerCase().includes(query) ||
                r.outcome.what_worked?.toLowerCase().includes(query) ||
                r.outcome.what_to_improve?.toLowerCase().includes(query) ||
                r.outcome.lesson_tags?.some((tag: string) => tag.toLowerCase().includes(query))
            );
            return matchesCase || matchesOutcome;
        });
    }

    return results;
}

export async function getPopularLessonTags(): Promise<string[]> {
    // Get all outcomes with lesson tags
    const { data: outcomes, error } = await supabase
        .from('outcomes')
        .select('lesson_tags');

    if (error) throw error;

    // Count tag occurrences
    const tagCounts = new Map<string, number>();
    outcomes?.forEach(outcome => {
        const tags = outcome.lesson_tags || [];
        tags.forEach((tag: string) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
    });

    // Sort by count and return top tags
    const sortedTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, 12);

    // If no tags in database, return defaults
    if (sortedTags.length === 0) {
        return [
            'harassment', 'discrimination', 'grievance', 'disciplinary',
            'settlement', 'training', 'policy', 'termination', 'union',
            'documentation', 'communication', 'mediation'
        ];
    }

    return sortedTags;
}
