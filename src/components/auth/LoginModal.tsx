import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../lib/auth';
import { Mail, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignUp: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignUp }: LoginModalProps) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            } else {
                onClose();
                setEmail('');
                setPassword('');
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
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-600" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
                <p className="text-sm text-slate-500 mt-1">Sign in to IR Secure Case Library</p>
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
                        placeholder="Enter your password"
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

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Sign In
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitchToSignUp}
                        className="text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
                    >
                        Sign up
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
