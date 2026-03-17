import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PromachLoader from '@/components/PromachLoader';
import {
    HardHat, LogOut, Briefcase, Package, Wrench, MapPin, Clock, Phone,
    ChevronRight, AlertTriangle, CheckCircle2, Play, Pause, Camera,
    Navigation, User, Bell, Calendar, Truck, ArrowRight, Clipboard,
    RefreshCw, Star, Loader2
} from 'lucide-react';
import { jobTicketsAPI, assetsAPI, inventoryAPI, erpAuthAPI } from '@/services/erpApi';
import { useToast } from '@/hooks/use-toast';

interface ERPUser {
    _id: string; name: string; email: string; role: string;
    phone?: string; assignedVan?: { _id: string; name: string; vehicleNumber?: string };
}
interface JobTicket {
    _id: string; ticketNumber: string; jobType: string; status: string; priority: string;
    customer: { name: string; phone?: string; email?: string };
    siteAddress?: { street?: string; postalCode?: string; unit?: string };
    scheduledDate: string; scheduledTimeSlot?: string;
    quotedPrice: number; totalMaterialCost: number; grossProfit: number;
    assignedTechnicians?: { _id: string; name: string }[];
    internalNotes?: string;
    costLines?: any[];
}
interface AssetItem {
    _id: string; name: string; sku: string; assetTag?: string;
    assetStatus?: string; currentHolder?: { _id: string; name: string };
}

const priorityColor: Record<string, string> = {
    Urgent: 'bg-red-500 text-white', High: 'bg-orange-100 text-orange-700',
    Normal: 'bg-blue-100 text-blue-700', Low: 'bg-slate-100 text-slate-600',
};
const statusColor: Record<string, string> = {
    Scheduled: 'bg-blue-100 text-blue-700', In_Progress: 'bg-amber-100 text-amber-800',
    On_Hold: 'bg-orange-100 text-orange-800', Completed: 'bg-green-100 text-green-700',
    Draft: 'bg-slate-100 text-slate-600', Invoiced: 'bg-purple-100 text-purple-700',
    Cancelled: 'bg-red-100 text-red-600',
};

function StaffGuard({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('erpToken');
        if (!token) navigate('/staff/login', { replace: true });
    }, [navigate]);
    return <>{children}</>;
}

