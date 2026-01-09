import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCMS } from '@/hooks/useCMS';
import { cmsAPI, pricingTablesAPI } from '@/services/api';
import { Save, ChevronDown, ChevronUp, Loader2, Plus, Trash2, PlusCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PricingTable {
    _id?: string;
    tableId?: string;
    title: string;
    description: string;
    headers: string[];
    data: Record<string, string>[];  // Array of objects like {units: "1", price: "$43.60"}
    scopeOfJob: string[];
    duration?: string;
    isActive?: boolean;
}

export default function PricingManagement() {
    const { data: cmsData, isLoading, refetch } = useCMS();
    const { toast } = useToast();
    const [pricingTables, setPricingTables] = useState<PricingTable[]>([]);
    const [additionalServices, setAdditionalServices] = useState<any>({
        condenserCleaning: { normal: '', dry: '', steam: '' },
        gasTopUp: { r22: '', r410a: '', r32: '' },
        troubleshooting: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [expandedTable, setExpandedTable] = useState<string | null>(null);
    const [showNewServiceForm, setShowNewServiceForm] = useState(false);
    const [newService, setNewService] = useState<Partial<PricingTable>>({
        title: '',
        description: '',
        headers: ['No. of Units', 'Price'],
        data: [],
        scopeOfJob: [],
        duration: ''
    });

    useEffect(() => {
        if (cmsData) {
            if (cmsData.pricingTables) {
                // Ensure each table has required arrays initialized
                const tablesWithDefaults = cmsData.pricingTables.map((table: any) => ({
                    ...table,
                    headers: table.headers || [],
                    data: table.data || [],
                    scopeOfJob: table.scopeOfJob || []
                }));
                setPricingTables(tablesWithDefaults);
            }
            if (cmsData.additionalServices) {
                setAdditionalServices(cmsData.additionalServices);
            }
        }
    }, [cmsData]);

    const handleCreateService = async () => {
        try {
            if (!newService.title?.trim()) {
                toast({ title: 'Error', description: 'Service title is required', variant: 'destructive' });
                return;
            }
            setIsSaving(true);
            await pricingTablesAPI.create(newService);
            refetch();
            setShowNewServiceForm(false);
            setNewService({
                title: '',
                description: '',
                headers: ['No. of Units', 'Price'],
                data: [],
                scopeOfJob: [],
                duration: ''
            });
            toast({ title: 'Success!', description: 'New service created successfully' });
        } catch (error: any) {
            toast({ title: 'Failed', description: error.message || 'Failed to create service', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteService = async (tableId: string, tableName: string) => {
        if (!confirm(`Are you sure you want to delete "${tableName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            setIsSaving(true);
            await pricingTablesAPI.delete(tableId);
            refetch();
            toast({ title: 'Deleted!', description: `${tableName} has been deleted` });
        } catch (error: any) {
            toast({ title: 'Failed', description: error.message || 'Failed to delete service', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePricingTable = async (tableIndex: number) => {
        try {
            setIsSaving(true);
            const table = pricingTables[tableIndex];
            const tableId = table._id || table.tableId;
            if (tableId) {
                await pricingTablesAPI.update(tableId, table);
            } else {
                await cmsAPI.updateSection('pricingTables', pricingTables);
            }
            refetch();
            toast({ title: 'Saved!', description: `${pricingTables[tableIndex].title} pricing saved successfully` });
        } catch (error: any) {
            toast({ title: 'Save Failed', description: error.message || 'Failed to save pricing table', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAdditionalServices = async () => {
        try {
            setIsSaving(true);
            await cmsAPI.updateSection('additionalServices', additionalServices);
            refetch();
            toast({ title: 'Saved!', description: 'Additional services saved successfully' });
        } catch (error: any) {
            toast({ title: 'Save Failed', description: error.message || 'Failed to save additional services', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const updateTableRow = (tableIndex: number, rowIndex: number, key: string, value: string) => {
        const newTables = [...pricingTables];
        if (!newTables[tableIndex].data[rowIndex]) {
            newTables[tableIndex].data[rowIndex] = {};
        }
        newTables[tableIndex].data[rowIndex][key] = value;
        setPricingTables(newTables);
    };

    const updateTableField = (tableIndex: number, field: keyof PricingTable, value: any) => {
        const newTables = [...pricingTables];
        (newTables[tableIndex] as any)[field] = value;
        setPricingTables(newTables);
    };

    const addTableRow = (tableIndex: number) => {
        const newTables = [...pricingTables];
        const headers = newTables[tableIndex].headers;
        const newRow: Record<string, string> = {};
        headers.forEach((header, idx) => {
            const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            newRow[key || `col_${idx}`] = '';
        });
        newTables[tableIndex].data.push(newRow);
        setPricingTables(newTables);
    };

    const removeTableRow = (tableIndex: number, rowIndex: number) => {
        const newTables = [...pricingTables];
        newTables[tableIndex].data.splice(rowIndex, 1);
        setPricingTables(newTables);
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-gray-600">Loading pricing data...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl">
                <h1 className="text-3xl font-bold mb-2">Pricing Management</h1>
                <p className="text-gray-600 mb-8">Manage pricing tables and service costs</p>

                {/* Pricing Tables */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Service Pricing Tables</h2>
                        <Button onClick={() => setShowNewServiceForm(!showNewServiceForm)} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Service
                        </Button>
                    </div>

                    {/* New Service Form */}
                    {showNewServiceForm && (
                        <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-lg">Create New Service</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Service Title *</Label>
                                        <Input
                                            value={newService.title || ''}
                                            onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                                            placeholder="e.g., Chemical Wash"
                                        />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Input
                                            value={newService.description || ''}
                                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                            placeholder="Brief description"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Duration</Label>
                                    <Input
                                        value={newService.duration || ''}
                                        onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                        placeholder="e.g., 30-45 min per unit"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateService} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                        Create Service
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowNewServiceForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {pricingTables.map((table, tableIndex) => (
                        <Card key={table._id || tableIndex} className="overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                                <button
                                    onClick={() => setExpandedTable(expandedTable === (table._id || String(tableIndex)) ? null : (table._id || String(tableIndex)))}
                                    className="flex-1 text-left flex items-center gap-4"
                                >
                                    <div>
                                        <h3 className="font-semibold text-lg">{table.title}</h3>
                                        <p className="text-sm text-gray-500">{table.description}</p>
                                    </div>
                                </button>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteService(table._id || table.tableId || '', table.title)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <button onClick={() => setExpandedTable(expandedTable === (table._id || String(tableIndex)) ? null : (table._id || String(tableIndex)))}>
                                        {expandedTable === (table._id || String(tableIndex)) ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {expandedTable === (table._id || String(tableIndex)) && (
                                <CardContent className="border-t pt-6">
                                    {/* Table Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <Label>Table Title</Label>
                                            <Input
                                                value={table.title}
                                                onChange={(e) => updateTableField(tableIndex, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Input
                                                value={table.description}
                                                onChange={(e) => updateTableField(tableIndex, 'description', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Pricing Data Table */}
                                    <div className="overflow-x-auto mb-4">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    {(table.headers || []).map((header, idx) => (
                                                        <th key={idx} className="border p-2 text-left font-medium">{header}</th>
                                                    ))}
                                                    <th className="border p-2 text-center font-medium w-16">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(table.data || []).map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {Object.entries(row || {}).map(([key, value], cellIndex) => (
                                                            <td key={cellIndex} className="border p-1">
                                                                <Input
                                                                    value={value || ''}
                                                                    onChange={(e) => updateTableRow(tableIndex, rowIndex, key, e.target.value)}
                                                                    className="h-8 text-sm"
                                                                />
                                                            </td>
                                                        ))}
                                                        <td className="border p-1 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                                onClick={() => removeTableRow(tableIndex, rowIndex)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Add Row Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mb-6"
                                        onClick={() => addTableRow(tableIndex)}
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Add Row
                                    </Button>

                                    {/* Duration */}
                                    <div className="mb-4">
                                        <Label>Duration Note</Label>
                                        <Input
                                            value={table.duration || ''}
                                            onChange={(e) => updateTableField(tableIndex, 'duration', e.target.value)}
                                            placeholder="e.g., 15–20 min per unit"
                                        />
                                    </div>

                                    {/* Scope of Job */}
                                    <div className="mb-4">
                                        <Label>Scope of Job (one item per line)</Label>
                                        <Textarea
                                            value={table.scopeOfJob?.join('\n') || ''}
                                            onChange={(e) => updateTableField(tableIndex, 'scopeOfJob', e.target.value.split('\n').filter(s => s.trim()))}
                                            rows={4}
                                            placeholder="Enter scope items, one per line"
                                        />
                                    </div>

                                    <Button onClick={() => handleSavePricingTable(tableIndex)} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save {table.title}
                                    </Button>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Additional Services */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Additional Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Condenser Cleaning */}
                        <div>
                            <h3 className="font-semibold mb-3">Condenser Cleaning</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Normal Chemical</Label>
                                    <Input
                                        value={additionalServices.condenserCleaning?.normal || ''}
                                        onChange={(e) => setAdditionalServices({
                                            ...additionalServices,
                                            condenserCleaning: {
                                                ...additionalServices.condenserCleaning,
                                                normal: e.target.value
                                            }
                                        })}
                                        placeholder="$54.50"
                                    />
                                </div>
                                <div>
                                    <Label>Dry</Label>
                                    <Input
                                        value={additionalServices.condenserCleaning?.dry || ''}
                                        onChange={(e) => setAdditionalServices({
                                            ...additionalServices,
                                            condenserCleaning: {
                                                ...additionalServices.condenserCleaning,
                                                dry: e.target.value
                                            }
                                        })}
                                        placeholder="$87.20–$130.80"
                                    />
                                </div>
                                <div>
                                    <Label>Steam</Label>
                                    <Input
                                        value={additionalServices.condenserCleaning?.steam || ''}
                                        onChange={(e) => setAdditionalServices({
                                            ...additionalServices,
                                            condenserCleaning: {
                                                ...additionalServices.condenserCleaning,
                                                steam: e.target.value
                                            }
                                        })}
                                        placeholder="$87.20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Gas Top-Up */}
                        <div>
                            <h3 className="font-semibold mb-3">Gas Top-Up</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>R22</Label>
                                    <Input
                                        value={additionalServices.gasTopUp?.r22 || ''}
                                        onChange={(e) => setAdditionalServices({
                                            ...additionalServices,
                                            gasTopUp: {
                                                ...additionalServices.gasTopUp,
                                                r22: e.target.value
                                            }
                                        })}
                                        placeholder="$43.60–$130.80"
                                    />
                                </div>
                                <div>
                                    <Label>R410A</Label>
                                    <Input
                                        value={additionalServices.gasTopUp?.r410a || ''}
                                        onChange={(e) => setAdditionalServices({
                                            ...additionalServices,
                                            gasTopUp: {
                                                ...additionalServices.gasTopUp,
                                                r410a: e.target.value
                                            }
                                        })}
                                        placeholder="$65.40–$163.50"
                                    />
                                </div>
                                <div>
                                    <Label>R32</Label>
                                    <Input
                                        value={additionalServices.gasTopUp?.r32 || ''}
                                        onChange={(e) => setAdditionalServices({
                                            ...additionalServices,
                                            gasTopUp: {
                                                ...additionalServices.gasTopUp,
                                                r32: e.target.value
                                            }
                                        })}
                                        placeholder="$87.20–$218.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Troubleshooting */}
                        <div>
                            <h3 className="font-semibold mb-3">Repair / Troubleshooting</h3>
                            <Label>Troubleshooting Charge</Label>
                            <Input
                                value={additionalServices.troubleshooting || ''}
                                onChange={(e) => setAdditionalServices({
                                    ...additionalServices,
                                    troubleshooting: e.target.value
                                })}
                                placeholder="$54.50"
                            />
                        </div>

                        <Button onClick={handleSaveAdditionalServices} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Additional Services
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
