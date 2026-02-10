import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui';
import {
    Sparkles,
    FileText,
    AlertTriangle,
    RefreshCw,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {
    generateCaseSummary,
    analyzeRisk,
    type CaseContext
} from '../../lib/openai';

interface AIAssistantProps {
    caseContext: CaseContext;
    caseId: string;
    cachedSummary?: string;
    cachedRiskAnalysis?: string;
    onSummaryGenerated?: (summary: string) => void;
    onRiskAnalysisGenerated?: (analysis: string) => void;
    className?: string;
}

export function AIAssistant({
    caseContext,
    caseId,
    cachedSummary,
    cachedRiskAnalysis,
    onSummaryGenerated,
    onRiskAnalysisGenerated,
    className = ''
}: AIAssistantProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [summary, setSummary] = useState(cachedSummary || '');
    const [riskAnalysis, setRiskAnalysis] = useState(cachedRiskAnalysis || '');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingRisk, setLoadingRisk] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [riskError, setRiskError] = useState<string | null>(null);

    const generateSummary = useCallback(async (force = false) => {
        // Skip if already cached and not forcing regeneration
        if (summary && !force) return;

        setLoadingSummary(true);
        setSummaryError(null);

        try {
            const response = await generateCaseSummary(caseContext);
            if (response.error) {
                setSummaryError(response.error);
            } else {
                setSummary(response.content);
                onSummaryGenerated?.(response.content);
            }
        } catch (err) {
            setSummaryError(err instanceof Error ? err.message : 'Failed to generate summary');
        } finally {
            setLoadingSummary(false);
        }
    }, [caseContext, summary, onSummaryGenerated]);

    const generateRiskAnalysis = useCallback(async (force = false) => {
        // Skip if already cached and not forcing regeneration
        if (riskAnalysis && !force) return;

        setLoadingRisk(true);
        setRiskError(null);

        try {
            const response = await analyzeRisk(caseContext);
            if (response.error) {
                setRiskError(response.error);
            } else {
                setRiskAnalysis(response.content);
                onRiskAnalysisGenerated?.(response.content);
            }
        } catch (err) {
            setRiskError(err instanceof Error ? err.message : 'Failed to analyze risks');
        } finally {
            setLoadingRisk(false);
        }
    }, [caseContext, riskAnalysis, onRiskAnalysisGenerated]);

    // Auto-generate on mount if not cached
    useEffect(() => {
        if (caseId && caseContext.description) {
            if (!cachedSummary) {
                generateSummary();
            }
            if (!cachedRiskAnalysis) {
                // Delay risk analysis to not overwhelm API
                const timer = setTimeout(() => generateRiskAnalysis(), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [caseId]); // Only run on mount/caseId change

    // Update from props if changed
    useEffect(() => {
        if (cachedSummary) setSummary(cachedSummary);
    }, [cachedSummary]);

    useEffect(() => {
        if (cachedRiskAnalysis) setRiskAnalysis(cachedRiskAnalysis);
    }, [cachedRiskAnalysis]);

    const LoadingSkeleton = () => (
        <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-4/6" />
        </div>
    );

    return (
        <Card className={className}>
            <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">AI Assistant</h3>
                        <p className="text-xs text-slate-500">Auto-generated insights</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
            </div>

            {isExpanded && (
                <CardContent className="p-0 border-t border-slate-100">
                    {/* Summary Section */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-sky-600" />
                                <span className="text-sm font-medium text-slate-700">Summary</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    generateSummary(true);
                                }}
                                disabled={loadingSummary}
                                className="p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer disabled:opacity-50"
                                title="Regenerate summary"
                            >
                                <RefreshCw className={`w-4 h-4 text-slate-400 ${loadingSummary ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {loadingSummary ? (
                            <LoadingSkeleton />
                        ) : summaryError ? (
                            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                                {summaryError}
                            </div>
                        ) : summary ? (
                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {summary}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 italic">
                                Generating summary...
                            </div>
                        )}
                    </div>

                    {/* Risk Analysis Section */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium text-slate-700">Risk Analysis</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    generateRiskAnalysis(true);
                                }}
                                disabled={loadingRisk}
                                className="p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer disabled:opacity-50"
                                title="Regenerate risk analysis"
                            >
                                <RefreshCw className={`w-4 h-4 text-slate-400 ${loadingRisk ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {loadingRisk ? (
                            <LoadingSkeleton />
                        ) : riskError ? (
                            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                                {riskError}
                            </div>
                        ) : riskAnalysis ? (
                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {riskAnalysis}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 italic">
                                Generating risk analysis...
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
