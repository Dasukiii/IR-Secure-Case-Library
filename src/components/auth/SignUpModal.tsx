import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../lib/auth';
import { Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export function SignUpModal({ isOpen, onClose, onSwitchToLogin }: SignUpModalProps) {
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedPDPA, setAcceptedPDPA] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!acceptedPDPA) {
            setError('You must accept the PDPA Policy to continue');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await signUp(email, password);
            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAcceptedPDPA(false);
        setError('');
        setSuccess(false);
        onClose();
    };

    if (success) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} size="md">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Check your email</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        We've sent a confirmation link to <span className="font-medium text-slate-700">{email}</span>.
                        Please check your inbox to verify your account.
                    </p>
                    <Button onClick={handleClose} className="w-full">
                        Got it
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-600" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
                <p className="text-sm text-slate-500 mt-1">Join IR Secure Case Library</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="relative">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Mail className="absolute right-3 top-9 w-4 h-4 text-slate-400" />
                </div>

                <div className="relative">
                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password (min 8 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <div className="relative">
                    <Input
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <Lock className="absolute right-3 top-9 w-4 h-4 text-slate-400" />
                </div>

                <div className="flex items-start gap-3 py-2">
                    <input
                        type="checkbox"
                        id="pdpa"
                        checked={acceptedPDPA}
                        onChange={(e) => setAcceptedPDPA(e.target.checked)}
                        className="mt-1 w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
                    />
                    <label htmlFor="pdpa" className="text-sm text-slate-600 cursor-pointer">
                        I accept the{' '}
                        <a href="/pdpa" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 font-medium">
                            PDPA Policy
                        </a>{' '}
                        and{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 font-medium">
                            Terms of Service
                        </a>
                    </label>
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Create Account
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
                    >
                        Sign in
                    </button>
                </p>
            </div>

            <div className="mt-4 text-center">
                <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    Powered by
                    <img src="/kadosh-ai-icon.png" alt="KadoshAI" className="w-24 h-6 inline-block" />
                </p>
            </div>
        </Modal>
    );
}
