import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, StatusBadge, SeverityBadge } from '../components/ui';
import { getDashboardStats, getRecentCases } from '../lib/database';
import {
    FolderOpen,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    ArrowRight,
    FileText,
    AlertTriangle
} from 'lucide-react';
import type { Case } from '../types';

interface DashboardStats {
    totalCases: number;
    openCases: number;
    pendingCases: number;
    closedCases: number;
    criticalCases: number;
    casesThisMonth: number;
}

export function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentCases, setRecentCases] = useState<Case[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [dashboardStats, cases] = await Promise.all([
                    getDashboardStats(),
                    getRecentCases(5)
                ]);
                setStats(dashboardStats);
                setRecentCases(cases);
            } catch (err) {
                console.error('Error loading dashboard:', err);
                setError(err instanceof Error ? err.message : 'Failed to load dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">{error}</h3>
                <Button onClick={() => window.location.reload()} className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of your case management activities</p>
                </div>
                <Button onClick={() => navigate('/cases/new')}>
                    <Plus className="w-4 h-4" />
                    Create Case
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Open Cases</p>
                            <p className="text-2xl font-bold text-slate-900">{stats?.openCases || 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Pending</p>
                            <p className="text-2xl font-bold text-slate-900">{stats?.pendingCases || 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Closed</p>
                            <p className="text-2xl font-bold text-slate-900">{stats?.closedCases || 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                            <FolderOpen className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Cases</p>
                            <p className="text-2xl font-bold text-slate-900">{stats?.totalCases || 0}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6">
                {/* Recent Cases */}
                <div className="col-span-2">
                    <Card>
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-semibold text-slate-900">Recent Cases</h2>
                            <button
                                onClick={() => navigate('/cases')}
                                className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                            >
                                View all
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        {recentCases.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {recentCases.map((caseItem) => (
                                    <div
                                        key={caseItem.id}
                                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                                        className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{caseItem.title}</p>
                                                <p className="text-sm text-slate-500">
                                                    {caseItem.type} Case • Updated {formatDate(caseItem.updated_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <SeverityBadge severity={caseItem.severity} />
                                            <StatusBadge status={caseItem.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-1">No cases yet</h3>
                                <p className="text-slate-500 mb-4">Create your first case to get started</p>
                                <Button onClick={() => navigate('/cases/new')}>
                                    <Plus className="w-4 h-4" />
                                    Create Case
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar - Quick Stats Only */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <Card>
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-900">Quick Stats</h2>
                        </div>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Critical Cases</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {stats?.criticalCases || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Cases This Month</span>
                                    <span className="text-sm font-semibold text-slate-900">
                                        {stats?.casesThisMonth || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">ER Cases</span>
                                    <span className="text-sm font-semibold text-blue-600">
                                        {recentCases.filter(c => c.type === 'ER').length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">IR Cases</span>
                                    <span className="text-sm font-semibold text-purple-600">
                                        {recentCases.filter(c => c.type === 'IR').length}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Summary */}
                    <Card>
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-900">Status Breakdown</h2>
                        </div>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Open */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-slate-600">Open</span>
                                        <span className="font-medium text-slate-900">{stats?.openCases || 0}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full"
                                            style={{ width: `${stats?.totalCases ? ((stats.openCases / stats.totalCases) * 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                                {/* Pending */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-slate-600">Pending</span>
                                        <span className="font-medium text-slate-900">{stats?.pendingCases || 0}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 rounded-full"
                                            style={{ width: `${stats?.totalCases ? ((stats.pendingCases / stats.totalCases) * 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                                {/* Closed */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-slate-600">Closed</span>
                                        <span className="font-medium text-slate-900">{stats?.closedCases || 0}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{ width: `${stats?.totalCases ? ((stats.closedCases / stats.totalCases) * 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
