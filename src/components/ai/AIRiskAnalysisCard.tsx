import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui';
import { AlertTriangle, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeRisk, type CaseContext } from '../../lib/openai';
import { FormattedAIContent } from './FormattedAIContent';

interface AIRiskAnalysisCardProps {
    caseContext: CaseContext;
    cachedAnalysis?: string;
    onAnalysisGenerated?: (analysis: string) => void;
}

export function AIRiskAnalysisCard({
    caseContext,
    cachedAnalysis,
    onAnalysisGenerated
}: AIRiskAnalysisCardProps) {
    const [analysis, setAnalysis] = useState(cachedAnalysis || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const generateAnalysis = useCallback(async (force = false) => {
        if (analysis && !force) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await analyzeRisk(caseContext);
            if (response.error) {
                setError(response.error);
            } else {
                setAnalysis(response.content);
                onAnalysisGenerated?.(response.content);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze risks');
        } finally {
            setIsLoading(false);
        }
    }, [caseContext, analysis, onAnalysisGenerated]);

    useEffect(() => {
        if (caseContext.description && !cachedAnalysis) {
            const timer = setTimeout(() => generateAnalysis(), 1500);
            return () => clearTimeout(timer);
        }
    }, [caseContext.description, cachedAnalysis]);

    useEffect(() => {
        if (cachedAnalysis) setAnalysis(cachedAnalysis);
    }, [cachedAnalysis]);

    const LoadingSkeleton = () => (
        <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-amber-100 rounded w-full" />
            <div className="h-4 bg-amber-100 rounded w-5/6" />
            <div className="h-4 bg-amber-100 rounded w-4/6" />
        </div>
    );

    return (
        <Card className="border-amber-200">
            <div
                className="px-5 py-4 border-b border-amber-100 bg-amber-50/50 flex items-center justify-between cursor-pointer hover:bg-amber-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Risk Analysis</h3>
                        <p className="text-xs text-amber-600">AI-powered assessment</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            generateAnalysis(true);
                        }}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-amber-100 rounded transition-colors cursor-pointer disabled:opacity-50"
                        title="Regenerate risk analysis"
                    >
                        <RefreshCw className={`w-4 h-4 text-amber-500 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-amber-500" />
                    )}
                </div>
            </div>
            {isExpanded && (
                <CardContent>
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : error ? (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    ) : analysis ? (
                        <FormattedAIContent content={analysis} />
                    ) : (
                        <div className="text-sm text-amber-500 italic flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Analyzing risks...
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
