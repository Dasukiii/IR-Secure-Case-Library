import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
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
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 mb-6">
                        <strong>Last Updated:</strong> January 13, 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
                        <p className="text-slate-600 mb-4">
                            We collect information you provide directly to us when using the IR Secure Case Library, including:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Account information (email address, password)</li>
                            <li>Case data you enter (titles, descriptions, parties involved, evidence)</li>
                            <li>Usage data and interaction with our AI features</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
                        <p className="text-slate-600 mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process and store your case management data</li>
                            <li>Generate AI-powered insights and recommendations</li>
                            <li>Send you technical notices and updates</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Data Security</h2>
                        <p className="text-slate-600">
                            We implement industry-standard security measures to protect your data, including encryption
                            in transit and at rest, secure authentication, and regular security audits. Your case data
                            is stored securely and access is restricted to authorized personnel only.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Data Retention</h2>
                        <p className="text-slate-600">
                            We retain your data for as long as your account is active or as needed to provide you services.
                            You may request deletion of your data at any time by contacting our support team.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Contact Us</h2>
                        <p className="text-slate-600 mb-4">
                            If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
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