export default function StaffDashboard() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [user, setUser] = useState<ERPUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'home' | 'jobs' | 'tools' | 'profile'>('home');

    // Jobs
    const [jobs, setJobs] = useState<JobTicket[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobTicket | null>(null);
    const [showJobDetail, setShowJobDetail] = useState(false);
    const [updatingJob, setUpdatingJob] = useState(false);

    // Tools (Assets)
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);

    // Status update dialog
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [statusNote, setStatusNote] = useState('');
    const [newStatus, setNewStatus] = useState('');

    // Load user profile
    useEffect(() => {
        erpAuthAPI.me()
            .then(data => setUser(data))
            .catch(() => { navigate('/staff/login', { replace: true }); })
            .finally(() => setLoading(false));
    }, [navigate]);

    // Load jobs
    const loadJobs = useCallback(async () => {
        try {
            const data = await jobTicketsAPI.list({});
            setJobs(data.tickets || []);
        } catch { toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' }); }
    }, [toast]);

    // Load assets
    const loadAssets = useCallback(async () => {
        setLoadingAssets(true);
        try {
            const data = await assetsAPI.list({});
            setAssets(data.assets || []);
        } catch { /* non-critical */ }
        finally { setLoadingAssets(false); }
    }, []);

    useEffect(() => { loadJobs(); }, [loadJobs]);
    useEffect(() => { if (activeView === 'tools') loadAssets(); }, [activeView, loadAssets]);

    const handleLogout = () => {
        localStorage.removeItem('erpToken');
        localStorage.removeItem('erpUser');
        navigate('/staff/login');
    };

    const todayJobs = jobs.filter(j => {
        const today = new Date().toISOString().split('T')[0];
        return j.scheduledDate?.startsWith(today) && !['Completed', 'Invoiced', 'Cancelled'].includes(j.status);
    });
    const activeJobs = jobs.filter(j => j.status === 'In_Progress');
    const upcomingJobs = jobs.filter(j => ['Scheduled', 'Draft'].includes(j.status));

    const handleUpdateStatus = async () => {
        if (!selectedJob || !newStatus) return;
        setUpdatingJob(true);
        try {
            await jobTicketsAPI.update(selectedJob._id, {
                status: newStatus,
                ...(statusNote ? { internalNotes: `${selectedJob.internalNotes || ''}\n[${new Date().toLocaleString()}] ${statusNote}`.trim() } : {})
            });
            toast({ title: 'Job updated' });
            setShowStatusDialog(false); setShowJobDetail(false);
            setStatusNote(''); setNewStatus('');
            loadJobs();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally { setUpdatingJob(false); }
    };

    const handleAssetCheckout = async (id: string) => {
        try { await assetsAPI.checkout(id, {}); toast({ title: 'Tool checked out' }); loadAssets(); }
        catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };
    const handleAssetCheckin = async (id: string) => {
        try { await assetsAPI.checkin(id, { condition: 'good' }); toast({ title: 'Tool returned' }); loadAssets(); }
        catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };

    const formatAddress = (addr?: { street?: string; unit?: string; postalCode?: string }) => {
        if (!addr) return '';
        const parts = [addr.unit, addr.street, addr.postalCode ? `S(${addr.postalCode})` : ''].filter(Boolean);
        return parts.join(', ');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><PromachLoader /></div>;

    return (
        <StaffGuard>
            <div className="min-h-screen bg-slate-50 pb-20">
                {/* ── Top Header ── */}
                <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white sticky top-0 z-50 safe-area-top">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center">
                                <HardHat size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm leading-tight">{user?.name || 'Technician'}</p>
                                <p className="text-xs text-slate-400">{user?.role?.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={loadJobs}>
                                <RefreshCw size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={handleLogout}>
                                <LogOut size={18} />
                            </Button>
                        </div>
                    </div>

                    {/* Quick stats bar */}
                    <div className="px-4 pb-3 flex gap-3">
                        <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center backdrop-blur-sm">
                            <p className="text-lg font-bold">{todayJobs.length}</p>
                            <p className="text-[10px] text-slate-300 uppercase tracking-wider">Today</p>
                        </div>
                        <div className="flex-1 bg-amber-500/20 rounded-xl px-3 py-2 text-center backdrop-blur-sm">
                            <p className="text-lg font-bold text-amber-300">{activeJobs.length}</p>
                            <p className="text-[10px] text-amber-300/80 uppercase tracking-wider">Active</p>
                        </div>
                        <div className="flex-1 bg-blue-500/15 rounded-xl px-3 py-2 text-center backdrop-blur-sm">
                            <p className="text-lg font-bold text-blue-300">{upcomingJobs.length}</p>
                            <p className="text-[10px] text-blue-300/80 uppercase tracking-wider">Upcoming</p>
                        </div>
                    </div>
                </header>

                {/* ── Main Content ── */}
                <main className="px-4 pt-4 space-y-5 max-w-lg mx-auto">

                    {/* ═══ HOME VIEW ═══ */}
                    {activeView === 'home' && (
                        <>
                            {/* Active Jobs Alert */}
                            {activeJobs.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Active Now</p>
                                    {activeJobs.map(job => (
                                        <button
                                            key={job._id}
                                            onClick={() => { setSelectedJob(job); setShowJobDetail(true); }}
                                            className="w-full bg-white rounded-2xl p-4 shadow-sm border-l-4 border-amber-500 text-left active:scale-[0.98] transition-transform"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-bold text-slate-900">{job.customer.name}</p>
                                                    <p className="text-xs text-slate-500">{job.ticketNumber} · {job.jobType.replace(/_/g, ' ')}</p>
                                                </div>
                                                <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">In Progress</Badge>
                                            </div>
                                            {job.siteAddress && (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                                    <MapPin size={12} />
                                                    <span>{formatAddress(job.siteAddress)}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                {job.scheduledTimeSlot && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock size={12} />
                                                        {job.scheduledTimeSlot}
                                                    </div>
                                                )}
                                                <ChevronRight size={16} className="text-slate-300" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Today's Schedule */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Schedule</p>
                                    <button onClick={() => setActiveView('jobs')} className="text-xs text-primary font-medium flex items-center gap-0.5">
                                        View All <ArrowRight size={12} />
                                    </button>
                                </div>

                                {todayJobs.length === 0 ? (
                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-6 text-center">
                                            <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-sm text-slate-400">No jobs scheduled for today</p>
                                        </CardContent>
                                    </Card>
                                ) : todayJobs.filter(j => j.status !== 'In_Progress').map(job => (
                                    <button
                                        key={job._id}
                                        onClick={() => { setSelectedJob(job); setShowJobDetail(true); }}
                                        className="w-full bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-slate-900">{job.customer.name}</p>
                                                <p className="text-xs text-slate-500">{job.jobType.replace(/_/g, ' ')}</p>
                                            </div>
                                            <Badge className={`${priorityColor[job.priority] || priorityColor.Normal} border-0 text-xs`}>{job.priority}</Badge>
                                        </div>
                                        {job.siteAddress && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <MapPin size={12} />
                                                <span className="truncate">{formatAddress(job.siteAddress)}</span>
                                            </div>
                                        )}
                                        {job.scheduledTimeSlot && (
                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                <Clock size={12} />
                                                {job.scheduledTimeSlot}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Quick Actions</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setActiveView('jobs')}
                                        className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
                                    >
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
                                            <Briefcase size={20} className="text-blue-600" />
                                        </div>
                                        <p className="font-semibold text-sm text-slate-900">All Jobs</p>
                                        <p className="text-xs text-slate-400">{jobs.length} total</p>
                                    </button>
                                    <button
                                        onClick={() => setActiveView('tools')}
                                        className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
                                    >
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
                                            <Wrench size={20} className="text-amber-600" />
                                        </div>
                                        <p className="font-semibold text-sm text-slate-900">My Tools</p>
                                        <p className="text-xs text-slate-400">Check in/out</p>
                                    </button>
                                </div>
                            </div>

                            {/* Van info if assigned */}
                            {user?.assignedVan && (
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                            <Truck size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-slate-900">{user.assignedVan.name}</p>
                                            {user.assignedVan.vehicleNumber && (
                                                <p className="text-xs text-slate-500">{user.assignedVan.vehicleNumber}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}

                    {/* ═══ JOBS VIEW ═══ */}
                    {activeView === 'jobs' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">All Jobs</h2>
                                <Button size="sm" variant="outline" onClick={loadJobs} className="gap-1 rounded-xl">
                                    <RefreshCw size={14} /> Refresh
                                </Button>
                            </div>

                            {jobs.length === 0 ? (
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="p-8 text-center">
                                        <Clipboard size={40} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-sm text-slate-400">No jobs assigned to you yet</p>
                                    </CardContent>
                                </Card>
                            ) : jobs.map(job => (
                                <button
                                    key={job._id}
                                    onClick={() => { setSelectedJob(job); setShowJobDetail(true); }}
                                    className={`w-full bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform ${job.status === 'In_Progress' ? 'border-l-4 border-amber-500' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 truncate">{job.customer.name}</p>
                                            <p className="text-xs text-slate-500">{job.ticketNumber} · {job.jobType.replace(/_/g, ' ')}</p>
                                        </div>
                                        <Badge className={`${statusColor[job.status] || 'bg-slate-100 text-slate-600'} border-0 text-xs ml-2 shrink-0`}>
                                            {job.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={11} />
                                            {new Date(job.scheduledDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                                        </div>
                                        {job.scheduledTimeSlot && (
                                            <div className="flex items-center gap-1"><Clock size={11} />{job.scheduledTimeSlot}</div>
                                        )}
                                        {job.siteAddress?.postalCode && (
                                            <div className="flex items-center gap-1"><MapPin size={11} />S({job.siteAddress.postalCode})</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ═══ TOOLS VIEW ═══ */}
                    {activeView === 'tools' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">Tools &amp; Equipment</h2>
                                <Button size="sm" variant="outline" onClick={loadAssets} className="gap-1 rounded-xl">
                                    <RefreshCw size={14} /> Refresh
                                </Button>
                            </div>

                            {loadingAssets ? (
                                <PromachLoader variant="inline" />
                            ) : assets.length === 0 ? (
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="p-8 text-center">
                                        <Wrench size={40} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-sm text-slate-400">No tools/assets available</p>
                                    </CardContent>
                                </Card>
                            ) : assets.map(asset => {
                                const isMyTool = asset.currentHolder?._id === user?._id;
                                return (
                                    <div key={asset._id} className="bg-white rounded-2xl p-4 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">{asset.name}</p>
                                                {asset.assetTag && <p className="text-xs font-mono text-slate-400">Tag: {asset.assetTag}</p>}
                                            </div>
                                            <Badge className={`border-0 text-xs ${
                                                asset.assetStatus === 'available' ? 'bg-green-100 text-green-700' :
                                                asset.assetStatus === 'in_use' ? 'bg-blue-100 text-blue-700' :
                                                asset.assetStatus === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {(asset.assetStatus || 'available').replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        {asset.currentHolder && (
                                            <p className="text-xs text-slate-500 mb-3">Held by: <span className="font-medium">{asset.currentHolder.name}</span></p>
                                        )}
                                        <div className="flex gap-2">
                                            {asset.assetStatus === 'available' && (
                                                <Button size="sm" className="flex-1 rounded-xl gap-1.5 h-9" onClick={() => handleAssetCheckout(asset._id)}>
                                                    <Wrench size={14} /> Check Out
                                                </Button>
                                            )}
                                            {asset.assetStatus === 'in_use' && isMyTool && (
                                                <Button size="sm" variant="outline" className="flex-1 rounded-xl gap-1.5 h-9" onClick={() => handleAssetCheckin(asset._id)}>
                                                    <CheckCircle2 size={14} /> Return
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ═══ PROFILE VIEW ═══ */}
                    {activeView === 'profile' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-900">My Profile</h2>

                            <Card className="border-0 shadow-sm overflow-hidden">
                                <div className="h-24 bg-gradient-to-r from-slate-900 to-slate-700" />
                                <CardContent className="-mt-10 pb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3 border-4 border-white">
                                        <span className="text-2xl font-bold text-primary">{user?.name?.charAt(0) || 'T'}</span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">{user?.name}</p>
                                    <Badge className="bg-primary/10 text-primary border-0 mt-1">{user?.role?.replace(/_/g, ' ')}</Badge>

                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <User size={14} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">Email</p>
                                                <p className="text-slate-800">{user?.email}</p>
                                            </div>
                                        </div>
                                        {user?.phone && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <Phone size={14} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Phone</p>
                                                    <p className="text-slate-800">{user.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {user?.assignedVan && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <Truck size={14} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Assigned Van</p>
                                                    <p className="text-slate-800">{user.assignedVan.name} {user.assignedVan.vehicleNumber ? `(${user.assignedVan.vehicleNumber})` : ''}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Button variant="destructive" className="w-full rounded-xl gap-2" onClick={handleLogout}>
                                <LogOut size={16} /> Sign Out
                            </Button>
                        </div>
                    )}
                </main>

                {/* ── Bottom Navigation ── */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
                    <div className="max-w-lg mx-auto flex">
                        {[
                            { id: 'home' as const, icon: HardHat, label: 'Home' },
                            { id: 'jobs' as const, icon: Briefcase, label: 'Jobs' },
                            { id: 'tools' as const, icon: Wrench, label: 'Tools' },
                            { id: 'profile' as const, icon: User, label: 'Profile' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveView(tab.id)}
                                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                                    activeView === tab.id ? 'text-primary' : 'text-slate-400'
                                }`}
                            >
                                <tab.icon size={20} strokeWidth={activeView === tab.id ? 2.5 : 1.5} />
                                <span className="text-[10px] font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                {/* ═══ JOB DETAIL SHEET ═══ */}
                <Dialog open={showJobDetail} onOpenChange={setShowJobDetail}>
                    <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-0">
                        {selectedJob && (
                            <div>
                                {/* Header */}
                                <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-5 rounded-t-3xl sm:rounded-t-2xl">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-slate-300 font-mono">{selectedJob.ticketNumber}</p>
                                            <p className="text-lg font-bold mt-0.5">{selectedJob.customer.name}</p>
                                            <p className="text-sm text-slate-300">{selectedJob.jobType.replace(/_/g, ' ')}</p>
                                        </div>
                                        <Badge className={`${statusColor[selectedJob.status] || 'bg-slate-100 text-slate-600'} border-0`}>
                                            {selectedJob.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Customer Contact */}
                                    {selectedJob.customer.phone && (
                                        <a
                                            href={`tel:${selectedJob.customer.phone}`}
                                            className="flex items-center gap-3 bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium active:bg-green-100 transition-colors"
                                        >
                                            <Phone size={18} />
                                            Call Customer: {selectedJob.customer.phone}
                                        </a>
                                    )}

                                    {/* Address with directions */}
                                    {selectedJob.siteAddress && (
                                        <a
                                            href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(selectedJob.siteAddress))}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 bg-blue-50 text-blue-700 p-3 rounded-xl text-sm font-medium active:bg-blue-100 transition-colors"
                                        >
                                            <Navigation size={18} />
                                            <div>
                                                <p>Get Directions</p>
                                                <p className="text-xs text-blue-500 font-normal">{formatAddress(selectedJob.siteAddress)}</p>
                                            </div>
                                        </a>
                                    )}

                                    {/* Schedule */}
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span>{new Date(selectedJob.scheduledDate).toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                        {selectedJob.scheduledTimeSlot && <Badge variant="outline" className="text-xs">{selectedJob.scheduledTimeSlot}</Badge>}
                                    </div>

                                    {/* Priority */}
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <AlertTriangle size={16} className="text-slate-400" />
                                        Priority: <Badge className={`${priorityColor[selectedJob.priority] || ''} border-0 text-xs`}>{selectedJob.priority}</Badge>
                                    </div>

                                    {/* Financials */}
                                    <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Quoted</p>
                                            <p className="font-bold text-sm">${selectedJob.quotedPrice?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Cost</p>
                                            <p className="font-bold text-sm">${selectedJob.totalMaterialCost?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Profit</p>
                                            <p className={`font-bold text-sm ${(selectedJob.grossProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>${selectedJob.grossProfit?.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {selectedJob.internalNotes && (
                                        <div className="bg-amber-50 rounded-xl p-3">
                                            <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                                            <p className="text-sm text-amber-900 whitespace-pre-line">{selectedJob.internalNotes}</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {!['Completed', 'Invoiced', 'Cancelled'].includes(selectedJob.status) && (
                                        <div className="flex gap-2 pt-2">
                                            {selectedJob.status === 'Scheduled' && (
                                                <Button
                                                    className="flex-1 rounded-xl gap-1.5 h-11"
                                                    onClick={() => { setNewStatus('In_Progress'); setShowStatusDialog(true); }}
                                                >
                                                    <Play size={16} /> Start Job
                                                </Button>
                                            )}
                                            {selectedJob.status === 'In_Progress' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 rounded-xl gap-1.5 h-11"
                                                        onClick={() => { setNewStatus('On_Hold'); setShowStatusDialog(true); }}
                                                    >
                                                        <Pause size={16} /> Hold
                                                    </Button>
                                                    <Button
                                                        className="flex-1 rounded-xl gap-1.5 h-11 bg-green-600 hover:bg-green-700"
                                                        onClick={() => { setNewStatus('Completed'); setShowStatusDialog(true); }}
                                                    >
                                                        <CheckCircle2 size={16} /> Complete
                                                    </Button>
                                                </>
                                            )}
                                            {selectedJob.status === 'On_Hold' && (
                                                <Button
                                                    className="flex-1 rounded-xl gap-1.5 h-11"
                                                    onClick={() => { setNewStatus('In_Progress'); setShowStatusDialog(true); }}
                                                >
                                                    <Play size={16} /> Resume
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ═══ STATUS UPDATE DIALOG ═══ */}
                <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Update Job Status</DialogTitle>
                        </DialogHeader>
                        <div className="py-3 space-y-4">
                            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
                                <ArrowRight size={16} className="text-slate-400" />
                                <span className="text-sm text-slate-600">Changing to:</span>
                                <Badge className={`${statusColor[newStatus] || ''} border-0`}>
                                    {newStatus.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                            <div>
                                <Label>Add a note (optional)</Label>
                                <Textarea
                                    value={statusNote}
                                    onChange={e => setStatusNote(e.target.value)}
                                    placeholder="e.g. Customer not home, rescheduling…"
                                    rows={3}
                                    className="rounded-xl mt-1"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
                            <Button onClick={handleUpdateStatus} disabled={updatingJob} className="gap-1.5">
                                {updatingJob ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                {updatingJob ? 'Updating…' : 'Confirm'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </StaffGuard>
    );
}
