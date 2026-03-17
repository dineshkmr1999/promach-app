import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { erpAuthAPI } from '@/services/erpApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import logo from '@/assets/LOGO.png';

export default function CustomerLogin() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res: any;
            if (mode === 'login') {
                res = await erpAuthAPI.login(form.email, form.password);
            } else {
                if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
                res = await erpAuthAPI.register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
            }

            if (res.user?.role !== 'User') {
                setError('This portal is for customers only. Staff should use /staff/login');
                setLoading(false);
                return;
            }

            localStorage.setItem('erpToken', res.token);
            localStorage.setItem('erpUser', JSON.stringify(res.user));
            navigate('/customer/portal');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-xl border-0">
                <div className="text-center mb-6">
                    <div className="relative mx-auto mb-5 w-fit">
                        <div className="absolute inset-0 bg-blue-400/15 rounded-full blur-2xl scale-150" />
                        <img src={logo} alt="Promach" className="relative h-14 sm:h-16 w-auto object-contain drop-shadow-md" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {mode === 'login' ? 'Customer Login' : 'Create Account'}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Book and track your services with Promach</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-red-700">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <>
                            <div>
                                <Label>Full Name *</Label>
                                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" autoComplete="name" />
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+65 9XXX XXXX" autoComplete="tel" />
                            </div>
                        </>
                    )}

                    <div>
                        <Label>Email *</Label>
                        <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" autoComplete="email" required />
                    </div>

                    <div>
                        <Label>Password *</Label>
                        <div className="relative">
                            <Input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPw(!showPw)}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm text-slate-500">
                    {mode === 'login' ? (
                        <p>Don&apos;t have an account?{' '}
                            <button className="text-blue-600 font-medium hover:underline" onClick={() => { setMode('register'); setError(''); }}>Register</button>
                        </p>
                    ) : (
                        <p>Already have an account?{' '}
                            <button className="text-blue-600 font-medium hover:underline" onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
                        </p>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t text-center">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
                        <ArrowLeft size={14} /> Back to Promach Website
                    </Link>
                </div>
            </Card>
        </div>
    );
}
