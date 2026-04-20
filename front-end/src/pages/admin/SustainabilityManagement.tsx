import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    Save,
    Loader2,
    Plus,
    Trash2,
    Pencil,
    FileText,
    Leaf,
    Upload,
    X,
    GripVertical,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PromachLoader from '@/components/PromachLoader';
import { sustainabilityAPI } from '@/services/api';

// Available icon names users can pick from (must match frontend ICON_MAP)
const ICON_CHOICES = [
    'Zap', 'Globe', 'Recycle', 'Package', 'Shield', 'ShieldCheck', 'Monitor',
    'Trash2', 'TrendingUp', 'ClipboardList', 'ShoppingCart', 'HardHat',
    'CheckCircle', 'Wrench', 'Snowflake', 'Layers', 'Truck', 'Leaf', 'Award',
    'FileText',
];

interface Item {
    _id?: string;
    title?: string;
    description?: string;
    icon?: string;
    code?: string;
    name?: string;
    isActive?: boolean;
    order?: number;
}

interface Doc {
    _id?: string;
    name?: string;
    description?: string;
    file?: string;
    isActive?: boolean;
    order?: number;
}

interface Content {
    hero?: { title?: string; subtitle?: string; badge?: string };
    commitment?: { title?: string; paragraphs?: string[] };
    framework?: {
        title?: string;
        intro?: string;
        outro?: string;
        standards?: Item[];
    };
    focusAreas?: { title?: string; subtitle?: string; items?: Item[] };
    targets?: { title?: string; subtitle?: string; items?: Item[] };
    implementation?: { title?: string; subtitle?: string; steps?: Item[] };
    alternatives?: { title?: string; subtitle?: string; items?: Item[] };
    continuousImprovement?: { title?: string; paragraphs?: string[] };
    disclaimer?: string;
    documents?: Doc[];
}

type ListKey = 'standards' | 'focus-areas' | 'targets' | 'implementation-steps' | 'alternatives';

