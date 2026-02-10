import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, StatusBadge, SeverityBadge } from '../components/ui';
import { AISummaryCard, AIRiskAnalysisCard } from '../components/ai';
import { NextStepsChecklist, EvidenceUploadModal } from '../components/case';
import { exportCaseToPDF } from '../lib/pdfExport';
import {
    getCaseById,
    getTimelineEvents,
    getEvidence,
    getOutcome,
    getNextSteps,
    updateNextStep,
    deleteNextStep,
    replaceAINextSteps,
    createNextSteps,
    uploadEvidence,
    deleteEvidence,
    createOrUpdateOutcome,
    updateCaseAISummary,
    updateCaseRiskAnalysis
} from '../lib/database';
import { generateNextStepsList } from '../lib/openai';
import {
    ArrowLeft,
    Edit,
    FileText,
    Lightbulb,
    Upload,
    Plus,
    User,
    CheckCircle,
    Download,
    Eye,
    Trash2,
    MoreVertical,
    FileDown,
    Save,
    RefreshCw
} from 'lucide-react';
import type { Case, TimelineEvent, Evidence, Outcome, NextStep, DocumentType } from '../types';

type TabType = 'overview' | 'evidence';

export function CaseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
    const [outcome, setOutcome] = useState<Outcome | null>(null);
    const [nextSteps, setNextSteps] = useState<NextStep[]>([]);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [suggestedSteps, setSuggestedSteps] = useState<string[]>([]);
    const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);

    const [outcomeForm, setOutcomeForm] = useState({
        what_worked: '',
        what_to_improve: ''
    });
    const [isSavingOutcome, setIsSavingOutcome] = useState(false);
    const [hasOutcomeChanges, setHasOutcomeChanges] = useState(false);

    const loadCaseData = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);
        try {
            const [loadedCase, loadedTimeline, loadedEvidence, loadedOutcome, loadedNextSteps] = await Promise.all([
                getCaseById(id),
                getTimelineEvents(id),
                getEvidence(id),
                getOutcome(id),
                getNextSteps(id)
            ]);
            setCaseData(loadedCase);
            setTimeline(loadedTimeline);
            setEvidenceList(loadedEvidence);
            setOutcome(loadedOutcome);
            setNextSteps(loadedNextSteps);

            if (loadedOutcome) {
                setOutcomeForm({
                    what_worked: loadedOutcome.what_worked || '',
                    what_to_improve: loadedOutcome.what_to_improve || ''
                });
            }

            if (loadedNextSteps.length === 0 && loadedCase) {
                generateStepsSuggestions(loadedCase);
            }
        } catch (err) {
            console.error('Error loading case:', err);
            setError(err instanceof Error ? err.message : 'Failed to load case');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadCaseData();
    }, [loadCaseData]);

    const generateStepsSuggestions = async (caseInfo: Case = caseData!) => {
        if (!caseInfo) return;

        setIsGeneratingSteps(true);
        try {
            const response = await generateNextStepsList({
                title: caseInfo.title,
                type: caseInfo.type,
                severity: caseInfo.severity,
                status: caseInfo.status,
                description: caseInfo.description || '',
                parties: caseInfo.parties || [],
                timeline: timeline.map(e => `${e.event_date}: ${e.description}`)
            });

            if (!response.error && response.steps.length > 0) {
                setSuggestedSteps(response.steps);
            }
        } catch (err) {
            console.error('Failed to generate next steps:', err);
        } finally {
            setIsGeneratingSteps(false);
        }
    };

    const handleAcceptSuggestions = async () => {
        if (!id || suggestedSteps.length === 0) return;

        try {
            const newSteps = await replaceAINextSteps(id, suggestedSteps);
            setNextSteps(prev => [
                ...prev.filter(s => s.source !== 'ai'),
                ...newSteps
            ]);
            setSuggestedSteps([]);
            const updatedTimeline = await getTimelineEvents(id);
            setTimeline(updatedTimeline);
        } catch (err) {
            console.error('Failed to accept suggestions:', err);
        }
    };

    const handleRegenerateSuggestions = () => {
        generateStepsSuggestions();
    };

    const handleToggleStep = async (stepId: string, completed: boolean) => {
        if (!id) return;

        try {
            const updated = await updateNextStep(stepId, completed, id);
            setNextSteps(prev => prev.map(s => s.id === stepId ? updated : s));
            const updatedTimeline = await getTimelineEvents(id);
            setTimeline(updatedTimeline);
        } catch (err) {
            console.error('Failed to update step:', err);
        }
    };

    const handleDeleteStep = async (stepId: string) => {
        try {
            await deleteNextStep(stepId);
            setNextSteps(prev => prev.filter(s => s.id !== stepId));
        } catch (err) {
            console.error('Failed to delete step:', err);
        }
    };

    const handleAddManualStep = async (title: string) => {
        if (!id) return;

        try {
            const newSteps = await createNextSteps(id, [title], 'manual');
            setNextSteps(prev => [...prev, ...newSteps]);
        } catch (err) {
            console.error('Failed to add step:', err);
        }
    };

    const handleUploadEvidence = async (file: File, documentType: DocumentType) => {
        if (!id) return;

        const newEvidence = await uploadEvidence(file, id, documentType);
        setEvidenceList(prev => [newEvidence, ...prev]);
        const updatedTimeline = await getTimelineEvents(id);
        setTimeline(updatedTimeline);
    };

    const handleDeleteEvidence = async (evidenceId: string, fileName: string) => {
        if (!id) return;

        try {
            await deleteEvidence(evidenceId, id, fileName);
            setEvidenceList(prev => prev.filter(e => e.id !== evidenceId));
            const updatedTimeline = await getTimelineEvents(id);
            setTimeline(updatedTimeline);
        } catch (err) {
            console.error('Failed to delete evidence:', err);
        }
    };

    const handleOutcomeChange = (field: string, value: string) => {
        setOutcomeForm(prev => ({ ...prev, [field]: value }));
        setHasOutcomeChanges(true);
    };

    const handleSaveOutcome = async () => {
        if (!id) return;

        setIsSavingOutcome(true);
        try {
            const savedOutcome = await createOrUpdateOutcome(id, {
                what_worked: outcomeForm.what_worked,
                what_to_improve: outcomeForm.what_to_improve
            });
            setOutcome(savedOutcome);
            setHasOutcomeChanges(false);
        } catch (err) {
            console.error('Failed to save outcome:', err);
        } finally {
            setIsSavingOutcome(false);
        }
    };

    const handleSaveSummary = async (summary: string) => {
        if (!id) return;
        try {
            await updateCaseAISummary(id, summary);
        } catch (err) {
            console.error('Failed to save summary:', err);
        }
    };

    const handleSaveRiskAnalysis = async (analysis: string) => {
        if (!id) return;
        try {
            await updateCaseRiskAnalysis(id, analysis);
        } catch (err) {
            console.error('Failed to save risk analysis:', err);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: FileText },
        { id: 'evidence' as const, label: 'Evidence', icon: Upload }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">
                    {error || 'Case not found'}
                </h3>
                <Button onClick={() => navigate('/cases')} className="mt-4">
                    Back to Cases
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => navigate('/cases')}
                        className="mt-1 p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-slate-900">{caseData.title}</h1>
                            <StatusBadge status={caseData.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className={`font-medium ${caseData.type === 'ER' ? 'text-blue-600' : 'text-teal-600'}`}>
                                {caseData.type === 'ER' ? 'Employee Relations' : 'Industrial Relations'}
                            </span>
                            <span>-</span>
                            <SeverityBadge severity={caseData.severity} />
                            <span>-</span>
                            <span>Case #{id?.slice(0, 8)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => exportCaseToPDF({
                            id: caseData.id,
                            title: caseData.title,
                            type: caseData.type,
                            severity: caseData.severity,
                            status: caseData.status,
                            description: caseData.description || '',
                            parties: caseData.parties || [],
                            key_dates: caseData.key_dates,
                            created_by: caseData.created_by,
                            created_at: caseData.created_at,
                            updated_at: caseData.updated_at,
                            ai_summary: caseData.ai_summary,
                            ai_risk_analysis: caseData.ai_risk_analysis,
                            timeline: timeline.map(e => ({
                                event_type: e.event_type,
                                description: e.description,
                                event_date: e.event_date
                            })),
                            evidence: evidenceList.map(e => ({
                                document_name: e.document_name,
                                document_type: e.document_type,
                                uploaded_at: e.uploaded_at
                            })),
                            next_steps: nextSteps.map(s => ({
                                title: s.title,
                                completed: s.completed,
                                source: s.source
                            })),
                            outcome: outcome ? {
                                what_worked: outcome.what_worked,
                                what_to_improve: outcome.what_to_improve,
                                lesson_tags: outcome.lesson_tags
                            } : undefined
                        })}
                        className="px-2"
                    >
                        <FileDown className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/cases/${id}/edit`)}>
                        <Edit className="w-4 h-4" />
                        Edit Case
                    </Button>
                    <Button variant="secondary" className="px-2">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Reported Date</p>
                        <p className="font-semibold text-slate-900">
                            {formatDate(caseData.key_dates?.reported_date)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Incident Date</p>
                        <p className="font-semibold text-slate-900">
                            {formatDate(caseData.key_dates?.incident_date)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Resolution Date</p>
                        <p className="font-semibold text-slate-900">
                            {formatDate(caseData.key_dates?.resolution_date)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Created</p>
                        <p className="font-semibold text-slate-900">{formatDate(caseData.created_at)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="border-b border-slate-200">
                <nav className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer
                                ${activeTab === tab.id
                                    ? 'border-sky-600 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.id === 'evidence' && evidenceList.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                                    {evidenceList.length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            <Card>
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h3 className="font-semibold text-slate-900">Description</h3>
                                </div>
                                <CardContent>
                                    <p className="text-slate-600 leading-relaxed">
                                        {caseData.description || 'No description provided.'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h3 className="font-semibold text-slate-900">Parties Involved</h3>
                                </div>
                                <CardContent>
                                    {caseData.parties && caseData.parties.length > 0 ? (
                                        <div className="space-y-3">
                                            {caseData.parties.map((party: string, index: number) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <span className="text-slate-700">{party}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">No parties specified.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <AIRiskAnalysisCard
                                caseContext={{
                                    title: caseData.title,
                                    type: caseData.type,
                                    severity: caseData.severity,
                                    status: caseData.status,
                                    description: caseData.description || '',
                                    parties: caseData.parties || [],
                                    timeline: timeline.map(e => `${e.event_date}: ${e.description}`)
                                }}
                                cachedAnalysis={caseData.ai_risk_analysis}
                                onAnalysisGenerated={handleSaveRiskAnalysis}
                            />

                            <Card>
                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                            <Lightbulb className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900">Lessons Learned</h3>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveOutcome}
                                        disabled={isSavingOutcome || !hasOutcomeChanges}
                                        className="px-2"
                                    >
                                        {isSavingOutcome ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-2">
                                            <CheckCircle className="w-4 h-4" />
                                            What Worked Well
                                        </label>
                                        <textarea
                                            value={outcomeForm.what_worked}
                                            onChange={(e) => handleOutcomeChange('what_worked', e.target.value)}
                                            placeholder="What processes or approaches worked well in handling this case..."
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-amber-700 mb-2">
                                            <Lightbulb className="w-4 h-4" />
                                            Areas for Improvement
                                        </label>
                                        <textarea
                                            value={outcomeForm.what_to_improve}
                                            onChange={(e) => handleOutcomeChange('what_to_improve', e.target.value)}
                                            placeholder="What could be improved for handling similar cases in the future..."
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <AISummaryCard
                                caseContext={{
                                    title: caseData.title,
                                    type: caseData.type,
                                    severity: caseData.severity,
                                    status: caseData.status,
                                    description: caseData.description || '',
                                    parties: caseData.parties || [],
                                    timeline: timeline.map(e => `${e.event_date}: ${e.description}`)
                                }}
                                cachedSummary={caseData.ai_summary}
                                onSummaryGenerated={handleSaveSummary}
                            />

                            <NextStepsChecklist
                                steps={nextSteps}
                                suggestedSteps={suggestedSteps}
                                isGeneratingSteps={isGeneratingSteps}
                                onAcceptSuggestions={handleAcceptSuggestions}
                                onRegenerateSuggestions={handleRegenerateSuggestions}
                                onToggleStep={handleToggleStep}
                                onDeleteStep={handleDeleteStep}
                                onAddManualStep={handleAddManualStep}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'evidence' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-900">Evidence & Documents</h3>
                            <Button onClick={() => setShowUploadModal(true)}>
                                <Upload className="w-4 h-4" />
                                Upload Document
                            </Button>
                        </div>

                        {evidenceList.length > 0 ? (
                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {evidenceList.map((doc) => (
                                            <div key={doc.id} className="p-5 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-slate-900 font-medium">{doc.document_name}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {formatFileSize(doc.file_size)} - {doc.document_type} - Uploaded {formatDate(doc.uploaded_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => window.open(doc.file_url, '_blank')}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = doc.file_url;
                                                            link.download = doc.document_name;
                                                            link.click();
                                                        }}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="text-red-500 hover:bg-red-50"
                                                        onClick={() => handleDeleteEvidence(doc.id, doc.document_name)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-1">No evidence uploaded</h3>
                                    <p className="text-slate-500 mb-4">Upload documents to support this case.</p>
                                    <Button onClick={() => setShowUploadModal(true)}>
                                        <Plus className="w-4 h-4" />
                                        Upload Document
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        <EvidenceUploadModal
                            isOpen={showUploadModal}
                            onClose={() => setShowUploadModal(false)}
                            onUpload={handleUploadEvidence}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
