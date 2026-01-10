import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Image, Loader2, X, Upload, Eye, EyeOff, Pencil, Save, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '@/hooks/useCMS';
import { brandsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

interface Brand {
    _id: string;
    name: string;
    logo?: string;
    isActive?: boolean;
    order?: number;
}

export default function BrandsManagement() {
    const { data: cmsData, isLoading, refetch } = useCMS();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [brands, setBrands] = useState<Brand[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toggling, setToggling] = useState<string | null>(null);

    // Edit State
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [editName, setEditName] = useState('');
    const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
    const [updating, setUpdating] = useState(false);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const editLogoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (cmsData?.brandsWithLogos) {
            setBrands(cmsData.brandsWithLogos);
        }
    }, [cmsData]);

    const handleUploadBrand = async () => {
        if (!newBrandName.trim()) {
            toast({ title: 'Validation Error', description: 'Please provide a brand name', variant: 'destructive' });
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('name', newBrandName.trim());
            if (logoFile) formData.append('logo', logoFile);

            await brandsAPI.upload(formData);
            refetch();
            toast({ title: 'Success!', description: `Brand "${newBrandName}" added successfully` });

            // Reset form
            setNewBrandName('');
            setLogoFile(null);
            setShowAddForm(false);
            if (logoInputRef.current) logoInputRef.current.value = '';
        } catch (error: any) {
            toast({ title: 'Upload Failed', description: error.message || 'Failed to upload brand', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteBrand = async (id: string) => {
        if (!confirm('Delete this brand?')) return;

        setDeleting(id);
        try {
            await brandsAPI.delete(id);
            refetch();
            toast({ title: 'Deleted', description: 'Brand deleted successfully' });
        } catch (error: any) {
            toast({ title: 'Delete Failed', description: error.message || 'Failed to delete brand', variant: 'destructive' });
        } finally {
            setDeleting(null);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        setToggling(id);
        try {
            const formData = new FormData();
            formData.append('isActive', String(!currentStatus));
            await brandsAPI.update(id, formData);
            refetch();
            toast({ title: currentStatus ? 'Hidden' : 'Visible', description: `Brand is now ${!currentStatus ? 'visible' : 'hidden'}` });
        } catch (error: any) {
            toast({ title: 'Update Failed', description: error.message || 'Failed to update brand visibility', variant: 'destructive' });
        } finally {
            setToggling(null);
        }
    };

    const openEditForm = (brand: Brand) => {
        setEditingBrand(brand);
        setEditName(brand.name);
        setEditLogoFile(null);
    };

    const closeEditForm = () => {
        setEditingBrand(null);
        setEditName('');
        setEditLogoFile(null);
        if (editLogoInputRef.current) editLogoInputRef.current.value = '';
    };

    const handleUpdateBrand = async () => {
        if (!editingBrand || !editName.trim()) {
            toast({ title: 'Validation Error', description: 'Please provide a brand name', variant: 'destructive' });
            return;
        }

        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('name', editName.trim());
            if (editLogoFile) formData.append('logo', editLogoFile);

            await brandsAPI.update(editingBrand._id, formData);
            refetch();
            toast({ title: 'Updated!', description: `Brand "${editName}" updated successfully` });
            closeEditForm();
        } catch (error: any) {
            toast({ title: 'Update Failed', description: error.message || 'Failed to update brand', variant: 'destructive' });
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

    const activeBrands = brands.filter(b => b.isActive);
    const inactiveBrands = brands.filter(b => !b.isActive);

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4 text-gray-500 hover:text-gray-900 -ml-2"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold mb-2">Brand Logos</h1>
                    <p className="text-gray-600">Manage brand logos displayed on the landing page with scrolling effect</p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Image className="w-6 h-6" />
                                <CardTitle>Brand Logos ({brands.length})</CardTitle>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowAddForm(!showAddForm)}
                            >
                                {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                {showAddForm ? 'Cancel' : 'Add Brand'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Add Brand Form */}
                        {showAddForm && (
                            <div className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-dashed border-gray-300">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-primary" />
                                    Add New Brand Logo
                                </h3>
                                <div className="grid gap-4">
                                    <div>
                                        <Label>Brand Name *</Label>
                                        <Input
                                            value={newBrandName}
                                            onChange={(e) => setNewBrandName(e.target.value)}
                                            placeholder="e.g., Daikin, Mitsubishi, Panasonic"
                                        />
                                    </div>
                                    <div>
                                        <Label>Logo Image (optional - PNG, JPG, SVG)</Label>
                                        <Input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                            className="cursor-pointer"
                                        />
                                        {logoFile && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <p className="text-sm text-green-600">✓ {logoFile.name}</p>
                                                <img
                                                    src={URL.createObjectURL(logoFile)}
                                                    alt="Preview"
                                                    className="h-8 object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleUploadBrand}
                                        disabled={uploading || !newBrandName.trim()}
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
                                                Add Brand
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Edit Brand Modal */}
                        {editingBrand && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <Pencil className="w-5 h-5 text-primary" />
                                            Edit Brand
                                        </h3>
                                        <Button variant="ghost" size="sm" onClick={closeEditForm}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Current Logo Preview */}
                                    <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                        <img
                                            src={`${API_URL}${editingBrand.logo}`}
                                            alt={editingBrand.name}
                                            className="w-20 h-20 object-contain rounded-lg border bg-white p-2"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-500">Current Logo</p>
                                            <p className="font-medium">{editingBrand.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        <div>
                                            <Label>Brand Name *</Label>
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                placeholder="e.g., Daikin, Mitsubishi, Panasonic"
                                            />
                                        </div>
                                        <div>
                                            <Label>New Logo (optional)</Label>
                                            <Input
                                                ref={editLogoInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setEditLogoFile(e.target.files?.[0] || null)}
                                                className="cursor-pointer"
                                            />
                                            {editLogoFile && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <p className="text-sm text-green-600">✓ {editLogoFile.name}</p>
                                                    <img
                                                        src={URL.createObjectURL(editLogoFile)}
                                                        alt="New Logo Preview"
                                                        className="h-10 object-contain"
                                                    />
                                                </div>
                                            )}
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
                                                onClick={handleUpdateBrand}
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

                        {/* Brands List */}
                        {brands.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Image className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>No brand logos uploaded yet</p>
                                <p className="text-sm">Click "Add Brand" to upload your first brand logo</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Active Brands */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Active Brands ({activeBrands.length})
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {activeBrands.map((brand) => (
                                            <div
                                                key={brand._id}
                                                className="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow group relative"
                                            >
                                                <div className="aspect-square flex items-center justify-center p-2 mb-2">
                                                    <img
                                                        src={`${API_URL}${brand.logo}`}
                                                        alt={brand.name}
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                </div>
                                                <p className="text-sm font-medium text-center text-gray-700 truncate">{brand.name}</p>

                                                {/* Action buttons */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditForm(brand)}
                                                        className="h-7 w-7 p-0 bg-white/80 hover:bg-blue-50"
                                                        title="Edit brand"
                                                    >
                                                        <Pencil className="w-3 h-3 text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(brand._id, brand.isActive)}
                                                        disabled={toggling === brand._id}
                                                        className="h-7 w-7 p-0 bg-white/80 hover:bg-amber-50"
                                                        title="Hide brand"
                                                    >
                                                        {toggling === brand._id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <EyeOff className="w-3 h-3 text-amber-600" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteBrand(brand._id)}
                                                        disabled={deleting === brand._id}
                                                        className="h-7 w-7 p-0 bg-white/80 hover:bg-red-50"
                                                        title="Delete brand"
                                                    >
                                                        {deleting === brand._id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3 h-3 text-red-500" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Inactive Brands */}
                                {inactiveBrands.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                            <EyeOff className="w-4 h-4" />
                                            Hidden Brands ({inactiveBrands.length})
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {inactiveBrands.map((brand) => (
                                                <div
                                                    key={brand._id}
                                                    className="bg-gray-100 border rounded-xl p-4 opacity-60 hover:opacity-100 transition-opacity group relative"
                                                >
                                                    <div className="aspect-square flex items-center justify-center p-2 mb-2">
                                                        <img
                                                            src={`${API_URL}${brand.logo}`}
                                                            alt={brand.name}
                                                            className="max-w-full max-h-full object-contain grayscale"
                                                        />
                                                    </div>
                                                    <p className="text-sm font-medium text-center text-gray-500 truncate">{brand.name}</p>

                                                    {/* Action buttons */}
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditForm(brand)}
                                                            className="h-7 w-7 p-0 bg-white/80 hover:bg-blue-50"
                                                            title="Edit brand"
                                                        >
                                                            <Pencil className="w-3 h-3 text-blue-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleActive(brand._id, brand.isActive)}
                                                            disabled={toggling === brand._id}
                                                            className="h-7 w-7 p-0 bg-white/80 hover:bg-green-50"
                                                            title="Show brand"
                                                        >
                                                            {toggling === brand._id ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Eye className="w-3 h-3 text-green-600" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteBrand(brand._id)}
                                                            disabled={deleting === brand._id}
                                                            className="h-7 w-7 p-0 bg-white/80 hover:bg-red-50"
                                                            title="Delete brand"
                                                        >
                                                            {deleting === brand._id ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3 h-3 text-red-500" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Preview Section */}
                        {activeBrands.length > 0 && (
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Scrolling Preview</h3>
                                <div className="bg-gray-50 rounded-xl p-4 overflow-hidden">
                                    <div className="flex gap-8 animate-marquee">
                                        {[...activeBrands, ...activeBrands].map((brand, i) => (
                                            <div key={`${brand._id}-${i}`} className="flex-shrink-0">
                                                <img
                                                    src={`${API_URL}${brand.logo}`}
                                                    alt={brand.name}
                                                    className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-center">This is how the brands will appear on the landing page</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </AdminLayout>
    );
}
