import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Modal } from '../ui';
import { Sparkles, Save, RefreshCw, CheckCircle, Lightbulb, AlertTriangle } from 'lucide-react';
import type { Outcome } from '../../types';

interface OutcomeEditorProps {
    outcome: Outcome | null;
    isGenerating: boolean;
    onGenerate: () => void;
    onSave: (data: {
        outcome_type?: string;
        resolution_date?: string;
        settlement_notes?: string;
        what_worked?: string;
        what_to_improve?: string;
    }) => Promise<void>;
}

const outcomeTypes = [
    'Resolved - Mutual Agreement',
    'Resolved - Mediation',
    'Resolved - Investigation Complete',
    'Resolved - Policy Change',
    'Resolved - Training Provided',
    'Resolved - Disciplinary Action',
    'Closed - No Action Required',
    'Closed - Withdrawn'
];

export function OutcomeEditor({
    outcome,
    isGenerating,
    onGenerate,
    onSave
}: OutcomeEditorProps) {
    const [formData, setFormData] = useState({
        outcome_type: '',
        resolution_date: '',
        settlement_notes: '',
        what_worked: '',
        what_to_improve: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (outcome) {
            setFormData({
                outcome_type: outcome.outcome_type || '',
                resolution_date: outcome.resolution_date || '',
                settlement_notes: outcome.settlement_notes || '',
                what_worked: outcome.what_worked || '',
                what_to_improve: outcome.what_to_improve || ''
            });
            if (!isInitialLoad) {
                setHasChanges(true);
            }
            setIsInitialLoad(false);
        }
    }, [outcome]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSaveClick = () => {
        setShowConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        setShowConfirmModal(false);
        setIsSaving(true);
        try {
            await onSave(formData);
            setHasChanges(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50">
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900">AI Outcome Analysis</h4>
                                <p className="text-sm text-slate-500">
                                    Generate outcome based on all case data
                                </p>
                            </div>
                        </div>
                        <Button onClick={onGenerate} disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    {outcome ? 'Regenerate' : 'Generate with AI'}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Resolution Details</h3>
                </div>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Outcome Type
                        </label>
                        <select
                            value={formData.outcome_type}
                            onChange={(e) => handleChange('outcome_type', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        >
                            <option value="">Select outcome type...</option>
                            {outcomeTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Resolution Date
                        </label>
                        <input
                            type="date"
                            value={formData.resolution_date}
                            onChange={(e) => handleChange('resolution_date', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Resolution Summary</h3>
                </div>
                <CardContent>
                    <textarea
                        value={formData.settlement_notes}
                        onChange={(e) => handleChange('settlement_notes', e.target.value)}
                        placeholder="Describe how the case was resolved..."
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
                    />
                </CardContent>
            </Card>

            <Card>
                <div className="px-5 py-4 border-b border-slate-100 bg-emerald-50">
                    <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        What Worked Well
                    </h3>
                </div>
                <CardContent>
                    <textarea
                        value={formData.what_worked}
                        onChange={(e) => handleChange('what_worked', e.target.value)}
                        placeholder="What processes or approaches worked well in handling this case..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                    />
                </CardContent>
            </Card>

            <Card>
                <div className="px-5 py-4 border-b border-slate-100 bg-amber-50">
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Areas for Improvement
                    </h3>
                </div>
                <CardContent>
                    <textarea
                        value={formData.what_to_improve}
                        onChange={(e) => handleChange('what_to_improve', e.target.value)}
                        placeholder="What could be improved for handling similar cases in the future..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={handleSaveClick}
                    disabled={isSaving || !hasChanges}
                    className={hasChanges ? 'ring-2 ring-sky-500/30' : ''}
                >
                    {isSaving ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Outcome
                        </>
                    )}
                </Button>
            </div>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Close Case"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-slate-700">
                                Saving this outcome will mark the case as <strong>Closed</strong>.
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                Once closed, the case will be moved to the Library for future reference. You can still view and export the case, but it cannot be reopened.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowConfirmModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmSave}>
                            Close Case
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
