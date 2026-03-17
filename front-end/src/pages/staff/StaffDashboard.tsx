import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import PromachLoader from '@/components/PromachLoader';
import {
  HardHat, LogOut, Briefcase, Wrench, MapPin, Clock, Phone,
  ChevronRight, AlertTriangle, CheckCircle2, Play, Pause, Camera,
  Navigation, User, Calendar, Truck, ArrowRight, Clipboard,
  RefreshCw, Loader2, X, Timer, Star, History, DollarSign, MapPinCheck
} from 'lucide-react';
import { jobTicketsAPI, assetsAPI, erpAuthAPI } from '@/services/erpApi';
import { useToast } from '@/hooks/use-toast';

interface ERPUser {
  _id: string; name: string; email: string; role: string;
  phone?: string; assignedVan?: { _id: string; name: string; vehicleNumber?: string };
}
interface TrackingData {
  checkedInAt?: string; checkedInLocation?: { lat: number; lng: number };
  siteCoordinates?: { lat: number; lng: number };
  startedAt?: string; finishedAt?: string; durationMinutes?: number;
  beforeImages?: string[]; afterImages?: string[];
  technicianNotes?: string; customerRating?: number; customerFeedback?: string;
}
interface JobTicket {
  _id: string; ticketNumber: string; jobType: string; status: string; priority: string;
  customer: { name: string; phone?: string; email?: string };
  siteAddress?: { street?: string; postalCode?: string; unit?: string };
  scheduledDate: string; scheduledTimeSlot?: string;
  quotedPrice: number; totalMaterialCost: number; grossProfit: number;
  assignedTechnicians?: { _id: string; name: string }[];
  internalNotes?: string; costLines?: any[]; tracking?: TrackingData;
  completedAt?: string;
}
interface AssetItem {
  _id: string; name: string; sku: string; assetTag?: string;
  assetStatus?: string; currentHolder?: { _id: string; name: string };
}
interface HistoryInsights {
  totalJobs: number; totalRevenue: number; totalCost: number; totalProfit: number;
  avgDuration: number; avgRating: number; ratingCount: number;
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
  const [activeView, setActiveView] = useState<'home' | 'jobs' | 'tools' | 'history' | 'profile'>('home');

