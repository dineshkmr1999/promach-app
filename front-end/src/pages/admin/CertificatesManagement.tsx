import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, Trash2, FileText, Award, Plus, X, ExternalLink, Loader2, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCMS } from '@/hooks/useCMS';
import { cmsAPI, certificatesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

interface Certificate {
    _id: string;
    name: string;
    icon: string;
    file: string;
    description: string;
}

export default function CertificatesManagement() {
    const { data: cmsData, isLoading, refetch } = useCMS();
    const { toast } = useToast();



    // Certificates State
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCertName, setNewCertName] = useState('');
    const [newCertDescription, setNewCertDescription] = useState('');
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Edit State
    const [editingCert, setEditingCert] = useState<Certificate | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIconFile, setEditIconFile] = useState<File | null>(null);
    const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
    const [updating, setUpdating] = useState(false);

    const iconInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const editIconInputRef = useRef<HTMLInputElement>(null);
    const editPdfInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (cmsData) {
            if (cmsData.certificates) {
                setCertificates(cmsData.certificates);
            }
        }
    }, [cmsData]);

    const handleUploadCertificate = async () => {
        if (!iconFile || !pdfFile || !newCertName.trim()) {
            toast({ title: 'Validation Error', description: 'Please provide a name, icon image, and PDF file', variant: 'destructive' });
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('name', newCertName.trim());
            formData.append('description', newCertDescription.trim());
            formData.append('icon', iconFile);
            formData.append('pdf', pdfFile);

            await certificatesAPI.upload(formData);
            refetch();
            toast({ title: 'Success!', description: `Certificate "${newCertName}" added successfully` });

            // Reset form
            setNewCertName('');
            setNewCertDescription('');
            setIconFile(null);
            setPdfFile(null);
            setShowAddForm(false);
            if (iconInputRef.current) iconInputRef.current.value = '';
            if (pdfInputRef.current) pdfInputRef.current.value = '';
        } catch (error: any) {
            toast({ title: 'Upload Failed', description: error.message || 'Failed to upload certificate', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCertificate = async (id: string) => {
        if (!confirm('Delete this certificate?')) return;

        setDeleting(id);
        try {
            await certificatesAPI.delete(id);
            refetch();
            toast({ title: 'Deleted', description: 'Certificate deleted successfully' });
        } catch (error: any) {
            toast({ title: 'Delete Failed', description: error.message || 'Failed to delete certificate', variant: 'destructive' });
        } finally {
            setDeleting(null);
        }
    };

    const openEditForm = (cert: Certificate) => {
        setEditingCert(cert);
        setEditName(cert.name);
        setEditDescription(cert.description || '');
        setEditIconFile(null);
        setEditPdfFile(null);
    };

    const closeEditForm = () => {
        setEditingCert(null);
        setEditName('');
        setEditDescription('');
        setEditIconFile(null);
        setEditPdfFile(null);
        if (editIconInputRef.current) editIconInputRef.current.value = '';
        if (editPdfInputRef.current) editPdfInputRef.current.value = '';
    };

    const handleUpdateCertificate = async () => {
        if (!editingCert || !editName.trim()) {
            toast({ title: 'Validation Error', description: 'Please provide a name', variant: 'destructive' });
            return;
        }

        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('name', editName.trim());
            formData.append('description', editDescription.trim());
            if (editIconFile) formData.append('icon', editIconFile);
            if (editPdfFile) formData.append('pdf', editPdfFile);

            await certificatesAPI.update(editingCert._id, formData);
            refetch();
            toast({ title: 'Updated!', description: `Certificate "${editName}" updated successfully` });
            closeEditForm();
        } catch (error: any) {
            toast({ title: 'Update Failed', description: error.message || 'Failed to update certificate', variant: 'destructive' });
        } finally {
            setUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Certificates Management</h1>
                    <p className="text-gray-600">Manage certificates and licenses displayed on your website</p>
                </div>

                {/* Certificates Section */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Award className="w-6 h-6" />
                                <CardTitle>Certificates & Licenses</CardTitle>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowAddForm(!showAddForm)}
                            >
                                {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                {showAddForm ? 'Cancel' : 'Add Certificate'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Add Certificate Form */}
                        {showAddForm && (
                            <div className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-dashed border-gray-300">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-primary" />
                                    Upload New Certificate
                                </h3>
                                <div className="grid gap-4">
                                    <div>
                                        <Label>Certificate Name *</Label>
                                        <Input
                                            value={newCertName}
                                            onChange={(e) => setNewCertName(e.target.value)}
                                            placeholder="e.g., BCA License, ISO Certification"
                                        />
                                    </div>
                                    <div>
                                        <Label>Description (optional)</Label>
                                        <Textarea
                                            value={newCertDescription}
                                            onChange={(e) => setNewCertDescription(e.target.value)}
                                            placeholder="Brief description of the certificate"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Icon Image * (PNG, JPG, SVG)</Label>
                                            <Input
                                                ref={iconInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                                                className="cursor-pointer"
                                            />
                                            {iconFile && (
                                                <p className="text-sm text-green-600 mt-1">✓ {iconFile.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>PDF File *</Label>
                                            <Input
                                                ref={pdfInputRef}
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                                className="cursor-pointer"
                                            />
                                            {pdfFile && (
                                                <p className="text-sm text-green-600 mt-1">✓ {pdfFile.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleUploadCertificate}
                                        disabled={uploading || !iconFile || !pdfFile || !newCertName.trim()}
                                        className="w-full"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Certificate
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Edit Certificate Modal */}
                        {editingCert && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <Pencil className="w-5 h-5 text-primary" />
                                            Edit Certificate
                                        </h3>
                                        <Button variant="ghost" size="sm" onClick={closeEditForm}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Current Icon Preview */}
                                    <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                        {editingCert.icon ? (
                                            <img
                                                src={`${API_URL}${editingCert.icon}`}
                                                alt={editingCert.name}
                                                className="w-16 h-16 object-contain rounded-lg border"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <FileText className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-gray-500">Current Icon</p>
                                            <a
                                                href={`${API_URL}${editingCert.file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View Current PDF
                                            </a>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        <div>
                                            <Label>Certificate Name *</Label>
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                placeholder="e.g., BCA License, ISO Certification"
                                            />
                                        </div>
                                        <div>
                                            <Label>Description (optional)</Label>
                                            <Textarea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                placeholder="Brief description of the certificate"
                                                rows={2}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>New Icon (optional)</Label>
                                                <Input
                                                    ref={editIconInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setEditIconFile(e.target.files?.[0] || null)}
                                                    className="cursor-pointer"
                                                />
                                                {editIconFile && (
                                                    <p className="text-sm text-green-600 mt-1">✓ {editIconFile.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label>New PDF (optional)</Label>
                                                <Input
                                                    ref={editPdfInputRef}
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => setEditPdfFile(e.target.files?.[0] || null)}
                                                    className="cursor-pointer"
                                                />
                                                {editPdfFile && (
                                                    <p className="text-sm text-green-600 mt-1">✓ {editPdfFile.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-2">
                                            <Button
                                                variant="outline"
                                                onClick={closeEditForm}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleUpdateCertificate}
                                                disabled={updating || !editName.trim()}
                                                className="flex-1"
                                            >
                                                {updating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Certificates List */}
                        {certificates.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>No certificates uploaded yet</p>
                                <p className="text-sm">Click "Add Certificate" to upload your first certificate</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {certificates.map((cert) => (
                                    <div
                                        key={cert._id}
                                        className="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {cert.icon ? (
                                                <img
                                                    src={`${API_URL}${cert.icon}`}
                                                    alt={cert.name}
                                                    className="w-16 h-16 object-contain rounded-lg border bg-gray-50"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">{cert.name}</h4>
                                                {cert.description && (
                                                    <p className="text-sm text-gray-500 line-clamp-2">{cert.description}</p>
                                                )}
                                                <a
                                                    href={`${API_URL}${cert.file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    View PDF
                                                </a>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditForm(cert)}
                                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCertificate(cert._id)}
                                                    disabled={deleting === cert._id}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    {deleting === cert._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
