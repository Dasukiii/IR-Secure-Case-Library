import { useState } from 'react';
import { Card, CardContent, Button } from '../ui';
import { Check, Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import type { NextStep } from '../../types';

interface NextStepsChecklistProps {
    steps: NextStep[];
    suggestedSteps: string[];
    isGeneratingSteps: boolean;
    onAcceptSuggestions: () => void;
    onRegenerateSuggestions: () => void;
    onToggleStep: (id: string, completed: boolean) => void;
    onDeleteStep: (id: string) => void;
    onAddManualStep: (title: string) => void;
}

export function NextStepsChecklist({
    steps,
    suggestedSteps,
    isGeneratingSteps,
    onAcceptSuggestions,
    onRegenerateSuggestions,
    onToggleStep,
    onDeleteStep,
    onAddManualStep
}: NextStepsChecklistProps) {
    const [newStepTitle, setNewStepTitle] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddStep = () => {
        if (newStepTitle.trim()) {
            onAddManualStep(newStepTitle.trim());
            setNewStepTitle('');
            setShowAddForm(false);
        }
    };

    const completedCount = steps.filter(s => s.completed).length;
    const totalCount = steps.length;

    return (
        <Card>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900">Next Steps</h3>
                    {totalCount > 0 && (
                        <p className="text-xs text-slate-500 mt-0.5">
                            {completedCount} of {totalCount} completed
                        </p>
                    )}
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <CardContent className="p-0">
                {/* AI Suggestions Section */}
                {(suggestedSteps.length > 0 || isGeneratingSteps) && (
                    <div className="p-4 bg-sky-50 border-b border-sky-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-sky-600" />
                            <span className="text-sm font-medium text-sky-800">
                                AI Suggested Steps
                            </span>
                            <button
                                onClick={onRegenerateSuggestions}
                                disabled={isGeneratingSteps}
                                className="ml-auto p-1 hover:bg-sky-100 rounded transition-colors cursor-pointer disabled:opacity-50"
                                title="Regenerate suggestions"
                            >
                                <RefreshCw className={`w-4 h-4 text-sky-600 ${isGeneratingSteps ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {isGeneratingSteps ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-6 bg-sky-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <ul className="space-y-2 mb-3">
                                    {suggestedSteps.map((step, index) => (
                                        <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                            <span className="text-sky-500">•</span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    size="sm"
                                    onClick={onAcceptSuggestions}
                                    className="w-full"
                                >
                                    <Check className="w-4 h-4" />
                                    Accept & Add to Checklist
                                </Button>
                                <p className="text-xs text-sky-600 mt-2 text-center">
                                    This will replace any existing AI suggestions
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Add New Step Form */}
                {showAddForm && (
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <input
                            type="text"
                            value={newStepTitle}
                            onChange={(e) => setNewStepTitle(e.target.value)}
                            placeholder="Enter new step..."
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                            autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={handleAddStep} disabled={!newStepTitle.trim()}>
                                Add Step
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewStepTitle('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Existing Steps Checklist */}
                {steps.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`px-4 py-3 flex items-center gap-3 group hover:bg-slate-50 transition-colors ${step.completed ? 'bg-slate-50/50' : ''
                                    }`}
                            >
                                <button
                                    onClick={() => onToggleStep(step.id, !step.completed)}
                                    className={`
                                        w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors
                                        ${step.completed
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-slate-300 hover:border-sky-500'
                                        }
                                    `}
                                >
                                    {step.completed && <Check className="w-3 h-3" />}
                                </button>
                                <span className={`text-sm flex-1 ${step.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {step.title}
                                </span>
                                {step.source === 'ai' && (
                                    <span className="text-xs px-1.5 py-0.5 bg-sky-100 text-sky-600 rounded">
                                        AI
                                    </span>
                                )}
                                <button
                                    onClick={() => onDeleteStep(step.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : !suggestedSteps.length && !isGeneratingSteps && (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        <p>No next steps yet.</p>
                        <p className="text-xs mt-1">AI suggestions will appear here, or add your own.</p>
                    </div>
                )}

                {/* Progress Bar */}
                {totalCount > 0 && (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
