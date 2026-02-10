import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import {
    Shield,
    LayoutDashboard,
    FolderOpen,
    Search,
    LogOut,
    Plus,
    ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/cases', label: 'Case List', icon: FolderOpen },
    { path: '/library', label: 'Library', icon: Search },
];

export function Sidebar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-30">
            {/* Logo */}
            <div className="p-5 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-sky-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-slate-900 block leading-tight tracking-tight">IR Secure</span>
                        <span className="text-xs font-medium text-slate-500 tracking-wide">Case Library</span>
                    </div>
                </div>
            </div>

            {/* Create Case Button */}
            <div className="p-4">
                <button
                    onClick={() => navigate('/cases/new')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Create Case
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${isActive
                                        ? 'bg-sky-50 text-sky-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Menu */}
            <div className="p-3 border-t border-slate-200">
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-slate-900 truncate max-w-[140px]">
                                {user?.email || 'User'}
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 animate-fadeIn">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
