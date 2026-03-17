import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { erpAuthAPI, jobTicketsAPI } from '@/services/erpApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    Calendar, Clock, MapPin, Plus, LogOut, ChevronRight, User, Phone,
    CheckCircle2, Loader2, Home, ClipboardList, Star, Settings
} from 'lucide-react';

interface ERPUser { _id: string; name: string; email: string; role: string; phone?: string; }
interface JobTicket {
    _id: string; ticketNumber: string; jobType: string; status: string;
    scheduledDate: string; scheduledTimeSlot?: string; quotedPrice?: number;
    customer: { name: string; phone?: string; email?: string };
    siteAddress?: { street?: string; unit?: string; postalCode?: string };
    assignedTechnicians?: { _id: string; name: string; phone?: string }[];
    tracking?: {
        checkedInAt?: string; startedAt?: string; finishedAt?: string;
        durationMinutes?: number; customerRating?: number;
        beforeImages?: string[]; afterImages?: string[];
    };
    customerRemarks?: string;
}

const JOB_TYPE_LABELS: Record<string, string> = {
    Aircon_Service: 'Aircon Servicing',
    Aircon_Install: 'Aircon Installation',
    Aircon_Repair: 'Aircon Repair',
    Renovation: 'Renovation',
    Maintenance_Contract: 'Maintenance Contract',
    Other: 'Other Services',
};
const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-slate-100 text-slate-700',
    Scheduled: 'bg-blue-100 text-blue-700',
    In_Progress: 'bg-amber-100 text-amber-700',
    On_Hold: 'bg-orange-100 text-orange-700',
    Completed: 'bg-green-100 text-green-700',
    Invoiced: 'bg-purple-100 text-purple-700',
    Cancelled: 'bg-red-100 text-red-700',
};

