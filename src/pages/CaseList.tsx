import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, StatusBadge, SeverityBadge, Input } from '../components/ui';
import { getCases } from '../lib/database';
import { exportCaseListToPDF } from '../lib/pdfExport';
import {
    Plus,
    Search,
    Filter,
    FileText,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    RefreshCw
} from 'lucide-react';
import type { Case, CaseType, CaseSeverity, CaseStatus } from '../types';

export function CaseList() {
    const navigate = useNavigate();
    const [cases, setCases] = useState<Case[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<CaseType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<CaseStatus | 'all'>('all');
    const [filterSeverity, setFilterSeverity] = useState<CaseSeverity | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);

    const loadCases = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: {
                type?: CaseType;
                severity?: CaseSeverity;
                status?: CaseStatus;
                search?: string;
            } = {};

            if (filterType !== 'all') filters.type = filterType;
            if (filterSeverity !== 'all') filters.severity = filterSeverity;
            if (filterStatus !== 'all') filters.status = filterStatus;
            if (searchQuery) filters.search = searchQuery;

            const data = await getCases(filters);
            setCases(data);
        } catch (err) {
            console.error('Error loading cases:', err);
            setError(err instanceof Error ? err.message : 'Failed to load cases');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCases();
    }, [filterType, filterStatus, filterSeverity]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadCases();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Case List</h1>
                    <p className="text-slate-500 mt-1">Browse and manage all ER/IR cases</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={loadCases}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="secondary" onClick={() => exportCaseListToPDF(cases)} disabled={!isLoading && cases.length === 0}>
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button onClick={() => navigate('/cases/new')}>
                        <Plus className="w-4 h-4" />
                        Create Case
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                    <button onClick={loadCases} className="ml-2 underline">Retry</button>
                </div>
            )}

            {/* Search and Filters */}
            <Card>
                <div className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search cases by title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            className={showFilters ? 'bg-slate-100' : ''}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as CaseType | 'all')}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                                >
                                    <option value="all">All Types</option>
                                    <option value="ER">Employee Relations</option>
                                    <option value="IR">Industrial Relations</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as CaseStatus | 'all')}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Open">Open</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Severity</label>
                                <select
                                    value={filterSeverity}
                                    onChange={(e) => setFilterSeverity(e.target.value as CaseSeverity | 'all')}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                                >
                                    <option value="all">All Severity</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date Range</label>
                                <Input type="date" className="py-2" />
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Showing {cases.length} cases</span>
                <div className="flex items-center gap-2">
                    <span>Sort by:</span>
                    <select className="px-2 py-1 border border-slate-200 rounded text-sm cursor-pointer">
                        <option>Last Updated</option>
                        <option>Date Created</option>
                        <option>Severity</option>
                        <option>Title</option>
                    </select>
                </div>
            </div>

            {/* Case Table */}
            <Card>
                <div className="overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                        </div>
                    ) : (
                        <>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Case
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Severity
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Parties
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Updated
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {cases.map((caseItem) => (
                                        <tr
                                            key={caseItem.id}
                                            onClick={() => navigate(`/cases/${caseItem.id}`)}
                                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{caseItem.title}</p>
                                                        <p className="text-xs text-slate-400">Created {formatDate(caseItem.created_at)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm font-medium ${caseItem.type === 'ER' ? 'text-blue-600' : 'text-purple-600'}`}>
                                                    {caseItem.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <SeverityBadge severity={caseItem.severity} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={caseItem.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm text-slate-600">
                                                    {caseItem.parties?.slice(0, 2).join(', ')}
                                                    {caseItem.parties?.length > 2 && ` +${caseItem.parties.length - 2} more`}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {formatDate(caseItem.updated_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Empty State */}
                            {cases.length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-1">No cases found</h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        {searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterSeverity !== 'all'
                                            ? 'Try adjusting your search or filter criteria'
                                            : 'Create your first case to get started'}
                                    </p>
                                    <Button onClick={() => navigate('/cases/new')}>
                                        <Plus className="w-4 h-4" />
                                        Create Case
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {cases.length > 0 && (
                    <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Page 1 of 1
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" disabled>
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            <Button variant="secondary" size="sm" disabled>
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
