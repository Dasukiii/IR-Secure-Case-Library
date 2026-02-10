import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, Button, Input } from '../components/ui';
import { createCase, updateCase, getCaseById } from '../lib/database';
import {
    ArrowLeft,
    Save,
    Plus,
    X,
    Calendar,
    User,
    AlertTriangle,
    FileText
} from 'lucide-react';
import type { CaseType, CaseSeverity, CaseStatus } from '../types';

interface CaseFormData {
    title: string;
    type: CaseType;
    severity: CaseSeverity;
    status: CaseStatus;
    description: string;
    parties: string[];
    reported_date: string;
    incident_date: string;
}

const initialFormData: CaseFormData = {
    title: '',
    type: 'ER',
    severity: 'Medium',
    status: 'Open',
    description: '',
    parties: [''],
    reported_date: new Date().toISOString().split('T')[0],
    incident_date: ''
};

export function CaseForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = id && id !== 'new';

    const [formData, setFormData] = useState<CaseFormData>(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Load existing case data if editing
    useEffect(() => {
        if (isEditing && id) {
            setIsLoading(true);
            getCaseById(id)
                .then((caseData) => {
                    setFormData({
                        title: caseData.title,
                        type: caseData.type,
                        severity: caseData.severity,
                        status: caseData.status,
                        description: caseData.description || '',
                        parties: caseData.parties?.length ? caseData.parties : [''],
                        reported_date: caseData.key_dates?.reported_date || '',
                        incident_date: caseData.key_dates?.incident_date || ''
                    });
                })
                .catch((error) => {
                    console.error('Error loading case:', error);
                    setSubmitError('Failed to load case data');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isEditing, id]);

    // Auto-save draft to localStorage (only for new cases)
    useEffect(() => {
        if (isEditing) return; // Don't auto-save drafts for existing cases

        const autosaveTimer = setTimeout(() => {
            if (formData.title) {
                localStorage.setItem('case_draft_new', JSON.stringify(formData));
                setLastSaved(new Date());
            }
        }, 2000);

        return () => clearTimeout(autosaveTimer);
    }, [formData, isEditing]);

    // Load draft on mount (only for new cases)
    useEffect(() => {
        if (!isEditing) {
            const draft = localStorage.getItem('case_draft_new');
            if (draft) {
                const parsed = JSON.parse(draft);
                setFormData(parsed);
            }
        }
    }, [isEditing]);

    const handleInputChange = (field: keyof CaseFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePartyChange = (index: number, value: string) => {
        const newParties = [...formData.parties];
        newParties[index] = value;
        setFormData(prev => ({ ...prev, parties: newParties }));
    };

    const addParty = () => {
        setFormData(prev => ({ ...prev, parties: [...prev.parties, ''] }));
    };

    const removeParty = (index: number) => {
        if (formData.parties.length > 1) {
            const newParties = formData.parties.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, parties: newParties }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.incident_date) {
            newErrors.incident_date = 'Incident date is required';
        }

        const validParties = formData.parties.filter(p => p.trim());
        if (validParties.length === 0) {
            newErrors.parties = 'At least one party is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        setSubmitError(null);

        try {
            const validParties = formData.parties.filter(p => p.trim());

            if (isEditing && id) {
                // Update existing case
                await updateCase(id, {
                    title: formData.title,
                    type: formData.type,
                    severity: formData.severity,
                    status: formData.status,
                    description: formData.description,
                    parties: validParties,
                    reported_date: formData.reported_date,
                    incident_date: formData.incident_date
                });
            } else {
                // Create new case
                await createCase({
                    title: formData.title,
                    type: formData.type,
                    severity: formData.severity,
                    status: formData.status,
                    description: formData.description,
                    parties: validParties,
                    reported_date: formData.reported_date,
                    incident_date: formData.incident_date
                });
            }

            // Clear draft (only for new cases)
            if (!isEditing) {
                localStorage.removeItem('case_draft_new');
            }

            // Navigate to case list
            navigate('/cases');
        } catch (error) {
            console.error('Error saving case:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to save case. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = () => {
        localStorage.setItem(`case_draft_${id || 'new'}`, JSON.stringify(formData));
        setLastSaved(new Date());
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/cases')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isEditing ? 'Edit Case' : 'Create New Case'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {isEditing ? 'Update case information' : 'Fill in the details to create a new case'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {lastSaved && (
                        <span className="text-sm text-slate-400">
                            Draft saved {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                    <Button variant="secondary" onClick={handleSaveDraft}>
                        Save Draft
                    </Button>
                    <Button onClick={handleSubmit} isLoading={isSaving}>
                        <Save className="w-4 h-4" />
                        {isEditing ? 'Update Case' : 'Create Case'}
                    </Button>
                </div>
            </div>

            {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-sky-600" />
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <Input
                                    label="Case Title *"
                                    placeholder="Enter a descriptive title for this case"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    error={errors.title}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Case Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleInputChange('type', e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                                    >
                                        <option value="ER">Employee Relations (ER)</option>
                                        <option value="IR">Industrial Relations (IR)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Severity *
                                    </label>
                                    <select
                                        value={formData.severity}
                                        onChange={(e) => handleInputChange('severity', e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Status *
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                                    >
                                        <option value="Open">Open</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Provide a detailed description of the case..."
                                    rows={4}
                                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none ${errors.description ? 'border-red-300' : 'border-slate-200'
                                        }`}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Dates */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-sky-600" />
                            Key Dates
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Date Reported *"
                                    type="date"
                                    value={formData.reported_date}
                                    onChange={(e) => handleInputChange('reported_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Date of Incident *"
                                    type="date"
                                    value={formData.incident_date}
                                    onChange={(e) => handleInputChange('incident_date', e.target.value)}
                                    error={errors.incident_date}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Involved Parties */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-sky-600" />
                                Involved Parties
                            </h2>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={addParty}
                            >
                                <Plus className="w-4 h-4" />
                                Add Party
                            </Button>
                        </div>

                        {errors.parties && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                                <AlertTriangle className="w-4 h-4" />
                                {errors.parties}
                            </div>
                        )}

                        <div className="space-y-3">
                            {formData.parties.map((party, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        placeholder={`Party ${index + 1} name (e.g., John Doe, HR Department)`}
                                        value={party}
                                        onChange={(e) => handlePartyChange(index, e.target.value)}
                                        className="flex-1"
                                    />
                                    {formData.parties.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeParty(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions (Mobile) */}
                <div className="flex items-center justify-end gap-3 lg:hidden">
                    <Button variant="secondary" onClick={() => navigate('/cases')}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSaving}>
                        <Save className="w-4 h-4" />
                        {isEditing ? 'Update Case' : 'Create Case'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