export default function SustainabilityManagement() {
    const { toast } = useToast();
    const [content, setContent] = useState<Content>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingMeta, setIsSavingMeta] = useState(false);

    // Modal/edit state
    const [editing, setEditing] = useState<
        | { list: ListKey; item: Item }
        | null
    >(null);
    const [editingDoc, setEditingDoc] = useState<Doc | null>(null);
    const [docFile, setDocFile] = useState<File | null>(null);

    const load = async () => {
        try {
            setIsLoading(true);
            const data = await sustainabilityAPI.get();
            setContent(data || {});
        } catch (err: any) {
            toast({
                title: 'Load failed',
                description: err.message || 'Failed to load',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // -----------------------------------
    // Section (text-only) save helpers
    // -----------------------------------
    const saveSection = async (partial: Partial<Content>) => {
        try {
            setIsSavingMeta(true);
            const updated = await sustainabilityAPI.update(partial);
            setContent(updated);
            toast({ title: 'Saved', description: 'Content updated successfully' });
        } catch (err: any) {
            toast({
                title: 'Save failed',
                description: err.message || 'Failed to save',
                variant: 'destructive',
            });
        } finally {
            setIsSavingMeta(false);
        }
    };

    // -----------------------------------
    // Subdocument list helpers
    // -----------------------------------
    const openCreate = (list: ListKey) => {
        setEditing({
            list,
            item: {
                title: '',
                description: '',
                icon: 'Leaf',
                isActive: true,
                order: 0,
                ...(list === 'standards' ? { code: '', name: '' } : {}),
            },
        });
    };

    const openEdit = (list: ListKey, item: Item) => {
        setEditing({ list, item: { ...item } });
    };

    const submitItem = async () => {
        if (!editing) return;
        try {
            if (editing.item._id) {
                await sustainabilityAPI.updateItem(editing.list, editing.item._id, editing.item);
            } else {
                await sustainabilityAPI.addItem(editing.list, editing.item);
            }
            toast({ title: 'Saved', description: 'Item saved' });
            setEditing(null);
            await load();
        } catch (err: any) {
            toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
        }
    };

    const deleteItem = async (list: ListKey, id?: string) => {
        if (!id) return;
        if (!confirm('Delete this item?')) return;
        try {
            await sustainabilityAPI.deleteItem(list, id);
            toast({ title: 'Deleted' });
            await load();
        } catch (err: any) {
            toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
        }
    };

    // -----------------------------------
    // Documents
    // -----------------------------------
    const submitDocument = async () => {
        if (!editingDoc) return;
        try {
            const fd = new FormData();
            fd.append('name', editingDoc.name || '');
            fd.append('description', editingDoc.description || '');
            if (docFile) fd.append('file', docFile);

            if (editingDoc._id) {
                await sustainabilityAPI.updateDocument(editingDoc._id, fd);
            } else {
                if (!docFile) {
                    toast({ title: 'File required', description: 'Please attach a PDF', variant: 'destructive' });
                    return;
                }
                await sustainabilityAPI.uploadDocument(fd);
            }
            toast({ title: 'Saved', description: 'Document saved' });
            setEditingDoc(null);
            setDocFile(null);
            await load();
        } catch (err: any) {
            toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
        }
    };

    const deleteDocument = async (id?: string) => {
        if (!id) return;
        if (!confirm('Delete this document? The PDF file will be removed from the server.')) return;
        try {
            await sustainabilityAPI.deleteDocument(id);
            toast({ title: 'Deleted' });
            await load();
        } catch (err: any) {
            toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <PromachLoader variant="inline" />
            </AdminLayout>
        );
    }

    // Text-paragraphs editor (for commitment & continuousImprovement)
    const renderParagraphsEditor = (
        key: 'commitment' | 'continuousImprovement',
    ) => {
        const section = content[key] || { paragraphs: [] };
        const paragraphs = section.paragraphs || [];

        const update = (paras: string[], title?: string) => {
            setContent({
                ...content,
                [key]: { ...section, title: title ?? section.title, paragraphs: paras },
            });
        };

        return (
            <div className="space-y-3">
                <div>
                    <Label>Section Title</Label>
                    <Input
                        value={section.title || ''}
                        onChange={(e) => update(paragraphs, e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Paragraphs</Label>
                    {paragraphs.map((p, i) => (
                        <div key={i} className="flex gap-2">
                            <Textarea
                                value={p}
                                rows={3}
                                onChange={(e) => {
                                    const next = [...paragraphs];
                                    next[i] = e.target.value;
                                    update(next);
                                }}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => update(paragraphs.filter((_, idx) => idx !== i))}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => update([...paragraphs, ''])}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Paragraph
                    </Button>
                </div>
            </div>
        );
    };

    // Shared list renderer with title/subtitle editor + CRUD
    const renderListSection = (opts: {
        sectionKey: 'framework' | 'focusAreas' | 'targets' | 'implementation' | 'alternatives';
        listKey: ListKey;
        itemsAccessor: (c: Content) => Item[] | undefined;
        hasSubtitle?: boolean;
        hasIntroOutro?: boolean;
    }) => {
        const { sectionKey, listKey, itemsAccessor, hasSubtitle, hasIntroOutro } = opts;
        const section: any = content[sectionKey] || {};
        const items = itemsAccessor(content) || [];

        const updateMeta = (partial: any) => {
            setContent({
                ...content,
                [sectionKey]: { ...section, ...partial },
            });
        };

        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Section Heading</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <Label>Title</Label>
                            <Input
                                value={section.title || ''}
                                onChange={(e) => updateMeta({ title: e.target.value })}
                            />
                        </div>
                        {hasSubtitle && (
                            <div>
                                <Label>Subtitle</Label>
                                <Textarea
                                    value={section.subtitle || ''}
                                    onChange={(e) => updateMeta({ subtitle: e.target.value })}
                                    rows={2}
                                />
                            </div>
                        )}
                        {hasIntroOutro && (
                            <>
                                <div>
                                    <Label>Intro Paragraph</Label>
                                    <Textarea
                                        value={section.intro || ''}
                                        onChange={(e) => updateMeta({ intro: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label>Outro Paragraph</Label>
                                    <Textarea
                                        value={section.outro || ''}
                                        onChange={(e) => updateMeta({ outro: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Items ({items.length})</CardTitle>
                            <Button size="sm" onClick={() => openCreate(listKey)}>
                                <Plus className="h-4 w-4 mr-1" /> Add Item
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No items yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {[...items]
                                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                    .map((item) => (
                                        <div
                                            key={item._id}
                                            className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                                                item.isActive === false
                                                    ? 'bg-slate-50 opacity-60'
                                                    : 'bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            <GripVertical className="h-5 w-5 text-slate-300 flex-shrink-0 mt-1" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {item.code && (
                                                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                                            {item.code}
                                                        </span>
                                                    )}
                                                    <span className="font-semibold">
                                                        {item.title || item.name}
                                                    </span>
                                                    {item.icon && (
                                                        <span className="text-xs text-slate-400">({item.icon})</span>
                                                    )}
                                                    {item.isActive === false && (
                                                        <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(listKey, item)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteItem(listKey, item._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        onClick={() =>
                            saveSection({
                                [sectionKey]: content[sectionKey],
                            } as any)
                        }
                        disabled={isSavingMeta}
                    >
                        {isSavingMeta ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Heading
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">Sustainability Page</h1>
                </div>
                <p className="text-gray-600 mb-6">
                    Manage every section of the public sustainability page. Changes are saved section-by-section.
                </p>

                <Tabs defaultValue="hero" className="w-full">
                    <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 w-full h-auto">
                        <TabsTrigger value="hero">Hero</TabsTrigger>
                        <TabsTrigger value="commitment">Commitment</TabsTrigger>
                        <TabsTrigger value="framework">Framework</TabsTrigger>
                        <TabsTrigger value="focus">Focus Areas</TabsTrigger>
                        <TabsTrigger value="targets">Targets</TabsTrigger>
                        <TabsTrigger value="impl">Implementation</TabsTrigger>
                        <TabsTrigger value="alt">Alternatives</TabsTrigger>
                        <TabsTrigger value="improvement">Improvement</TabsTrigger>
                        <TabsTrigger value="docs">Documents</TabsTrigger>
                    </TabsList>

                    {/* HERO */}
                    <TabsContent value="hero" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hero Section</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Badge Text</Label>
                                    <Input
                                        value={content.hero?.badge || ''}
                                        onChange={(e) =>
                                            setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={content.hero?.title || ''}
                                        onChange={(e) =>
                                            setContent({ ...content, hero: { ...content.hero, title: e.target.value } })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Subtitle</Label>
                                    <Textarea
                                        rows={3}
                                        value={content.hero?.subtitle || ''}
                                        onChange={(e) =>
                                            setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })
                                        }
                                    />
                                </div>
                                <Button onClick={() => saveSection({ hero: content.hero })} disabled={isSavingMeta}>
                                    {isSavingMeta ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Hero
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* COMMITMENT */}
                    <TabsContent value="commitment" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Our Commitment</CardTitle>
                            </CardHeader>
                            <CardContent>{renderParagraphsEditor('commitment')}</CardContent>
                            <CardContent>
                                <Button
                                    onClick={() => saveSection({ commitment: content.commitment })}
                                    disabled={isSavingMeta}
                                >
                                    {isSavingMeta ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Commitment
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* FRAMEWORK */}
                    <TabsContent value="framework" className="mt-6">
                        {renderListSection({
                            sectionKey: 'framework',
                            listKey: 'standards',
                            itemsAccessor: (c) => c.framework?.standards,
                            hasIntroOutro: true,
                        })}
                    </TabsContent>

                    {/* FOCUS AREAS */}
                    <TabsContent value="focus" className="mt-6">
                        {renderListSection({
                            sectionKey: 'focusAreas',
                            listKey: 'focus-areas',
                            itemsAccessor: (c) => c.focusAreas?.items,
                            hasSubtitle: true,
                        })}
                    </TabsContent>

                    {/* TARGETS */}
                    <TabsContent value="targets" className="mt-6">
                        {renderListSection({
                            sectionKey: 'targets',
                            listKey: 'targets',
                            itemsAccessor: (c) => c.targets?.items,
                            hasSubtitle: true,
                        })}
                    </TabsContent>

                    {/* IMPLEMENTATION */}
                    <TabsContent value="impl" className="mt-6">
                        {renderListSection({
                            sectionKey: 'implementation',
                            listKey: 'implementation-steps',
                            itemsAccessor: (c) => c.implementation?.steps,
                            hasSubtitle: true,
                        })}
                    </TabsContent>

                    {/* ALTERNATIVES */}
                    <TabsContent value="alt" className="mt-6">
                        {renderListSection({
                            sectionKey: 'alternatives',
                            listKey: 'alternatives',
                            itemsAccessor: (c) => c.alternatives?.items,
                            hasSubtitle: true,
                        })}
                    </TabsContent>

                    {/* CONTINUOUS IMPROVEMENT + DISCLAIMER */}
                    <TabsContent value="improvement" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Continuous Improvement</CardTitle>
                            </CardHeader>
                            <CardContent>{renderParagraphsEditor('continuousImprovement')}</CardContent>
                            <CardContent>
                                <Button
                                    onClick={() =>
                                        saveSection({ continuousImprovement: content.continuousImprovement })
                                    }
                                    disabled={isSavingMeta}
                                >
                                    {isSavingMeta ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Disclaimer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea
                                    rows={5}
                                    value={content.disclaimer || ''}
                                    onChange={(e) => setContent({ ...content, disclaimer: e.target.value })}
                                />
                                <Button
                                    onClick={() => saveSection({ disclaimer: content.disclaimer })}
                                    disabled={isSavingMeta}
                                >
                                    {isSavingMeta ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Disclaimer
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* DOCUMENTS */}
                    <TabsContent value="docs" className="mt-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Downloadable PDF Documents</CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            setEditingDoc({ name: '', description: '', isActive: true })
                                        }
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> Upload PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!content.documents?.length ? (
                                    <div className="text-center py-8 text-slate-400 text-sm">
                                        No documents uploaded yet.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {content.documents.map((d) => (
                                            <div
                                                key={d._id}
                                                className="flex items-center gap-3 p-4 rounded-lg border bg-white"
                                            >
                                                <FileText className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold">{d.name}</div>
                                                    {d.description && (
                                                        <p className="text-sm text-slate-600 truncate">{d.description}</p>
                                                    )}
                                                    {d.file && (
                                                        <a
                                                            href={d.file}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-emerald-600 hover:underline"
                                                        >
                                                            {d.file}
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingDoc(d);
                                                            setDocFile(null);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteDocument(d._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Item edit modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <h3 className="text-lg font-bold">
                                {editing.item._id ? 'Edit Item' : 'Add Item'}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="p-5 space-y-4">
                            {editing.list === 'standards' && (
                                <>
                                    <div>
                                        <Label>Standard Code (e.g. ISO 14001)</Label>
                                        <Input
                                            value={editing.item.code || ''}
                                            onChange={(e) =>
                                                setEditing({ ...editing, item: { ...editing.item, code: e.target.value } })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Full Name</Label>
                                        <Input
                                            value={editing.item.name || ''}
                                            onChange={(e) =>
                                                setEditing({ ...editing, item: { ...editing.item, name: e.target.value } })
                                            }
                                            placeholder="Environmental Management System"
                                        />
                                    </div>
                                </>
                            )}
                            {editing.list !== 'standards' && (
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={editing.item.title || ''}
                                        onChange={(e) =>
                                            setEditing({ ...editing, item: { ...editing.item, title: e.target.value } })
                                        }
                                    />
                                </div>
                            )}

                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    rows={5}
                                    value={editing.item.description || ''}
                                    onChange={(e) =>
                                        setEditing({ ...editing, item: { ...editing.item, description: e.target.value } })
                                    }
                                />
                            </div>

                            {editing.list !== 'standards' && (
                                <div>
                                    <Label>Icon</Label>
                                    <select
                                        className="w-full border rounded-md h-10 px-3 bg-white"
                                        value={editing.item.icon || 'Leaf'}
                                        onChange={(e) =>
                                            setEditing({ ...editing, item: { ...editing.item, icon: e.target.value } })
                                        }
                                    >
                                        {ICON_CHOICES.map((ic) => (
                                            <option key={ic} value={ic}>
                                                {ic}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Pick any Lucide icon name from the list.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Display Order</Label>
                                    <Input
                                        type="number"
                                        value={editing.item.order ?? 0}
                                        onChange={(e) =>
                                            setEditing({
                                                ...editing,
                                                item: { ...editing.item, order: Number(e.target.value) },
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex items-end gap-3">
                                    <div>
                                        <Label>Active</Label>
                                        <div className="mt-2">
                                            <Switch
                                                checked={editing.item.isActive !== false}
                                                onCheckedChange={(v) =>
                                                    setEditing({
                                                        ...editing,
                                                        item: { ...editing.item, isActive: v },
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-5 border-t bg-slate-50 sticky bottom-0">
                            <Button variant="outline" onClick={() => setEditing(null)}>
                                Cancel
                            </Button>
                            <Button onClick={submitItem}>
                                <Save className="h-4 w-4 mr-2" /> Save Item
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document modal */}
            {editingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h3 className="text-lg font-bold">
                                {editingDoc._id ? 'Edit Document' : 'Upload Document'}
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setEditingDoc(null);
                                    setDocFile(null);
                                }}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <Label>Display Name</Label>
                                <Input
                                    value={editingDoc.name || ''}
                                    onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                                    placeholder="Sustainability Policy & Commitment"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    rows={2}
                                    value={editingDoc.description || ''}
                                    onChange={(e) =>
                                        setEditingDoc({ ...editingDoc, description: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label>PDF File {editingDoc._id && '(leave empty to keep current)'}</Label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 cursor-pointer border-2 border-dashed rounded-md px-4 py-6 text-center hover:bg-slate-50">
                                        <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                                        <span className="text-sm text-slate-600">
                                            {docFile ? docFile.name : 'Choose a PDF file'}
                                        </span>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                                {editingDoc.file && !docFile && (
                                    <p className="text-xs text-slate-500 mt-2">
                                        Current: <a href={editingDoc.file} target="_blank" rel="noreferrer" className="text-emerald-600 underline">{editingDoc.file}</a>
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-5 border-t bg-slate-50">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditingDoc(null);
                                    setDocFile(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={submitDocument}>
                                <Save className="h-4 w-4 mr-2" /> Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
