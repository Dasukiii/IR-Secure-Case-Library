import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { LoginModal, SignUpModal } from '../components/auth';
import { useAuth } from '../lib/auth';
import {
    Shield,
    Clock,
    FileText,
    Search,
    CheckCircle,
    ArrowRight,
    Lightbulb,
    Lock
} from 'lucide-react';

type ModalType = 'login' | 'signup' | null;

export function Landing() {
    const { user } = useAuth();
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    // Redirect to dashboard if already logged in
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const features = [
        {
            icon: Clock,
            title: 'Timeline Tracking',
            description: 'Chronological event logging with auto-timestamps for complete case history visibility.'
        },
        {
            icon: FileText,
            title: 'Evidence Management',
            description: 'Secure document uploads with metadata, audit trails, and checklist status tracking.'
        },
        {
            icon: Lightbulb,
            title: 'Lessons Learned',
            description: 'Capture outcomes, successes, and improvements to build institutional knowledge.'
        },
        {
            icon: Search,
            title: 'Search & Precedents',
            description: 'Find historical cases quickly with advanced filters and similar case suggestions.'
        }
    ];

    const benefits = [
        'Centralized case repository',
        'Consistent handling process',
        'Secure evidence storage',
        'Searchable precedents',
        'Compliance-ready documentation',
        'Team collaboration'
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-sky-600 to-blue-700 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">IR Secure Case Library</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section
                className="pt-32 pb-20 px-4 sm:px-6 lg:px-8"
                style={{
                    backgroundColor: '#f8fafc',
                    backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-full text-sky-700 text-sm font-medium mb-6">
                            <Lock className="w-4 h-4" />
                            Secure & Compliant
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                            Secure Case Library for{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">
                                ER/IR Professionals
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
                            Stop struggling with scattered case records and inconsistent handling.
                            Build a secure repository with timelines, evidence checklists, outcomes,
                            and lessons learned.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" onClick={() => setActiveModal('signup')} className="w-full sm:w-auto">
                                Start Now
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                className="py-20 px-4 sm:px-6 lg:px-8"
                style={{
                    backgroundColor: '#f8fafc',
                    backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Everything You Need in One Place
                        </h2>
                        <p className="text-lg text-slate-600">
                            A complete solution for managing ER/IR cases from start to resolution
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, index) => {
                            const glowColors = [
                                'hover:shadow-[0_0_30px_rgba(14,165,233,0.4)]',
                                'hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]',
                                'hover:shadow-[0_0_30px_rgba(251,146,60,0.4)]',
                                'hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]'
                            ];
                            return (
                                <div
                                    key={index}
                                    className={`bg-white rounded-2xl p-8 border border-slate-200 shadow-sm transition-all duration-300 ${glowColors[index]}`}
                                >
                                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                                        <feature.icon className="w-6 h-6 text-sky-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">
                            Build a Secure Repository of Institutional Knowledge
                        </h2>
                        <p className="text-lg text-slate-300 mb-12 text-center">
                            Transform how your team handles ER/IR cases with a centralized,
                            searchable, and compliant case management system.
                        </p>
                        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="text-slate-200">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>Copyright © 2026</span>
                            <img src="/kadosh-ai-icon.png" alt="KadoshAI" className="h-6" />
                            <span>All rights reserved.</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <Link to="/privacy" className="hover:text-slate-700">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-slate-700">Terms of Service</Link>
                            <Link to="/pdpa" className="hover:text-slate-700">PDPA Compliance</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modals */}
            <LoginModal
                isOpen={activeModal === 'login'}
                onClose={() => setActiveModal(null)}
                onSwitchToSignUp={() => setActiveModal('signup')}
            />
            <SignUpModal
                isOpen={activeModal === 'signup'}
                onClose={() => setActiveModal(null)}
                onSwitchToLogin={() => setActiveModal('login')}
            />
        </div>
    );
}
