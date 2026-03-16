import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { erpAuthAPI } from '@/services/erpApi';
import { HardHat, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StaffLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            navigate('/admin/inventory');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <HardHat className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Staff Portal</h1>
                    <p className="text-sm text-slate-500">Sign in to access Inventory &amp; Field Operations</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="staff@promachpl.com"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full rounded-xl"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
                        <ArrowLeft size={14} />
                        Back to Website
                    </Link>
                </div>
            </div>
        </div>
    );
}