export default function CustomerPortal() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState<ERPUser | null>(null);
    const [bookings, setBookings] = useState<JobTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'bookings' | 'new' | 'detail'>('bookings');
    const [selectedBooking, setSelectedBooking] = useState<JobTicket | null>(null);
    const [creating, setCreating] = useState(false);

    const [bookForm, setBookForm] = useState({
        jobType: 'Aircon_Service', scheduledDate: '', scheduledTimeSlot: '',
        customerName: '', customerPhone: '', customerEmail: '',
        street: '', unit: '', postalCode: '', building: '', customerRemarks: ''
    });

    useEffect(() => {
        const stored = localStorage.getItem('erpUser');
        if (!stored) { navigate('/customer/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'User') { navigate('/customer/login'); return; }
        setUser(u);
        setBookForm(f => ({ ...f, customerName: u.name, customerEmail: u.email, customerPhone: u.phone || '' }));
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await jobTicketsAPI.myBookings();
            setBookings(data);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    const handleBook = async () => {
        if (!bookForm.scheduledDate || !bookForm.customerName) {
            toast({ title: 'Missing fields', description: 'Please fill in date and name', variant: 'destructive' }); return;
        }
        setCreating(true);
        try {
            await jobTicketsAPI.book(bookForm);
            toast({ title: 'Booking created!', description: 'We\'ll confirm your appointment shortly' });
            setActiveTab('bookings');
            loadBookings();
        } catch (err: any) {
            toast({ title: 'Booking failed', description: err.message, variant: 'destructive' });
        } finally { setCreating(false); }
    };

    const handleLogout = () => {
        localStorage.removeItem('erpToken');
        localStorage.removeItem('erpUser');
        navigate('/customer/login');
    };

    const activeBookings = bookings.filter(b => !['Completed', 'Invoiced', 'Cancelled'].includes(b.status));
    const pastBookings = bookings.filter(b => ['Completed', 'Invoiced', 'Cancelled'].includes(b.status));

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Promach</h1>
                        <p className="text-xs text-slate-500">Hello, {user?.name?.split(' ')[0]}</p>
                    </div>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600"><LogOut size={20} /></button>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-4">
                {/* ═══════ BOOKINGS LIST TAB ═══════ */}
                {activeTab === 'bookings' && (
                    <div className="space-y-4">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <Card className="p-3 text-center border-0 shadow-sm">
                                <p className="text-2xl font-bold text-blue-600">{activeBookings.length}</p>
                                <p className="text-xs text-slate-500">Active</p>
                            </Card>
                            <Card className="p-3 text-center border-0 shadow-sm">
                                <p className="text-2xl font-bold text-green-600">{pastBookings.length}</p>
                                <p className="text-xs text-slate-500">Completed</p>
                            </Card>
                            <Card className="p-3 text-center border-0 shadow-sm">
                                <p className="text-2xl font-bold text-slate-600">{bookings.length}</p>
                                <p className="text-xs text-slate-500">Total</p>
                            </Card>
                        </div>

                        {/* Active Bookings */}
                        {activeBookings.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-slate-700 mb-2">Upcoming & Active</h2>
                                {activeBookings.map(b => (
                                    <Card key={b._id} className="mb-2 p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition"
                                        onClick={() => { setSelectedBooking(b); setActiveTab('detail'); }}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || 'bg-slate-100'}`}>
                                                        {b.status.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{b.ticketNumber}</span>
                                                </div>
                                                <p className="font-semibold text-sm text-slate-900">{JOB_TYPE_LABELS[b.jobType] || b.jobType}</p>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(b.scheduledDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    {b.scheduledTimeSlot && <span className="flex items-center gap-1"><Clock size={12} />{b.scheduledTimeSlot}</span>}
                                                </div>
                                                {b.siteAddress?.street && (
                                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin size={11} />{b.siteAddress.unit ? `${b.siteAddress.unit}, ` : ''}{b.siteAddress.street}</p>
                                                )}
                                            </div>
                                            <ChevronRight size={16} className="text-slate-300 ml-2 mt-2" />
                                        </div>
                                        {b.status === 'In_Progress' && b.tracking?.startedAt && (
                                            <div className="mt-2 pt-2 border-t border-dashed">
                                                <p className="text-xs text-amber-600 font-medium animate-pulse">
                                                    🔧 Technician is working on your job…
                                                </p>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Past Bookings */}
                        {pastBookings.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-slate-700 mb-2">Past Bookings</h2>
                                {pastBookings.map(b => (
                                    <Card key={b._id} className="mb-2 p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition opacity-80"
                                        onClick={() => { setSelectedBooking(b); setActiveTab('detail'); }}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || 'bg-slate-100'}`}>
                                                        {b.status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-sm text-slate-700">{JOB_TYPE_LABELS[b.jobType] || b.jobType}</p>
                                                <p className="text-xs text-slate-400">{new Date(b.scheduledDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            {b.tracking?.customerRating && (
                                                <div className="flex items-center gap-0.5">{[...Array(b.tracking.customerRating)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}</div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {bookings.length === 0 && (
                            <Card className="p-8 text-center border-0 shadow-sm">
                                <ClipboardList size={48} className="text-slate-300 mx-auto mb-3" />
                                <h3 className="font-semibold text-slate-700">No Bookings Yet</h3>
                                <p className="text-sm text-slate-500 mt-1">Book your first service to get started</p>
                                <Button className="mt-4" onClick={() => setActiveTab('new')}>
                                    <Plus size={16} className="mr-1.5" /> Book a Service
                                </Button>
                            </Card>
                        )}
                    </div>
                )}

                {/* ═══════ BOOKING DETAIL TAB ═══════ */}
                {activeTab === 'detail' && selectedBooking && (
                    <div className="space-y-4">
                        <button className="text-sm text-blue-600 flex items-center gap-1" onClick={() => setActiveTab('bookings')}>
                            ← Back to Bookings
                        </button>

                        <Card className="p-5 border-0 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedBooking.status] || 'bg-slate-100'}`}>
                                        {selectedBooking.status.replace(/_/g, ' ')}
                                    </span>
                                    <p className="text-xs text-slate-400 mt-2">{selectedBooking.ticketNumber}</p>
                                </div>
                                {selectedBooking.quotedPrice && selectedBooking.quotedPrice > 0 && (
                                    <p className="text-xl font-bold text-slate-900">${selectedBooking.quotedPrice.toFixed(2)}</p>
                                )}
                            </div>

                            <h2 className="text-lg font-bold text-slate-900">{JOB_TYPE_LABELS[selectedBooking.jobType] || selectedBooking.jobType}</h2>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-sm font-medium">{new Date(selectedBooking.scheduledDate).toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        {selectedBooking.scheduledTimeSlot && <p className="text-xs text-slate-500">{selectedBooking.scheduledTimeSlot}</p>}
                                    </div>
                                </div>

                                {selectedBooking.siteAddress?.street && (
                                    <div className="flex items-center gap-3">
                                        <MapPin size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm">{selectedBooking.siteAddress.unit ? `${selectedBooking.siteAddress.unit}, ` : ''}{selectedBooking.siteAddress.street}</p>
                                            {selectedBooking.siteAddress.postalCode && <p className="text-xs text-slate-500">S({selectedBooking.siteAddress.postalCode})</p>}
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.assignedTechnicians && selectedBooking.assignedTechnicians.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium">Technician: {selectedBooking.assignedTechnicians.map(t => t.name).join(', ')}</p>
                                            {selectedBooking.assignedTechnicians[0]?.phone && (
                                                <p className="text-xs text-slate-500">{selectedBooking.assignedTechnicians[0].phone}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Live Tracking */}
                        {selectedBooking.tracking && (selectedBooking.tracking.checkedInAt || selectedBooking.tracking.startedAt) && (
                            <Card className="p-5 border-0 shadow-sm">
                                <h3 className="font-semibold text-sm text-slate-700 mb-3">Live Tracking</h3>
                                <div className="space-y-3">
                                    {selectedBooking.tracking.checkedInAt && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 size={14} className="text-green-600" /></div>
                                            <div>
                                                <p className="text-sm font-medium">Technician Checked In</p>
                                                <p className="text-xs text-slate-500">{new Date(selectedBooking.tracking.checkedInAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedBooking.tracking.startedAt && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"><CheckCircle2 size={14} className="text-blue-600" /></div>
                                            <div>
                                                <p className="text-sm font-medium">Work Started</p>
                                                <p className="text-xs text-slate-500">{new Date(selectedBooking.tracking.startedAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedBooking.tracking.finishedAt && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 size={14} className="text-green-600" /></div>
                                            <div>
                                                <p className="text-sm font-medium">Work Completed</p>
                                                <p className="text-xs text-slate-500">{new Date(selectedBooking.tracking.finishedAt).toLocaleTimeString()} — {selectedBooking.tracking.durationMinutes} mins</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Before/After Images */}
                        {selectedBooking.tracking?.beforeImages && selectedBooking.tracking.beforeImages.length > 0 && (
                            <Card className="p-5 border-0 shadow-sm">
                                <h3 className="font-semibold text-sm text-slate-700 mb-2">Before Photos</h3>
                                <div className="flex gap-2 overflow-x-auto">
                                    {selectedBooking.tracking.beforeImages.map((img, i) => (
                                        <img key={i} src={img.startsWith('http') ? img : `/uploads/jobs/${img}`} alt="Before" className="w-24 h-24 object-cover rounded-lg" />
                                    ))}
                                </div>
                            </Card>
                        )}
                        {selectedBooking.tracking?.afterImages && selectedBooking.tracking.afterImages.length > 0 && (
                            <Card className="p-5 border-0 shadow-sm">
                                <h3 className="font-semibold text-sm text-slate-700 mb-2">After Photos</h3>
                                <div className="flex gap-2 overflow-x-auto">
                                    {selectedBooking.tracking.afterImages.map((img, i) => (
                                        <img key={i} src={img.startsWith('http') ? img : `/uploads/jobs/${img}`} alt="After" className="w-24 h-24 object-cover rounded-lg" />
                                    ))}
                                </div>
                            </Card>
                        )}

                        {selectedBooking.customerRemarks && (
                            <Card className="p-4 border-0 shadow-sm">
                                <h3 className="font-semibold text-sm text-slate-700 mb-1">Your Remarks</h3>
                                <p className="text-sm text-slate-600">{selectedBooking.customerRemarks}</p>
                            </Card>
                        )}
                    </div>
                )}

                {/* ═══════ NEW BOOKING TAB ═══════ */}
                {activeTab === 'new' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-900">Book a Service</h2>

                        <Card className="p-5 border-0 shadow-sm space-y-4">
                            <div>
                                <Label>Service Type *</Label>
                                <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1" value={bookForm.jobType} onChange={e => setBookForm(p => ({ ...p, jobType: e.target.value }))}>
                                    {Object.entries(JOB_TYPE_LABELS).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Preferred Date *</Label>
                                    <Input type="date" value={bookForm.scheduledDate} onChange={e => setBookForm(p => ({ ...p, scheduledDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <Label>Time Slot</Label>
                                    <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1" value={bookForm.scheduledTimeSlot} onChange={e => setBookForm(p => ({ ...p, scheduledTimeSlot: e.target.value }))}>
                                        <option value="">Flexible</option>
                                        <option value="09:00-12:00">Morning (9am-12pm)</option>
                                        <option value="12:00-15:00">Afternoon (12pm-3pm)</option>
                                        <option value="15:00-18:00">Late Afternoon (3pm-6pm)</option>
                                        <option value="18:00-21:00">Evening (6pm-9pm)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border rounded-lg p-3 space-y-3">
                                <p className="text-sm font-semibold text-slate-700">Contact Information</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs">Name *</Label>
                                        <Input value={bookForm.customerName} onChange={e => setBookForm(p => ({ ...p, customerName: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Phone</Label>
                                        <Input value={bookForm.customerPhone} onChange={e => setBookForm(p => ({ ...p, customerPhone: e.target.value }))} />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs">Email</Label>
                                    <Input type="email" value={bookForm.customerEmail} onChange={e => setBookForm(p => ({ ...p, customerEmail: e.target.value }))} />
                                </div>
                            </div>

                            <div className="border rounded-lg p-3 space-y-3">
                                <p className="text-sm font-semibold text-slate-700">Service Address</p>
                                <div>
                                    <Label className="text-xs">Street Address</Label>
                                    <Input value={bookForm.street} onChange={e => setBookForm(p => ({ ...p, street: e.target.value }))} placeholder="e.g. 123 Orchard Road" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-xs">Unit #</Label>
                                        <Input value={bookForm.unit} onChange={e => setBookForm(p => ({ ...p, unit: e.target.value }))} placeholder="#01-01" />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Postal Code</Label>
                                        <Input value={bookForm.postalCode} onChange={e => setBookForm(p => ({ ...p, postalCode: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Building</Label>
                                        <Input value={bookForm.building} onChange={e => setBookForm(p => ({ ...p, building: e.target.value }))} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Remarks / Special Requests</Label>
                                <Textarea value={bookForm.customerRemarks} onChange={e => setBookForm(p => ({ ...p, customerRemarks: e.target.value }))} rows={3} placeholder="e.g. 3 units in bedroom. Dog at home." />
                            </div>

                            <Button className="w-full" onClick={handleBook} disabled={creating}>
                                {creating ? <><Loader2 size={16} className="animate-spin mr-2" />Creating Booking…</> : <><Plus size={16} className="mr-1.5" />Confirm Booking</>}
                            </Button>
                        </Card>
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
                <div className="max-w-lg mx-auto flex">
                    {([
                        { key: 'bookings', icon: Home, label: 'Bookings' },
                        { key: 'new', icon: Plus, label: 'Book Now' },
                    ] as const).map(tab => (
                        <button key={tab.key}
                            className={`flex-1 flex flex-col items-center py-2.5 text-xs ${activeTab === tab.key ? 'text-blue-600' : 'text-slate-400'}`}
                            onClick={() => setActiveTab(tab.key)}>
                            <tab.icon size={20} />
                            <span className="mt-0.5">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
