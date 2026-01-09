import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, MapPin, Calendar, Star, RefreshCw } from 'lucide-react';
import { portfolioAPI } from '@/services/api';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:6001';

interface PortfolioImage {
    url: string;
    filename: string;
    caption: string;
}

interface PortfolioItem {
    _id?: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    images: PortfolioImage[];
    beforeImages?: PortfolioImage[];
    afterImages?: PortfolioImage[];
    location: string;
    isFeatured: boolean;
    completedAt: string;
}

const CATEGORIES = [
    { value: 'aircon', label: 'Aircon Services' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'installation', label: 'Installation' },
];

export default function PortfolioManagement() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('aircon');
    const [tags, setTags] = useState('');
    const [location, setLocation] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [completedAt, setCompletedAt] = useState('');

    // File upload state
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedBeforeImages, setSelectedBeforeImages] = useState<File[]>([]);
    const [selectedAfterImages, setSelectedAfterImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<PortfolioImage[]>([]);
    const [existingBeforeImages, setExistingBeforeImages] = useState<PortfolioImage[]>([]);
    const [existingAfterImages, setExistingAfterImages] = useState<PortfolioImage[]>([]);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setIsLoading(true);
            const data = await portfolioAPI.getAll({});
            setItems(Array.isArray(data) ? data : data.items || []);
        } catch (error) {
            console.error('Failed to fetch portfolio:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openDialog = (item?: PortfolioItem) => {
        if (item) {
            setEditingItem(item);
            setTitle(item.title);
            setDescription(item.description);
            setCategory(item.category);
            setTags(item.tags.join(', '));
            setLocation(item.location);
            setIsFeatured(item.isFeatured);
            setCompletedAt(item.completedAt ? new Date(item.completedAt).toISOString().split('T')[0] : '');
            setExistingImages(item.images || []);
            setExistingBeforeImages(item.beforeImages || []);
            setExistingAfterImages(item.afterImages || []);
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setTitle('');
        setDescription('');
        setCategory('aircon');
        setTags('');
        setLocation('');
        setIsFeatured(false);
        setCompletedAt('');
        setSelectedImages([]);
        setSelectedBeforeImages([]);
        setSelectedAfterImages([]);
        setExistingImages([]);
        setExistingBeforeImages([]);
        setExistingAfterImages([]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'beforeImages' | 'afterImages') => {
        const files = Array.from(e.target.files || []);
        if (type === 'images') setSelectedImages(prev => [...prev, ...files]);
        else if (type === 'beforeImages') setSelectedBeforeImages(prev => [...prev, ...files]);
        else if (type === 'afterImages') setSelectedAfterImages(prev => [...prev, ...files]);
    };

    const removeFile = (index: number, type: 'images' | 'beforeImages' | 'afterImages') => {
        if (type === 'images') setSelectedImages(prev => prev.filter((_, i) => i !== index));
        else if (type === 'beforeImages') setSelectedBeforeImages(prev => prev.filter((_, i) => i !== index));
        else if (type === 'afterImages') setSelectedAfterImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number, type: 'images' | 'beforeImages' | 'afterImages') => {
        if (type === 'images') setExistingImages(prev => prev.filter((_, i) => i !== index));
        else if (type === 'beforeImages') setExistingBeforeImages(prev => prev.filter((_, i) => i !== index));
        else if (type === 'afterImages') setExistingAfterImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(t => t)));
            formData.append('location', location);
            formData.append('isFeatured', String(isFeatured));
            if (completedAt) formData.append('completedAt', completedAt);

            selectedImages.forEach(file => formData.append('images', file));
            selectedBeforeImages.forEach(file => formData.append('beforeImages', file));
            selectedAfterImages.forEach(file => formData.append('afterImages', file));

            if (editingItem) {
                formData.append('existingImages', JSON.stringify(existingImages));
                formData.append('existingBeforeImages', JSON.stringify(existingBeforeImages));
                formData.append('existingAfterImages', JSON.stringify(existingAfterImages));
            }

            if (editingItem?._id) {
                await portfolioAPI.update(editingItem._id, formData);
            } else {
                await portfolioAPI.create(formData);
            }

            setIsDialogOpen(false);
            resetForm();
            fetchPortfolio();
        } catch (error) {
            console.error('Failed to save portfolio item:', error);
            alert('Failed to save portfolio item');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await portfolioAPI.delete(id);
            fetchPortfolio();
        } catch (error) {
            console.error('Failed to delete portfolio item:', error);
            alert('Failed to delete portfolio item');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Portfolio Management</h1>
                        <p className="text-slate-500 mt-1">Showcase your completed projects</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={fetchPortfolio} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button onClick={() => openDialog()} className="bg-gradient-to-r from-primary to-slate-600 hover:from-primary/90 hover:to-slate-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Portfolio Item
                        </Button>
                    </div>
                </div>

                {/* Portfolio Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border-0 shadow-lg overflow-hidden">
                                <div className="h-48 bg-slate-200 animate-pulse" />
                                <CardContent className="p-4 space-y-3">
                                    <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4" />
                                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                                    <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <ImageIcon className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Portfolio Items Yet</h3>
                            <p className="text-slate-500 text-center mb-6 max-w-sm">
                                Start showcasing your work by adding your first portfolio item.
                            </p>
                            <Button onClick={() => openDialog()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Item
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <Card key={item._id} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                {/* Image */}
                                <div className="relative h-48 bg-slate-100">
                                    {item.images && item.images[0] ? (
                                        <img
                                            src={`${API_URL}${item.images[0].url}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-slate-300" />
                                        </div>
                                    )}
                                    {item.isFeatured && (
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                            <Star className="h-3 w-3" /> Featured
                                        </div>
                                    )}
                                    {((item.beforeImages && item.beforeImages.length > 0) ||
                                        (item.afterImages && item.afterImages.length > 0)) && (
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-red-500 to-green-500 text-white text-xs font-semibold rounded-full">
                                                Before/After
                                            </div>
                                        )}
                                    <div className="absolute bottom-3 left-3">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium rounded-full capitalize">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">{item.title}</h3>
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.description}</p>

                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                        {item.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {item.location}
                                            </span>
                                        )}
                                        {item.completedAt && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(item.completedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => openDialog(item)} className="flex-1">
                                            <Pencil className="h-3 w-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id!)} className="flex-1">
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">{editingItem ? 'Edit' : 'Add'} Portfolio Item</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-5 mt-4">
                            <div>
                                <Label className="text-slate-700">Title</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className="mt-1.5" />
                            </div>

                            <div>
                                <Label className="text-slate-700">Description</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the project..." className="mt-1.5" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-700">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-slate-700">Location</Label>
                                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Singapore" className="mt-1.5" />
                                </div>
                            </div>

                            <div>
                                <Label className="text-slate-700">Tags (comma separated)</Label>
                                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. aircon, cooling, installation" className="mt-1.5" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-700">Completed Date</Label>
                                    <Input type="date" value={completedAt} onChange={(e) => setCompletedAt(e.target.value)} className="mt-1.5" />
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300"
                                    />
                                    <Label htmlFor="featured" className="cursor-pointer flex items-center gap-2">
                                        <Star className="h-4 w-4 text-amber-500" />
                                        Featured Item
                                    </Label>
                                </div>
                            </div>

                            {/* Main Images */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <Label className="text-slate-700 font-semibold">Main Images</Label>
                                <div className="mt-3">
                                    <label className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Images
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'images')} />
                                    </label>
                                </div>
                                <div className="grid grid-cols-5 gap-2 mt-3">
                                    {existingImages.map((img, idx) => (
                                        <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden">
                                            <img src={`${API_URL}${img.url}`} alt="" className="w-full h-full object-cover" />
                                            <button onClick={() => removeExistingImage(idx, 'images')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedImages.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                            <button onClick={() => removeFile(idx, 'images')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Before/After Images */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-red-50 rounded-xl">
                                    <Label className="text-slate-700 font-semibold">Before Images</Label>
                                    <div className="mt-3">
                                        <label className="inline-flex items-center px-3 py-2 bg-red-500 text-white text-sm rounded-lg cursor-pointer hover:bg-red-600 transition-colors">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Before
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'beforeImages')} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        {existingBeforeImages.map((img, idx) => (
                                            <div key={`before-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-red-300">
                                                <img src={`${API_URL}${img.url}`} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => removeExistingImage(idx, 'beforeImages')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedBeforeImages.map((file, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-red-300">
                                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => removeFile(idx, 'beforeImages')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-green-50 rounded-xl">
                                    <Label className="text-slate-700 font-semibold">After Images</Label>
                                    <div className="mt-3">
                                        <label className="inline-flex items-center px-3 py-2 bg-green-500 text-white text-sm rounded-lg cursor-pointer hover:bg-green-600 transition-colors">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload After
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'afterImages')} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        {existingAfterImages.map((img, idx) => (
                                            <div key={`after-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-300">
                                                <img src={`${API_URL}${img.url}`} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => removeExistingImage(idx, 'afterImages')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedAfterImages.map((file, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-300">
                                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => removeFile(idx, 'afterImages')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-slate-600">Save Portfolio Item</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
