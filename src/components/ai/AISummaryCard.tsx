import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui';
import { FileText, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { generateCaseSummary, type CaseContext } from '../../lib/openai';
import { FormattedAIContent } from './FormattedAIContent';

interface AISummaryCardProps {
    caseContext: CaseContext;
    cachedSummary?: string;
    onSummaryGenerated?: (summary: string) => void;
}

export function AISummaryCard({
    caseContext,
    cachedSummary,
    onSummaryGenerated
}: AISummaryCardProps) {
    const [summary, setSummary] = useState(cachedSummary || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const generateSummary = useCallback(async (force = false) => {
        if (summary && !force) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await generateCaseSummary(caseContext);
            if (response.error) {
                setError(response.error);
            } else {
                setSummary(response.content);
                onSummaryGenerated?.(response.content);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate summary');
        } finally {
            setIsLoading(false);
        }
    }, [caseContext, summary, onSummaryGenerated]);

    useEffect(() => {
        if (caseContext.description && !cachedSummary) {
            generateSummary();
        }
    }, [caseContext.description, cachedSummary]);

    useEffect(() => {
        if (cachedSummary) setSummary(cachedSummary);
    }, [cachedSummary]);

    const LoadingSkeleton = () => (
        <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-4/6" />
        </div>
    );

    return (
        <Card>
            <div
                className="px-5 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">AI Summary</h3>
                        <p className="text-xs text-slate-500">Auto-generated</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            generateSummary(true);
                        }}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer disabled:opacity-50"
                        title="Regenerate summary"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
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
                    ) : summary ? (
                        <FormattedAIContent content={summary} />
                    ) : (
                        <div className="text-sm text-slate-400 italic flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Generating summary...
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
