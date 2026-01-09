import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { submissionsAPI } from '@/services/api';
import {
    Trash2, Clock, CheckCircle, RefreshCw, AlertCircle,
    Mail, Phone, Calendar, MapPin, MessageSquare, User,
    ChevronLeft, ChevronRight, Search, Filter, X,
    FileText, Home, Briefcase, DollarSign, Eye
} from 'lucide-react';

interface Submission {
    _id: string;
    type: 'booking' | 'contact';
    name: string;
    email: string;
    phone?: string;
    message?: string;
    serviceType?: string;
    propertyType?: string;
    numberOfUnits?: number;
    preferredDate?: string;
    preferredTime?: string;
    status: string;
    source?: string;
    referrer?: string;
    adminNotes?: string;
    contactedAt?: string;
    quotedAmount?: number;
    createdAt: string;
    updatedAt: string;
}

const STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'completed', label: 'Completed', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
];

const ITEMS_PER_PAGE = 15;

export default function SubmissionsManagement() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const navigate = useNavigate();

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Edit state for detail modal
    const [editStatus, setEditStatus] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editQuotedAmount, setEditQuotedAmount] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    useEffect(() => {
        filterSubmissions();
    }, [submissions, searchQuery, statusFilter, typeFilter]);

    const fetchSubmissions = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const data = await submissionsAPI.getAll();
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch submissions:', err);
            if (err.message?.includes('401')) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            } else {
                setError('Failed to fetch submissions.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const filterSubmissions = () => {
        let filtered = [...submissions];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query) ||
                s.phone?.toLowerCase().includes(query) ||
                s.message?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(s => s.type === typeFilter);
        }

        setFilteredSubmissions(filtered);
        setCurrentPage(1);
    };

    const openDetail = (submission: Submission) => {
        setSelectedSubmission(submission);
        setEditStatus(submission.status);
        setEditNotes(submission.adminNotes || '');
        setEditQuotedAmount(submission.quotedAmount?.toString() || '');
        setIsDetailOpen(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedSubmission) return;

        setIsSaving(true);
        try {
            await submissionsAPI.update(selectedSubmission._id, {
                status: editStatus,
                notes: editNotes,
                quotedAmount: editQuotedAmount ? parseFloat(editQuotedAmount) : undefined,
                contactedAt: editStatus === 'contacted' && selectedSubmission.status !== 'contacted' ? new Date().toISOString() : undefined
            });
            await fetchSubmissions();
            setIsDetailOpen(false);
        } catch (error) {
            console.error('Failed to update:', error);
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this submission?')) return;
        try {
            await submissionsAPI.delete(id);
            await fetchSubmissions();
            setIsDetailOpen(false);
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleQuickStatusChange = async (id: string, newStatus: string) => {
        try {
            await submissionsAPI.update(id, { status: newStatus });
            await fetchSubmissions();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
        return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
    };

    // Pagination
    const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
    const paginatedSubmissions = filteredSubmissions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-SG', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Stats
    const stats = {
        total: submissions.length,
        new: submissions.filter(s => s.status === 'new').length,
        bookings: submissions.filter(s => s.type === 'booking').length,
        contacts: submissions.filter(s => s.type === 'contact').length,
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Form Submissions</h1>
                        <p className="text-slate-500 mt-1">Manage booking and contact form inquiries</p>
                    </div>
                    <Button variant="outline" onClick={fetchSubmissions} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                                    <p className="text-xs text-slate-500">Total</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                                    <p className="text-xs text-slate-500">New</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <Calendar className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-600">{stats.bookings}</p>
                                    <p className="text-xs text-slate-500">Bookings</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{stats.contacts}</p>
                                    <p className="text-xs text-slate-500">Contacts</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name, email, phone, or message..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {STATUS_OPTIONS.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[140px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="booking">Booking</SelectItem>
                                    <SelectItem value="contact">Contact</SelectItem>
                                </SelectContent>
                            </Select>
                            {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                    setTypeFilter('all');
                                }}>
                                    <X className="h-4 w-4 mr-1" /> Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Error State */}
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="text-red-700">{error}</span>
                            <Button variant="outline" size="sm" onClick={fetchSubmissions}>Retry</Button>
                        </CardContent>
                    </Card>
                )}

                {/* Submissions Table */}
                {isLoading ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-8 text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-500">Loading submissions...</p>
                        </CardContent>
                    </Card>
                ) : filteredSubmissions.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="py-16 text-center">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-700 mb-2">No submissions found</h3>
                            <p className="text-slate-500">
                                {submissions.length > 0 ? 'Try adjusting your filters' : 'Submissions will appear here when customers fill out forms'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Details</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedSubmissions.map((submission) => (
                                        <tr key={submission._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{submission.name}</p>
                                                        <p className="text-sm text-slate-500">{submission.email}</p>
                                                        {submission.phone && (
                                                            <p className="text-xs text-slate-400">{submission.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={submission.type === 'booking' ? 'border-slate-200 text-slate-700 bg-slate-50' : 'border-green-200 text-green-700 bg-green-50'}>
                                                    {submission.type === 'booking' ? '📅 Booking' : '✉️ Contact'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 max-w-xs">
                                                {submission.type === 'booking' ? (
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-slate-700">{submission.serviceType || 'General Service'}</p>
                                                        {submission.propertyType && <p className="text-xs text-slate-500">{submission.propertyType}</p>}
                                                        {submission.preferredDate && (
                                                            <p className="text-xs text-slate-400">
                                                                📅 {new Date(submission.preferredDate).toLocaleDateString()} {submission.preferredTime && `at ${submission.preferredTime}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-600 line-clamp-2">{submission.message || 'No message'}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Select value={submission.status} onValueChange={(val) => handleQuickStatusChange(submission._id, val)}>
                                                    <SelectTrigger className={`w-[130px] h-8 text-xs font-medium border ${getStatusBadge(submission.status)}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map(s => (
                                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-slate-600">{formatDate(submission.createdAt)}</p>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => openDetail(submission)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(submission._id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
                                <p className="text-sm text-slate-600">
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubmissions.length)} of {filteredSubmissions.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "ghost"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-slate-600 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <span className="text-xl">{selectedSubmission?.name}</span>
                                    <Badge className="ml-3" variant="outline">
                                        {selectedSubmission?.type === 'booking' ? '📅 Booking' : '✉️ Contact'}
                                    </Badge>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        {selectedSubmission && (
                            <div className="space-y-6 mt-4">
                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Email</p>
                                            <a href={`mailto:${selectedSubmission.email}`} className="text-sm font-medium text-primary hover:underline">{selectedSubmission.email}</a>
                                        </div>
                                    </div>
                                    {selectedSubmission.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Phone</p>
                                                <a href={`tel:${selectedSubmission.phone}`} className="text-sm font-medium text-primary hover:underline">{selectedSubmission.phone}</a>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Submitted</p>
                                            <p className="text-sm font-medium">{formatDate(selectedSubmission.createdAt)}</p>
                                        </div>
                                    </div>
                                    {selectedSubmission.source && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Source</p>
                                                <p className="text-sm font-medium">{selectedSubmission.source}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Booking Details */}
                                {selectedSubmission.type === 'booking' && (
                                    <div className="p-4 border rounded-xl space-y-3">
                                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" /> Booking Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {selectedSubmission.serviceType && (
                                                <div>
                                                    <p className="text-slate-500">Service Type</p>
                                                    <p className="font-medium">{selectedSubmission.serviceType}</p>
                                                </div>
                                            )}
                                            {selectedSubmission.propertyType && (
                                                <div>
                                                    <p className="text-slate-500">Property Type</p>
                                                    <p className="font-medium">{selectedSubmission.propertyType}</p>
                                                </div>
                                            )}
                                            {selectedSubmission.numberOfUnits && (
                                                <div>
                                                    <p className="text-slate-500">Number of Units</p>
                                                    <p className="font-medium">{selectedSubmission.numberOfUnits}</p>
                                                </div>
                                            )}
                                            {selectedSubmission.preferredDate && (
                                                <div>
                                                    <p className="text-slate-500">Preferred Date</p>
                                                    <p className="font-medium">{new Date(selectedSubmission.preferredDate).toLocaleDateString()} {selectedSubmission.preferredTime && `at ${selectedSubmission.preferredTime}`}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Message */}
                                {selectedSubmission.message && (
                                    <div className="p-4 border rounded-xl">
                                        <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                                            <MessageSquare className="h-4 w-4" /> Message
                                        </h4>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{selectedSubmission.message}</p>
                                    </div>
                                )}

                                {/* Admin Controls */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                                    <h4 className="font-semibold text-slate-900">Admin Controls</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Status</Label>
                                            <Select value={editStatus} onValueChange={setEditStatus}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map(s => (
                                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Quoted Amount ($)</Label>
                                            <div className="relative mt-1">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="number"
                                                    value={editQuotedAmount}
                                                    onChange={(e) => setEditQuotedAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Admin Notes</Label>
                                        <Textarea
                                            value={editNotes}
                                            onChange={(e) => setEditNotes(e.target.value)}
                                            placeholder="Add internal notes..."
                                            className="mt-1"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedSubmission._id)}>
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Cancel</Button>
                                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
