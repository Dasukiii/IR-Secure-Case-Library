import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export function PDPACompliance() {
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
                <h1 className="text-3xl font-bold text-slate-900 mb-8">PDPA Compliance</h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 mb-6">
                        <strong>Last Updated:</strong> January 13, 2026
                    </p>

                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-8">
                        <p className="text-sky-800 text-sm">
                            IR Secure Case Library is committed to compliance with the Personal Data Protection Act (PDPA)
                            and ensuring the highest standards of data protection for our users.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Data Protection Principles</h2>
                        <p className="text-slate-600 mb-4">
                            We adhere to the following PDPA principles:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Consent:</strong> We obtain consent before collecting personal data</li>
                            <li><strong>Purpose Limitation:</strong> Data is collected only for specified purposes</li>
                            <li><strong>Notification:</strong> Users are informed of how their data will be used</li>
                            <li><strong>Access and Correction:</strong> Users can access and correct their personal data</li>
                            <li><strong>Accuracy:</strong> We maintain accurate and up-to-date records</li>
                            <li><strong>Protection:</strong> We implement security measures to protect personal data</li>
                            <li><strong>Retention:</strong> Data is not kept longer than necessary</li>
                            <li><strong>Transfer:</strong> Data transfers comply with PDPA requirements</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Your Rights Under PDPA</h2>
                        <p className="text-slate-600 mb-4">
                            As a data subject, you have the right to:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Request access to your personal data</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Withdraw consent for data processing</li>
                            <li>Request deletion of your data</li>
                            <li>Lodge complaints with the relevant data protection authority</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Data Protection Officer</h2>
                        <p className="text-slate-600 mb-4">
                            For any PDPA-related inquiries or to exercise your rights, please contact our Data Protection Officer:
                        </p>
                        <div className="bg-slate-100 rounded-lg p-4 text-slate-600">
                            <p className="font-semibold text-slate-900 mb-2">Kadosh AI</p>
                            <p className="mb-1">
                                <strong>Data Protection Officer:</strong> Colin Benedict Raj
                            </p>
                            <p className="mb-1">
                                <strong>Email:</strong>{' '}
                                <a href="mailto:asha@kadoshai.com" className="text-sky-600 hover:text-sky-700">
                                    asha@kadoshai.com
                                </a>
                            </p>
                            <p>
                                <strong>Address:</strong> Petaling Jaya, Malaysia
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Security Measures</h2>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>End-to-end encryption for data in transit</li>
                            <li>Encryption at rest for stored data</li>
                            <li>Role-based access controls</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Employee training on data protection</li>
                        </ul>
                    </section>
                </div>
            </main>
        </div>
    );
}
