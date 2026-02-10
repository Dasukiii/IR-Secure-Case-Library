import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, SeverityBadge, Input } from '../components/ui';
import { searchCasesWithOutcomes } from '../lib/database';
import {
    Search as SearchIcon,
    Filter,
    ChevronDown,
    BookOpen,
    Lightbulb,
    Download,
    RefreshCw,
    Info,
    CheckCircle
} from 'lucide-react';
import type { CaseType } from '../types';

interface SearchResult {
    id: string;
    title: string;
    type: 'ER' | 'IR';
    severity: string;
    status: string;
    description: string;
    parties: string[];
    created_at: string;
    outcome?: {
        what_worked?: string;
        what_to_improve?: string;
    };
}

export function Library() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);

    const [filterType, setFilterType] = useState<CaseType | 'all'>('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);
        setHasSearched(true);

        try {
            const searchResults = await searchCasesWithOutcomes({
                query: searchQuery,
                type: filterType !== 'all' ? filterType : undefined,
                dateFrom: filterDateFrom || undefined,
                dateTo: filterDateTo || undefined
            });
            setResults(searchResults);
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setFilterType('all');
        setFilterDateFrom('');
        setFilterDateTo('');
        setHasSearched(false);
        setResults([]);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Library</h1>
                <p className="text-slate-500 mt-1">Find historical cases and lessons learned</p>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 flex items-center gap-3">
                <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <p className="text-sm text-sky-800">
                    This search only includes <strong>closed cases</strong> to help you find precedents and lessons learned from resolved situations.
                </p>
            </div>

            <Card>
                <CardContent className="py-6">
                    <form onSubmit={handleSearch}>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by keyword, case title, or lesson learned..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                />
                            </div>
                            <Button type="submit" size="lg" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Searching...
                                    </>
                                ) : 'Search'}
                            </Button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="mt-4 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
                        >
                            <Filter className="w-4 h-4" />
                            Advanced Filters
                            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Type</label>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value as CaseType | 'all')}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg cursor-pointer"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="ER">Employee Relations</option>
                                        <option value="IR">Industrial Relations</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date Range</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={filterDateFrom}
                                            onChange={(e) => setFilterDateFrom(e.target.value)}
                                            placeholder="From"
                                            className="py-2"
                                        />
                                        <Input
                                            type="date"
                                            value={filterDateTo}
                                            onChange={(e) => setFilterDateTo(e.target.value)}
                                            placeholder="To"
                                            className="py-2"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={clearFilters}
                                        className="w-full"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {hasSearched && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            {isLoading ? 'Searching...' : `Found ${results.length} precedent cases`}
                        </p>
                        {results.length > 0 && (
                            <Button variant="secondary" size="sm">
                                <Download className="w-4 h-4" />
                                Export Results
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <RefreshCw className="w-8 h-8 text-sky-500 mx-auto mb-4 animate-spin" />
                                <p className="text-slate-500">Searching cases...</p>
                            </CardContent>
                        </Card>
                    ) : results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((result) => (
                                <Card
                                    key={result.id}
                                    hoverable
                                    onClick={() => navigate(`/cases/${result.id}`)}
                                >
                                    <CardContent>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{result.title}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs font-medium ${result.type === 'ER' ? 'text-blue-600' : 'text-teal-600'}`}>
                                                            {result.type === 'ER' ? 'Employee Relations' : 'Industrial Relations'}
                                                        </span>
                                                        <span className="text-slate-300">-</span>
                                                        <span className="text-xs text-slate-500">
                                                            {formatDate(result.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <SeverityBadge severity={result.severity as 'Low' | 'Medium' | 'High' | 'Critical'} />
                                        </div>

                                        <p className="text-sm text-slate-600 mb-3">{result.description}</p>

                                        {result.outcome?.what_worked && (
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                    <p className="text-sm font-medium text-emerald-800">What Worked Well:</p>
                                                </div>
                                                <p className="text-sm text-emerald-700">{result.outcome.what_worked}</p>
                                            </div>
                                        )}

                                        {result.outcome?.what_to_improve && (
                                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Lightbulb className="w-4 h-4 text-amber-600" />
                                                    <p className="text-sm font-medium text-amber-800">Areas for Improvement:</p>
                                                </div>
                                                <p className="text-sm text-amber-700">{result.outcome.what_to_improve}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-1">No results found</h3>
                                <p className="text-sm text-slate-500">Try adjusting your search terms or filters</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {!hasSearched && (
                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardContent className="py-8 text-center">
                            <BookOpen className="w-12 h-12 text-sky-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Browse Precedents</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Search through historical cases to find relevant precedents and learn from past experiences.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-8 text-center">
                            <Lightbulb className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Learn from History</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Access lessons learned from resolved cases to improve future case handling.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
