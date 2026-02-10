import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export function TermsOfService() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-sky-600 to-blue-700 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-slate-900">IR Secure Case Library</span>
                        </Link>
                        <Link to="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 mb-6">
                        <strong>Last Updated:</strong> January 13, 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-600">
                            By accessing or using the IR Secure Case Library, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
                        <p className="text-slate-600">
                            IR Secure Case Library provides a secure platform for managing Employee Relations (ER) and
                            Industrial Relations (IR) cases, including case documentation, evidence management, timeline tracking,
                            and AI-powered insights.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">3. User Responsibilities</h2>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                            <li>You must not share your account with unauthorized users</li>
                            <li>You are responsible for all activities that occur under your account</li>
                            <li>You must ensure all data entered complies with applicable laws and regulations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Intellectual Property</h2>
                        <p className="text-slate-600">
                            The IR Secure Case Library platform, including its design, features, and content, is owned by
                            KadoshAI and protected by intellectual property laws. You retain ownership of the case data
                            you enter into the system.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Limitation of Liability</h2>
                        <p className="text-slate-600">
                            The service is provided "as is" without warranties of any kind. We are not liable for any
                            indirect, incidental, or consequential damages arising from your use of the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Contact</h2>
                        <p className="text-slate-600 mb-4">
                            For questions about these Terms of Service, please contact us:
                        </p>
                        <div className="bg-slate-100 rounded-lg p-4 text-slate-600">
                            <p className="font-semibold text-slate-900 mb-2">Kadosh AI</p>
                            <p className="mb-1">
                                <strong>Email:</strong>{' '}
                                <a href="mailto:asha@kadoshai.com" className="text-sky-600 hover:text-sky-700">
                                    asha@kadoshai.com
                                </a>
                            </p>
                            <p className="mb-1">
                                <strong>Address:</strong> Petaling Jaya, Malaysia
                            </p>
                            <p>
                                <strong>Data Protection Officer:</strong> Colin Benedict Raj
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
