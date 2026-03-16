import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { erpAuthAPI } from '@/services/erpApi';
import { HardHat, ArrowLeft, Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function StaffLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await erpAuthAPI.login(email, password);
            localStorage.setItem('erpToken', response.token);
            localStorage.setItem('erpUser', JSON.stringify(response.user));
            navigate('/staff/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md border border-slate-200/80 overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-slate-600" />

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <HardHat className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Staff Portal</h1>
                        <p className="text-sm text-slate-500">Sign in to access Inventory &amp; Field Operations</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="staff@promachpl.com"
                                    className="pl-9 h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="pl-9 pr-11 h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft size={14} />
                            Back to Website
                        </Link>
                        <span className="text-xs text-slate-300">Promach Pte Ltd</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
