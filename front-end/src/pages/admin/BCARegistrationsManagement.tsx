import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Trash2,
    Edit,
    Save,
    X,
    Building2,
    ExternalLink,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    HardHat,
    Hammer
} from 'lucide-react';
import { cmsAPI, bcaRegistrationsAPI } from '@/services/api';

interface Contractor {
    _id: string;
    workhead: string;
    description: string;
    grade: string;
    expiryDate: string;
    isActive: boolean;
}

interface Builder {
    _id: string;
    licensingCode: string;
    description: string;
    expiryDate: string;
    isActive: boolean;
}

interface BCAData {
    sectionTitle: string;
    companyName: string;
    uen: string;
    bcaUrl: string;
    registeredContractors: Contractor[];
    licensedBuilders: Builder[];
}

export default function BCARegistrationsManagement() {
    const [bcaData, setBcaData] = useState<BCAData>({
        sectionTitle: 'BCA Registrations',
        companyName: 'PROMACH PTE. LTD.',
        uen: '202008249W',
        bcaUrl: 'https://www1.bca.gov.sg/bca-directory/company/Details/202008249W',
        registeredContractors: [],
        licensedBuilders: []
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Modal states
    const [contractorModal, setContractorModal] = useState<{ isOpen: boolean; data: Contractor | null }>({ isOpen: false, data: null });
    const [builderModal, setBuilderModal] = useState<{ isOpen: boolean; data: Builder | null }>({ isOpen: false, data: null });

    // Form states for modals
    const [contractorForm, setContractorForm] = useState({ workhead: '', description: '', grade: '', expiryDate: '' });
    const [builderForm, setBuilderForm] = useState({ licensingCode: '', description: '', expiryDate: '' });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await cmsAPI.getAll();
            if (data?.bcaRegistrations) {
                setBcaData({
                    sectionTitle: data.bcaRegistrations.sectionTitle || 'BCA Registrations',
                    companyName: data.bcaRegistrations.companyName || 'PROMACH PTE. LTD.',
                    uen: data.bcaRegistrations.uen || '202008249W',
                    bcaUrl: data.bcaRegistrations.bcaUrl || 'https://www1.bca.gov.sg/bca-directory/company/Details/202008249W',
                    registeredContractors: data.bcaRegistrations.registeredContractors || [],
                    licensedBuilders: data.bcaRegistrations.licensedBuilders || []
                });
            }
        } catch (err) {
            setError('Failed to load BCA registrations data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSettingsSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            await bcaRegistrationsAPI.updateSettings({
                sectionTitle: bcaData.sectionTitle,
                companyName: bcaData.companyName,
                uen: bcaData.uen,
                bcaUrl: bcaData.bcaUrl
            });
            setSuccess('Settings saved successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    // Contractor CRUD
    const openContractorModal = (contractor?: Contractor) => {
        if (contractor) {
            setContractorForm({
                workhead: contractor.workhead,
                description: contractor.description,
                grade: contractor.grade,
                expiryDate: contractor.expiryDate
            });
            setContractorModal({ isOpen: true, data: contractor });
        } else {
            setContractorForm({ workhead: '', description: '', grade: '', expiryDate: '' });
            setContractorModal({ isOpen: true, data: null });
        }
    };

    const handleContractorSave = async () => {
        try {
            setIsSaving(true);
            setError(null);

            if (contractorModal.data) {
                await bcaRegistrationsAPI.updateContractor(contractorModal.data._id, contractorForm);
            } else {
                await bcaRegistrationsAPI.addContractor(contractorForm);
            }

            setContractorModal({ isOpen: false, data: null });
            setSuccess(contractorModal.data ? 'Contractor updated' : 'Contractor added');
            setTimeout(() => setSuccess(null), 3000);
            fetchData();
        } catch (err: any) {
            const errorMsg = err?.message || 'Failed to save contractor';
            setError(errorMsg.includes('Invalid token') ? 'Session expired. Please log out and log back in.' : errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleContractorDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contractor?')) return;
        try {
            setError(null);
            await bcaRegistrationsAPI.deleteContractor(id);
            setSuccess('Contractor deleted');
            setTimeout(() => setSuccess(null), 3000);
            fetchData();
        } catch (err) {
            setError('Failed to delete contractor');
        }
    };

    // Builder CRUD
    const openBuilderModal = (builder?: Builder) => {
        if (builder) {
            setBuilderForm({
                licensingCode: builder.licensingCode,
                description: builder.description,
                expiryDate: builder.expiryDate
            });
            setBuilderModal({ isOpen: true, data: builder });
        } else {
            setBuilderForm({ licensingCode: '', description: '', expiryDate: '' });
            setBuilderModal({ isOpen: true, data: null });
        }
    };

    const handleBuilderSave = async () => {
        try {
            setIsSaving(true);
            setError(null);

            if (builderModal.data) {
                await bcaRegistrationsAPI.updateBuilder(builderModal.data._id, builderForm);
            } else {
                await bcaRegistrationsAPI.addBuilder(builderForm);
            }

            setBuilderModal({ isOpen: false, data: null });
            setSuccess(builderModal.data ? 'Builder updated' : 'Builder added');
            setTimeout(() => setSuccess(null), 3000);
            fetchData();
        } catch (err: any) {
            const errorMsg = err?.message || 'Failed to save builder';
            setError(errorMsg.includes('Invalid token') ? 'Session expired. Please log out and log back in.' : errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBuilderDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this builder?')) return;
        try {
            setError(null);
            await bcaRegistrationsAPI.deleteBuilder(id);
            setSuccess('Builder deleted');
            setTimeout(() => setSuccess(null), 3000);
            fetchData();
        } catch (err) {
            setError('Failed to delete builder');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">BCA Registrations</h1>
                        <p className="text-slate-500 mt-1">Manage your BCA contractor and builder registrations</p>
                    </div>
                    <Button onClick={fetchData} variant="outline" className="flex items-center gap-2" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span className="text-emerald-700">{success}</span>
                    </div>
                )}

                {/* Company Settings Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Company Information</CardTitle>
                                <p className="text-sm text-slate-500">BCA registration details</p>
                            </div>
                        </div>
                        {bcaData.bcaUrl && (
                            <a
                                href={bcaData.bcaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View on BCA
                            </a>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    value={bcaData.sectionTitle}
                                    onChange={(e) => setBcaData({ ...bcaData, sectionTitle: e.target.value })}
                                    placeholder="BCA Registrations"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input
                                    value={bcaData.companyName}
                                    onChange={(e) => setBcaData({ ...bcaData, companyName: e.target.value })}
                                    placeholder="PROMACH PTE. LTD."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>UEN</Label>
                                <Input
                                    value={bcaData.uen}
                                    onChange={(e) => setBcaData({ ...bcaData, uen: e.target.value })}
                                    placeholder="202008249W"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>BCA Verification URL</Label>
                                <Input
                                    value={bcaData.bcaUrl}
                                    onChange={(e) => setBcaData({ ...bcaData, bcaUrl: e.target.value })}
                                    placeholder="https://www1.bca.gov.sg/..."
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleSettingsSave} disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Registered Contractors Table */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <HardHat className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Registered Contractors</CardTitle>
                                <p className="text-sm text-slate-500">{bcaData.registeredContractors.length} entries</p>
                            </div>
                        </div>
                        <Button onClick={() => openContractorModal()} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Contractor
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : bcaData.registeredContractors.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-blue-600 text-white">
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Workheads</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Grade</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Expiry Date</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bcaData.registeredContractors.map((contractor, index) => (
                                            <tr key={contractor._id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className="px-4 py-3 text-sm font-medium text-slate-900">{contractor.workhead}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{contractor.description}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{contractor.grade}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{contractor.expiryDate}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => openContractorModal(contractor)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleContractorDelete(contractor._id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <HardHat className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>No registered contractors yet</p>
                                <Button onClick={() => openContractorModal()} variant="outline" size="sm" className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Contractor
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Licensed Builders Table */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Hammer className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Licensed Builders</CardTitle>
                                <p className="text-sm text-slate-500">{bcaData.licensedBuilders.length} entries</p>
                            </div>
                        </div>
                        <Button onClick={() => openBuilderModal()} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Builder
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : bcaData.licensedBuilders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-blue-600 text-white">
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Licensing Code</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Expiry Date</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bcaData.licensedBuilders.map((builder, index) => (
                                            <tr key={builder._id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className="px-4 py-3 text-sm font-medium text-slate-900">{builder.licensingCode}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{builder.description}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{builder.expiryDate}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => openBuilderModal(builder)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleBuilderDelete(builder._id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Hammer className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>No licensed builders yet</p>
                                <Button onClick={() => openBuilderModal()} variant="outline" size="sm" className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Builder
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contractor Modal */}
                {contractorModal.isOpen && createPortal(
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">
                                    {contractorModal.data ? 'Edit Contractor' : 'Add Contractor'}
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => setContractorModal({ isOpen: false, data: null })}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Workhead Code *</Label>
                                    <Input
                                        value={contractorForm.workhead}
                                        onChange={(e) => setContractorForm({ ...contractorForm, workhead: e.target.value })}
                                        placeholder="e.g., CR06, CW01, ME01"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description *</Label>
                                    <Input
                                        value={contractorForm.description}
                                        onChange={(e) => setContractorForm({ ...contractorForm, description: e.target.value })}
                                        placeholder="e.g., Interior Decoration & Finishing Works"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Grade</Label>
                                        <Input
                                            value={contractorForm.grade}
                                            onChange={(e) => setContractorForm({ ...contractorForm, grade: e.target.value })}
                                            placeholder="e.g., L1, C3, L4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expiry Date</Label>
                                        <Input
                                            value={contractorForm.expiryDate}
                                            onChange={(e) => setContractorForm({ ...contractorForm, expiryDate: e.target.value })}
                                            placeholder="e.g., 01/09/2028"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={() => setContractorModal({ isOpen: false, data: null })}>
                                    Cancel
                                </Button>
                                <Button onClick={handleContractorSave} disabled={isSaving || !contractorForm.workhead || !contractorForm.description}>
                                    {isSaving ? 'Saving...' : contractorModal.data ? 'Update' : 'Add'}
                                </Button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Builder Modal */}
                {builderModal.isOpen && createPortal(
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">
                                    {builderModal.data ? 'Edit Builder' : 'Add Builder'}
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => setBuilderModal({ isOpen: false, data: null })}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Licensing Code *</Label>
                                    <Input
                                        value={builderForm.licensingCode}
                                        onChange={(e) => setBuilderForm({ ...builderForm, licensingCode: e.target.value })}
                                        placeholder="e.g., GB2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description *</Label>
                                    <Input
                                        value={builderForm.description}
                                        onChange={(e) => setBuilderForm({ ...builderForm, description: e.target.value })}
                                        placeholder="e.g., General Builder Class 2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expiry Date</Label>
                                    <Input
                                        value={builderForm.expiryDate}
                                        onChange={(e) => setBuilderForm({ ...builderForm, expiryDate: e.target.value })}
                                        placeholder="e.g., 19/06/2027"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={() => setBuilderModal({ isOpen: false, data: null })}>
                                    Cancel
                                </Button>
                                <Button onClick={handleBuilderSave} disabled={isSaving || !builderForm.licensingCode || !builderForm.description}>
                                    {isSaving ? 'Saving...' : builderModal.data ? 'Update' : 'Add'}
                                </Button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </AdminLayout>
    );
}