  const [jobs, setJobs] = useState<JobTicket[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobTicket | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);

  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const [historyJobs, setHistoryJobs] = useState<JobTicket[]>([]);
  const [historyInsights, setHistoryInsights] = useState<HistoryInsights | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [trackingAction, setTrackingAction] = useState<string | null>(null);
  const [jobTimer, setJobTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [techNotes, setTechNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'before' | 'after'>('before');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    erpAuthAPI.me()
      .then(data => setUser(data))
      .catch(() => { navigate('/staff/login', { replace: true }); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const loadJobs = useCallback(async () => {
    try {
      const data = await jobTicketsAPI.list({});
      setJobs(data.tickets || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' });
    }
  }, [toast]);

  const loadAssets = useCallback(async () => {
    setLoadingAssets(true);
    try {
      const data = await assetsAPI.list({});
      setAssets(data.assets || []);
    } catch { /* non-critical */ }
    finally { setLoadingAssets(false); }
  }, []);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await jobTicketsAPI.history({});
      setHistoryJobs(data.tickets || []);
      setHistoryInsights(data.insights || null);
    } catch { /* non-critical */ }
    finally { setLoadingHistory(false); }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);
  useEffect(() => { if (activeView === 'tools') loadAssets(); }, [activeView, loadAssets]);
  useEffect(() => { if (activeView === 'history') loadHistory(); }, [activeView, loadHistory]);

  useEffect(() => {
    if (selectedJob?.tracking?.startedAt && !selectedJob?.tracking?.finishedAt) {
      const startTime = new Date(selectedJob.tracking.startedAt).getTime();
      const updateTimer = () => setJobTimer(Math.floor((Date.now() - startTime) / 1000));
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    } else {
      setJobTimer(0);
    }
  }, [selectedJob?.tracking?.startedAt, selectedJob?.tracking?.finishedAt]);

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

  const formatAddress = (addr?: { street?: string; unit?: string; postalCode?: string }) => {
    if (!addr) return '';
    return [addr.unit, addr.street, addr.postalCode ? `S(${addr.postalCode})` : ''].filter(Boolean).join(', ');
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const handleCheckin = async () => {
    if (!selectedJob) return;
    setTrackingAction('checkin');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 });
      });
      await jobTicketsAPI.checkin(selectedJob._id, { lat: pos.coords.latitude, lng: pos.coords.longitude });
      toast({ title: 'Checked in!', description: 'Location verified' });
      const updated = await jobTicketsAPI.get(selectedJob._id);
      setSelectedJob(updated);
      loadJobs();
    } catch (err: any) {
      toast({ title: 'Check-in failed', description: err.message, variant: 'destructive' });
    } finally { setTrackingAction(null); }
  };

  const handleStartJob = async () => {
    if (!selectedJob) return;
    setTrackingAction('start');
    try {
      await jobTicketsAPI.start(selectedJob._id);
      toast({ title: 'Job started', description: 'Timer is running' });
      const updated = await jobTicketsAPI.get(selectedJob._id);
      setSelectedJob(updated);
      loadJobs();
    } catch (err: any) {
      toast({ title: 'Failed to start', description: err.message, variant: 'destructive' });
    } finally { setTrackingAction(null); }
  };

  const handleCompleteJob = async () => {
    if (!selectedJob) return;
    setTrackingAction('complete');
    try {
      await jobTicketsAPI.complete(selectedJob._id, { technicianNotes: techNotes || undefined });
      toast({ title: 'Job completed!', description: 'Great work!' });
      if (timerRef.current) clearInterval(timerRef.current);
      const updated = await jobTicketsAPI.get(selectedJob._id);
      setSelectedJob(updated);
      setTechNotes('');
      loadJobs();
    } catch (err: any) {
      toast({ title: 'Failed to complete', description: err.message, variant: 'destructive' });
    } finally { setTrackingAction(null); }
  };

  const handleHoldJob = async () => {
    if (!selectedJob) return;
    setTrackingAction('hold');
    try {
      await jobTicketsAPI.update(selectedJob._id, { status: 'On_Hold' });
      toast({ title: 'Job on hold' });
      const updated = await jobTicketsAPI.get(selectedJob._id);
      setSelectedJob(updated);
      loadJobs();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setTrackingAction(null); }
  };

  const handleResumeJob = async () => {
    if (!selectedJob) return;
    setTrackingAction('resume');
    try {
      await jobTicketsAPI.update(selectedJob._id, { status: 'In_Progress' });
      toast({ title: 'Job resumed' });
      const updated = await jobTicketsAPI.get(selectedJob._id);
      setSelectedJob(updated);
      loadJobs();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setTrackingAction(null); }
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || !selectedJob) return;
    setUploading(true);
    try {
      await jobTicketsAPI.uploadImages(selectedJob._id, Array.from(files), uploadType);
      toast({ title: 'Images uploaded' });
      const updated = await jobTicketsAPI.get(selectedJob._id);
      setSelectedJob(updated);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const handleAssetCheckout = async (id: string) => {
    try { await assetsAPI.checkout(id, {}); toast({ title: 'Tool checked out' }); loadAssets(); }
    catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
  };
  const handleAssetCheckin = async (id: string) => {
    try { await assetsAPI.checkin(id, { condition: 'good' }); toast({ title: 'Tool returned' }); loadAssets(); }
    catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
  };

  const openJobDetail = (job: JobTicket) => {
    setSelectedJob(job);
    setShowJobDetail(true);
    setTechNotes('');
    jobTicketsAPI.get(job._id).then(setSelectedJob).catch(() => {});
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><PromachLoader /></div>;

  return (
    <StaffGuard>
      <div className="min-h-screen bg-slate-50 pb-20">
        {/* Header */}
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

        <main className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
          {/* HOME VIEW */}
          {activeView === 'home' && (
            <>
              {activeJobs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Active Now</p>
                  {activeJobs.map(job => (
                    <button key={job._id} onClick={() => openJobDetail(job)}
                      className="w-full bg-white rounded-2xl p-4 shadow-sm border-l-4 border-amber-500 text-left active:scale-[0.98] transition-transform">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-slate-900">{job.customer.name}</p>
                          <p className="text-xs text-slate-500">{job.ticketNumber} &middot; {job.jobType.replace(/_/g, ' ')}</p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">In Progress</Badge>
                      </div>
                      {job.siteAddress && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                          <MapPin size={12} /><span>{formatAddress(job.siteAddress)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {job.scheduledTimeSlot && (
                          <div className="flex items-center gap-1 text-xs text-slate-500"><Clock size={12} />{job.scheduledTimeSlot}</div>
                        )}
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Schedule</p>
                  <button onClick={() => setActiveView('jobs')} className="text-xs text-primary font-medium flex items-center gap-0.5">
                    View All <ArrowRight size={12} />
                  </button>
                </div>
                {todayJobs.length === 0 ? (
                  <Card className="border-0 shadow-sm"><CardContent className="p-6 text-center">
                    <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No jobs scheduled for today</p>
                  </CardContent></Card>
                ) : todayJobs.filter(j => j.status !== 'In_Progress').map(job => (
                  <button key={job._id} onClick={() => openJobDetail(job)}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{job.customer.name}</p>
                        <p className="text-xs text-slate-500">{job.jobType.replace(/_/g, ' ')}</p>
                      </div>
                      <Badge className={`${priorityColor[job.priority] || priorityColor.Normal} border-0 text-xs`}>{job.priority}</Badge>
                    </div>
                    {job.siteAddress && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={12} /><span className="truncate">{formatAddress(job.siteAddress)}</span></div>
                    )}
                    {job.scheduledTimeSlot && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1"><Clock size={12} />{job.scheduledTimeSlot}</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setActiveView('jobs')} className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-2"><Briefcase size={20} className="text-blue-600" /></div>
                    <p className="font-semibold text-sm text-slate-900">All Jobs</p>
                    <p className="text-xs text-slate-400">{jobs.length} total</p>
                  </button>
                  <button onClick={() => setActiveView('history')} className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-2"><History size={20} className="text-green-600" /></div>
                    <p className="font-semibold text-sm text-slate-900">History</p>
                    <p className="text-xs text-slate-400">Past jobs</p>
                  </button>
                  <button onClick={() => setActiveView('tools')} className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-2"><Wrench size={20} className="text-amber-600" /></div>
                    <p className="font-semibold text-sm text-slate-900">My Tools</p>
                    <p className="text-xs text-slate-400">Check in/out</p>
                  </button>
                  <button onClick={() => setActiveView('profile')} className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-2"><User size={20} className="text-purple-600" /></div>
                    <p className="font-semibold text-sm text-slate-900">Profile</p>
                    <p className="text-xs text-slate-400">My info</p>
                  </button>
                </div>
              </div>

              {user?.assignedVan && (
                <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Truck size={20} className="text-green-600" /></div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{user.assignedVan.name}</p>
                    {user.assignedVan.vehicleNumber && <p className="text-xs text-slate-500">{user.assignedVan.vehicleNumber}</p>}
                  </div>
                </CardContent></Card>
              )}
            </>
          )}

          {/* JOBS VIEW */}
          {activeView === 'jobs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">All Jobs</h2>
                <Button size="sm" variant="outline" onClick={loadJobs} className="gap-1 rounded-xl"><RefreshCw size={14} /> Refresh</Button>
              </div>
              {jobs.length === 0 ? (
                <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center">
                  <Clipboard size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400">No jobs assigned to you yet</p>
                </CardContent></Card>
              ) : jobs.map(job => (
                <button key={job._id} onClick={() => openJobDetail(job)}
                  className={`w-full bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform ${job.status === 'In_Progress' ? 'border-l-4 border-amber-500' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{job.customer.name}</p>
                      <p className="text-xs text-slate-500">{job.ticketNumber} &middot; {job.jobType.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge className={`${statusColor[job.status] || 'bg-slate-100 text-slate-600'} border-0 text-xs ml-2 shrink-0`}>
                      {job.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <div className="flex items-center gap-1"><Calendar size={11} />{new Date(job.scheduledDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}</div>
                    {job.scheduledTimeSlot && <div className="flex items-center gap-1"><Clock size={11} />{job.scheduledTimeSlot}</div>}
                    {job.siteAddress?.postalCode && <div className="flex items-center gap-1"><MapPin size={11} />S({job.siteAddress.postalCode})</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* TOOLS VIEW */}
          {activeView === 'tools' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Tools &amp; Equipment</h2>
                <Button size="sm" variant="outline" onClick={loadAssets} className="gap-1 rounded-xl"><RefreshCw size={14} /> Refresh</Button>
              </div>
              {loadingAssets ? <PromachLoader variant="inline" /> : assets.length === 0 ? (
                <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center">
                  <Wrench size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400">No tools/assets available</p>
                </CardContent></Card>
              ) : assets.map(asset => {
                const isMyTool = asset.currentHolder?._id === user?._id;
                return (
                  <div key={asset._id} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">{asset.name}</p>
                        {asset.assetTag && <p className="text-xs font-mono text-slate-400">Tag: {asset.assetTag}</p>}
                      </div>
                      <Badge className={`border-0 text-xs ${asset.assetStatus === 'available' ? 'bg-green-100 text-green-700' : asset.assetStatus === 'in_use' ? 'bg-blue-100 text-blue-700' : asset.assetStatus === 'maintenance' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {(asset.assetStatus || 'available').replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {asset.currentHolder && <p className="text-xs text-slate-500 mb-3">Held by: <span className="font-medium">{asset.currentHolder.name}</span></p>}
                    <div className="flex gap-2">
                      {asset.assetStatus === 'available' && <Button size="sm" className="flex-1 rounded-xl gap-1.5 h-9" onClick={() => handleAssetCheckout(asset._id)}><Wrench size={14} /> Check Out</Button>}
                      {asset.assetStatus === 'in_use' && isMyTool && <Button size="sm" variant="outline" className="flex-1 rounded-xl gap-1.5 h-9" onClick={() => handleAssetCheckin(asset._id)}><CheckCircle2 size={14} /> Return</Button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* HISTORY VIEW */}
          {activeView === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Job History</h2>
                <Button size="sm" variant="outline" onClick={loadHistory} className="gap-1 rounded-xl"><RefreshCw size={14} /> Refresh</Button>
              </div>

              {historyInsights && historyInsights.totalJobs > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-1"><Briefcase size={16} className="text-blue-600" /></div>
                      <p className="text-2xl font-bold text-slate-900">{historyInsights.totalJobs}</p>
                      <p className="text-xs text-slate-500">Jobs Completed</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mb-1"><DollarSign size={16} className="text-green-600" /></div>
                      <p className="text-2xl font-bold text-slate-900">${historyInsights.totalRevenue.toFixed(0)}</p>
                      <p className="text-xs text-slate-500">Total Revenue</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mb-1"><Timer size={16} className="text-amber-600" /></div>
                      <p className="text-2xl font-bold text-slate-900">{historyInsights.avgDuration ? formatDuration(historyInsights.avgDuration) : '--'}</p>
                      <p className="text-xs text-slate-500">Avg Duration</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mb-1"><Star size={16} className="text-purple-600" /></div>
                      <p className="text-2xl font-bold text-slate-900">{historyInsights.avgRating > 0 ? historyInsights.avgRating : '--'}</p>
                      <p className="text-xs text-slate-500">Avg Rating ({historyInsights.ratingCount})</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-4 text-white">
                    <p className="text-xs text-slate-300 uppercase tracking-wider mb-2">Performance Summary</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div><p className="text-lg font-bold">${historyInsights.totalRevenue.toFixed(0)}</p><p className="text-[10px] text-slate-300">Revenue</p></div>
                      <div><p className="text-lg font-bold">${historyInsights.totalCost.toFixed(0)}</p><p className="text-[10px] text-slate-300">Material Cost</p></div>
                      <div><p className={`text-lg font-bold ${historyInsights.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>${historyInsights.totalProfit.toFixed(0)}</p><p className="text-[10px] text-slate-300">Profit</p></div>
                    </div>
                  </div>
                </>
              )}

              {loadingHistory ? <PromachLoader variant="inline" /> : historyJobs.length === 0 ? (
                <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center">
                  <History size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400">No completed jobs yet</p>
                </CardContent></Card>
              ) : historyJobs.map(job => (
                <div key={job._id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{job.customer.name}</p>
                      <p className="text-xs text-slate-500">{job.ticketNumber} &middot; {job.jobType.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs shrink-0">{job.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <div className="flex items-center gap-1"><Calendar size={11} />{job.completedAt ? new Date(job.completedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}</div>
                    {job.tracking?.durationMinutes && <div className="flex items-center gap-1"><Timer size={11} />{formatDuration(job.tracking.durationMinutes)}</div>}
                    <div className="flex items-center gap-1 ml-auto font-medium text-green-600"><DollarSign size={11} />{job.quotedPrice?.toFixed(2)}</div>
                  </div>
                  {job.tracking?.customerRating && (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={12} className={s <= (job.tracking?.customerRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PROFILE VIEW */}
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
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><User size={14} className="text-slate-500" /></div>
                      <div><p className="text-xs text-slate-400">Email</p><p className="text-slate-800">{user?.email}</p></div>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Phone size={14} className="text-slate-500" /></div>
                        <div><p className="text-xs text-slate-400">Phone</p><p className="text-slate-800">{user.phone}</p></div>
                      </div>
                    )}
                    {user?.assignedVan && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Truck size={14} className="text-slate-500" /></div>
                        <div><p className="text-xs text-slate-400">Assigned Van</p><p className="text-slate-800">{user.assignedVan.name} {user.assignedVan.vehicleNumber ? `(${user.assignedVan.vehicleNumber})` : ''}</p></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Button variant="destructive" className="w-full rounded-xl gap-2" onClick={handleLogout}><LogOut size={16} /> Sign Out</Button>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
          <div className="max-w-lg mx-auto flex">
            {[
              { id: 'home' as const, icon: HardHat, label: 'Home' },
              { id: 'jobs' as const, icon: Briefcase, label: 'Jobs' },
              { id: 'history' as const, icon: History, label: 'History' },
              { id: 'tools' as const, icon: Wrench, label: 'Tools' },
              { id: 'profile' as const, icon: User, label: 'Profile' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveView(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${activeView === tab.id ? 'text-primary' : 'text-slate-400'}`}>
                <tab.icon size={20} strokeWidth={activeView === tab.id ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* JOB DETAIL SHEET */}
        {showJobDetail && selectedJob && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowJobDetail(false)} />
            <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl animate-in slide-in-from-bottom duration-300">
              {/* Close button */}
              <button onClick={() => setShowJobDetail(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 shadow-sm">
                <X size={16} strokeWidth={2.5} />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-5 rounded-t-3xl sm:rounded-t-2xl">
                <div className="flex items-start justify-between pr-10">
                  <div>
                    <p className="text-xs text-slate-300 font-mono">{selectedJob.ticketNumber}</p>
                    <p className="text-lg font-bold mt-0.5">{selectedJob.customer.name}</p>
                    <p className="text-sm text-slate-300">{selectedJob.jobType.replace(/_/g, ' ')}</p>
                  </div>
                  <Badge className={`${statusColor[selectedJob.status] || 'bg-slate-100 text-slate-600'} border-0`}>
                    {selectedJob.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Live Timer */}
                {selectedJob.tracking?.startedAt && !selectedJob.tracking?.finishedAt && (
                  <div className="mt-3 bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-slate-300">Job In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer size={16} className="text-amber-400" />
                      <span className="font-mono text-lg font-bold text-white">{formatTimer(jobTimer)}</span>
                    </div>
                  </div>
                )}

                {/* Completed Duration */}
                {selectedJob.tracking?.durationMinutes && selectedJob.tracking?.finishedAt && (
                  <div className="mt-3 bg-green-500/20 rounded-xl px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-green-200">Completed</span>
                    <div className="flex items-center gap-2 text-green-200"><Timer size={14} /><span className="font-medium">{formatDuration(selectedJob.tracking.durationMinutes)}</span></div>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {selectedJob.customer.phone && (
                  <a href={`tel:${selectedJob.customer.phone}`}
                    className="flex items-center gap-3 bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium active:bg-green-100 transition-colors">
                    <Phone size={18} />Call Customer: {selectedJob.customer.phone}
                  </a>
                )}

                {selectedJob.siteAddress && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(selectedJob.siteAddress))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-blue-50 text-blue-700 p-3 rounded-xl text-sm font-medium active:bg-blue-100 transition-colors">
                    <Navigation size={18} />
                    <div><p>Get Directions</p><p className="text-xs text-blue-500 font-normal">{formatAddress(selectedJob.siteAddress)}</p></div>
                  </a>
                )}

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{new Date(selectedJob.scheduledDate).toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  {selectedJob.scheduledTimeSlot && <Badge variant="outline" className="text-xs">{selectedJob.scheduledTimeSlot}</Badge>}
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <AlertTriangle size={16} className="text-slate-400" />
                  Priority: <Badge className={`${priorityColor[selectedJob.priority] || ''} border-0 text-xs`}>{selectedJob.priority}</Badge>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-[10px] text-slate-500 uppercase">Quoted</p><p className="font-bold text-sm">${selectedJob.quotedPrice?.toFixed(2)}</p></div>
                  <div><p className="text-[10px] text-slate-500 uppercase">Cost</p><p className="font-bold text-sm">${selectedJob.totalMaterialCost?.toFixed(2)}</p></div>
                  <div><p className="text-[10px] text-slate-500 uppercase">Profit</p><p className={`font-bold text-sm ${(selectedJob.grossProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>${selectedJob.grossProfit?.toFixed(2)}</p></div>
                </div>

                {/* Job Tracking Flow */}
                {!['Completed', 'Invoiced', 'Cancelled'].includes(selectedJob.status) && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Tracking</p>

                    {/* Step 1: Check In */}
                    {!selectedJob.tracking?.checkedInAt && ['Scheduled', 'Draft'].includes(selectedJob.status) && (
                      <Button className="w-full rounded-xl gap-2 h-12 bg-blue-600 hover:bg-blue-700" onClick={handleCheckin} disabled={trackingAction === 'checkin'}>
                        {trackingAction === 'checkin' ? <><Loader2 size={16} className="animate-spin" /> Verifying location...</> : <><MapPinCheck size={18} /> Check In at Location</>}
                      </Button>
                    )}

                    {selectedJob.tracking?.checkedInAt && !selectedJob.tracking?.startedAt && (
                      <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle2 size={16} />
                        <span>Checked in at {new Date(selectedJob.tracking.checkedInAt).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}

                    {/* Step 2: Before Images & Start */}
                    {selectedJob.tracking?.checkedInAt && !selectedJob.tracking?.startedAt && (
                      <div className="space-y-2">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-medium text-slate-600 mb-2">Before Photos (optional)</p>
                          <div className="flex gap-2 flex-wrap">
                            {(selectedJob.tracking?.beforeImages || []).map((img, i) => (
                              <div key={i} className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover" /></div>
                            ))}
                            <button onClick={() => { setUploadType('before'); fileInputRef.current?.click(); }}
                              className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-colors"
                              disabled={uploading}>
                              {uploading && uploadType === 'before' ? <Loader2 size={16} className="animate-spin" /> : <Camera size={20} />}
                            </button>
                          </div>
                        </div>
                        <Button className="w-full rounded-xl gap-2 h-12" onClick={handleStartJob} disabled={trackingAction === 'start'}>
                          {trackingAction === 'start' ? <><Loader2 size={16} className="animate-spin" /> Starting...</> : <><Play size={18} /> Start Job</>}
                        </Button>
                      </div>
                    )}

                    {/* Step 3: In Progress */}
                    {selectedJob.status === 'In_Progress' && (
                      <div className="space-y-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-medium text-slate-600 mb-2">Job Photos</p>
                          <div className="flex gap-2 flex-wrap">
                            {(selectedJob.tracking?.afterImages || []).map((img, i) => (
                              <div key={i} className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover" /></div>
                            ))}
                            <button onClick={() => { setUploadType('after'); fileInputRef.current?.click(); }}
                              className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-colors"
                              disabled={uploading}>
                              {uploading && uploadType === 'after' ? <Loader2 size={16} className="animate-spin" /> : <Camera size={20} />}
                            </button>
                          </div>
                        </div>
                        <Textarea value={techNotes} onChange={e => setTechNotes(e.target.value)} placeholder="Add notes about the job..." rows={2} className="rounded-xl" />
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-xl gap-1.5 h-11" onClick={handleHoldJob} disabled={!!trackingAction}>
                            {trackingAction === 'hold' ? <Loader2 size={14} className="animate-spin" /> : <Pause size={16} />} Hold
                          </Button>
                          <Button className="flex-1 rounded-xl gap-1.5 h-11 bg-green-600 hover:bg-green-700" onClick={handleCompleteJob} disabled={!!trackingAction}>
                            {trackingAction === 'complete' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={16} />} Complete
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedJob.status === 'On_Hold' && (
                      <Button className="w-full rounded-xl gap-2 h-12" onClick={handleResumeJob} disabled={trackingAction === 'resume'}>
                        {trackingAction === 'resume' ? <><Loader2 size={16} className="animate-spin" /> Resuming...</> : <><Play size={18} /> Resume Job</>}
                      </Button>
                    )}

                    {['Scheduled', 'Draft'].includes(selectedJob.status) && !selectedJob.tracking?.checkedInAt && (
                      <p className="text-xs text-slate-400 text-center">Check in at the location to start tracking</p>
                    )}
                  </div>
                )}

                {/* Completed Summary */}
                {selectedJob.status === 'Completed' && selectedJob.tracking && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion Details</p>
                    {selectedJob.tracking.beforeImages && selectedJob.tracking.beforeImages.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Before Photos</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedJob.tracking.beforeImages.map((img, i) => <div key={i} className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover" /></div>)}
                        </div>
                      </div>
                    )}
                    {selectedJob.tracking.afterImages && selectedJob.tracking.afterImages.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">After Photos</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedJob.tracking.afterImages.map((img, i) => <div key={i} className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover" /></div>)}
                        </div>
                      </div>
                    )}
                    {selectedJob.tracking.technicianNotes && (
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs font-medium text-slate-500 mb-1">Technician Notes</p>
                        <p className="text-sm text-slate-700">{selectedJob.tracking.technicianNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedJob.internalNotes && (
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                    <p className="text-sm text-amber-900 whitespace-pre-line">{selectedJob.internalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleUploadImages(e.target.files)} />
          </div>
        )}
      </div>
    </StaffGuard>
  );
}
