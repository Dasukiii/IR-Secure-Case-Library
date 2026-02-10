import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Sidebar } from './Sidebar';

export function AppLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="ml-64 min-h-screen">
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
