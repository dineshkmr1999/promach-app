import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PromachLoader from '@/components/PromachLoader';
import {
    Package, MapPin, ArrowLeftRight, Briefcase, Wrench, Plus, Search, RefreshCw,
    Warehouse, Truck, Building2, AlertTriangle, TrendingDown, CheckCircle2, Clock,
    ChevronRight, Send, Download, Eye, Trash2, Edit, Users, ShoppingCart,
    FileText, BarChart3, ClipboardCheck, DollarSign, Loader2, Upload, FileSpreadsheet,
    X, ChevronDown, ChevronUp, Hash, Calendar, TrendingUp, Activity
} from 'lucide-react';
import { itemsAPI, locationsAPI, inventoryAPI, jobTicketsAPI, assetsAPI, erpAuthAPI, purchaseOrdersAPI } from '@/services/erpApi';
import { useToast } from '@/hooks/use-toast';

// ── Types ──
interface MasterItem {
    _id: string; sku: string; name: string; description?: string;
    itemType: 'Consumable' | 'Asset' | 'Kit'; category?: string; uom: string;
    unitCost: number; sellingPrice: number; reorderLevel: number;
    minStockLevel?: number; maxStockLevel?: number;
    assetTag?: string; assetStatus?: string; brand?: string; isActive: boolean;
    barcode?: string; trackBatch?: boolean; trackExpiry?: boolean;
    supplier?: { name?: string; code?: string; leadTimeDays?: number; lastPurchasePrice?: number };
    currentHolder?: { _id: string; name: string };
    currentLocation?: { _id: string; name: string; locationType: string };
    kitComponents?: { item: { _id: string; name: string; sku: string; uom: string }; quantity: number }[];
    createdAt?: string; updatedAt?: string;
}
interface Location {
    _id: string; name: string; locationType: 'Warehouse' | 'Van' | 'Site';
    address?: string; vehicleNumber?: string; isActive: boolean;
    assignedTechnicians?: { _id: string; name: string }[];
    parent?: { _id: string; name: string };
}
interface LedgerRow {
    _id: string;
    item: { _id: string; name: string; sku: string; uom: string; unitCost: number; sellingPrice: number; reorderLevel: number; itemType: string };
    location: { _id: string; name: string; locationType: string };
    quantityOnHand: number;
}
interface StockTransfer {
    _id: string; transferNumber: string; status: string;
    fromLocation: { _id: string; name: string; locationType: string };
    toLocation: { _id: string; name: string; locationType: string };
    items: { item: { _id: string; name: string; sku: string; uom: string }; quantity: number }[];
    createdBy?: { _id: string; name: string }; receivedBy?: { _id: string; name: string };
    createdAt: string; receivedAt?: string; notes?: string;
}
interface JobTicket {
    _id: string; ticketNumber: string; jobType: string; status: string; priority: string;
    customer: { name: string; phone?: string; email?: string };
    siteAddress?: { street?: string; postalCode?: string; unit?: string };
    scheduledDate: string; quotedPrice: number; totalMaterialCost: number; grossProfit: number;
    assignedTechnicians?: { _id: string; name: string; phone?: string }[];
    createdBy?: { _id: string; name: string };
    costLines?: any[];
}
interface AssetItem extends MasterItem {}
interface LowStockItem {
    item: string; sku: string; uom: string; location: string; locationType: string;
    quantityOnHand: number; reorderLevel: number;
}
interface PurchaseOrder {
    _id: string; poNumber: string; status: string;
    supplier: { name: string; code?: string; contactPerson?: string; phone?: string; email?: string };
    lines: { _id: string; item: { _id: string; name: string; sku: string; uom: string }; quantity: number; unitCost: number; receivedQuantity: number }[];
    deliverTo: { _id: string; name: string; locationType: string };
    expectedDeliveryDate?: string; totalAmount: number; notes?: string;
    relatedJobTicket?: { _id: string; ticketNumber: string };
    createdBy?: { _id: string; name: string }; approvedBy?: { _id: string; name: string };
    createdAt: string; approvedAt?: string;
}
interface ValuationRow {
    item: string; sku: string; uom: string; location: string; locationType: string;
    quantityOnHand: number; unitCost: number; totalValue: number;
}

// ── Helper: Status badge color ──
function statusBadge(status: string) {
    const map: Record<string, string> = {
        Pending: 'bg-yellow-100 text-yellow-800',
        In_Transit: 'bg-blue-100 text-blue-800',
        Received: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
        Submitted: 'bg-blue-100 text-blue-800',
        Approved: 'bg-emerald-100 text-emerald-800',
        Partially_Received: 'bg-amber-100 text-amber-800',
        Draft: 'bg-slate-100 text-slate-600',
        Scheduled: 'bg-blue-100 text-blue-800',
        In_Progress: 'bg-amber-100 text-amber-800',
        On_Hold: 'bg-orange-100 text-orange-800',
        Completed: 'bg-green-100 text-green-800',
        Invoiced: 'bg-purple-100 text-purple-800',
        available: 'bg-green-100 text-green-800',
        in_use: 'bg-blue-100 text-blue-800',
        maintenance: 'bg-orange-100 text-orange-800',
        retired: 'bg-slate-100 text-slate-600',
    };
    return <Badge className={`${map[status] || 'bg-slate-100 text-slate-600'} border-0 font-medium`}>{status.replace(/_/g, ' ')}</Badge>;
}

export default function InventoryManagement() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('items');
    const [isLoading, setIsLoading] = useState(false);

    // ── Items state ──
    const [items, setItems] = useState<MasterItem[]>([]);
    const [itemsTotal, setItemsTotal] = useState(0);
    const [itemSearch, setItemSearch] = useState('');
    const [itemTypeFilter, setItemTypeFilter] = useState('');
    const [showItemDialog, setShowItemDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
    const [itemForm, setItemForm] = useState({ sku: '', name: '', description: '', itemType: 'Consumable', category: '', uom: 'Units', unitCost: '0', sellingPrice: '0', reorderLevel: '0', assetTag: '', brand: '', barcode: '', supplierName: '', supplierCode: '', supplierLeadTime: '', minStockLevel: '0', maxStockLevel: '0', trackBatch: false, trackExpiry: false });

    // ── Locations state ──
    const [locations, setLocations] = useState<Location[]>([]);
    const [showLocationDialog, setShowLocationDialog] = useState(false);
    const [locationForm, setLocationForm] = useState({ name: '', locationType: 'Warehouse', address: '', vehicleNumber: '' });
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [locationStock, setLocationStock] = useState<LedgerRow[]>([]);
    const [loadingStock, setLoadingStock] = useState(false);

    // ── Transfers state ──
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [transferForm, setTransferForm] = useState({ fromLocationId: '', toLocationId: '', notes: '', items: [{ itemId: '', quantity: '' }] });

    // ── Jobs state ──
    const [jobs, setJobs] = useState<JobTicket[]>([]);
    const [jobsTotal, setJobsTotal] = useState(0);
    const [jobStatusFilter, setJobStatusFilter] = useState('');
    const [showJobDialog, setShowJobDialog] = useState(false);
    const [jobForm, setJobForm] = useState({ jobType: 'Aircon_Service', customerName: '', customerPhone: '', customerEmail: '', street: '', postalCode: '', unit: '', scheduledDate: '', scheduledTimeSlot: '', quotedPrice: '0', priority: 'Normal', internalNotes: '' });

    // ── Assets state ──
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [assetStatusFilter, setAssetStatusFilter] = useState('');

    // ── Low stock ──
    const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

    // ── Purchase Orders ──
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [showPODialog, setShowPODialog] = useState(false);
    const [poForm, setPOForm] = useState({ supplierName: '', supplierCode: '', deliverTo: '', expectedDeliveryDate: '', notes: '', lines: [{ itemId: '', quantity: '', unitCost: '' }] });

    // ── Reports / Valuation ──
    const [valuation, setValuation] = useState<ValuationRow[]>([]);
    const [valuationTotal, setValuationTotal] = useState(0);
    const [loadingReport, setLoadingReport] = useState(false);

    // ── Excel Import ──
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);

    // ── PO Detail View ──
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    // ── Quick Item Create (inline in PO form) ──
    const [showQuickItemDialog, setShowQuickItemDialog] = useState(false);
    const [quickItemForm, setQuickItemForm] = useState({ sku: '', name: '', itemType: 'Consumable', uom: 'Units', unitCost: '0', category: '' });
    const [creatingQuickItem, setCreatingQuickItem] = useState(false);

    // ── Item Detail View ──
    const [selectedItem, setSelectedItem] = useState<MasterItem | null>(null);

    // ── Data loaders ──
    const loadItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string> = {};
            if (itemSearch) params.search = itemSearch;
            if (itemTypeFilter) params.itemType = itemTypeFilter;
            const data = await itemsAPI.list(params);
            setItems(data.items); setItemsTotal(data.total);
        } catch { toast({ title: 'Error', description: 'Failed to load items', variant: 'destructive' }); }
        finally { setIsLoading(false); }
    }, [itemSearch, itemTypeFilter, toast]);

    const loadLocations = useCallback(async () => {
        try { const data = await locationsAPI.list(); setLocations(data); }
        catch { toast({ title: 'Error', description: 'Failed to load locations', variant: 'destructive' }); }
    }, [toast]);

    const loadTransfers = useCallback(async () => {
        try { const data = await inventoryAPI.listTransfers(); setTransfers(data.transfers); }
        catch { toast({ title: 'Error', description: 'Failed to load transfers', variant: 'destructive' }); }
    }, [toast]);

    const loadJobs = useCallback(async () => {
        try {
            const params: Record<string, string> = {};
            if (jobStatusFilter) params.status = jobStatusFilter;
            const data = await jobTicketsAPI.list(params);
            setJobs(data.tickets); setJobsTotal(data.total);
        } catch { toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' }); }
    }, [jobStatusFilter, toast]);

    const loadAssets = useCallback(async () => {
        try {
            const params: Record<string, string> = {};
            if (assetStatusFilter) params.assetStatus = assetStatusFilter;
            const data = await assetsAPI.list(params);
            setAssets(data.assets);
        } catch { toast({ title: 'Error', description: 'Failed to load assets', variant: 'destructive' }); }
    }, [assetStatusFilter, toast]);

    const loadLowStock = useCallback(async () => {
        try { const data = await inventoryAPI.lowStock(); setLowStock(data); }
        catch { /* Silently fail — user may not have access */ }
    }, []);

    const loadPurchaseOrders = useCallback(async () => {
        try { const data = await purchaseOrdersAPI.list(); setPurchaseOrders(data.orders); }
        catch { toast({ title: 'Error', description: 'Failed to load purchase orders', variant: 'destructive' }); }
    }, [toast]);

    const loadValuation = useCallback(async () => {
        setLoadingReport(true);
        try { const data = await inventoryAPI.valuation(); setValuation(data.valuation); setValuationTotal(data.grandTotal); }
        catch { /* non-critical */ }
        finally { setLoadingReport(false); }
    }, []);

    // Load data on tab change
    useEffect(() => {
        if (activeTab === 'items') loadItems();
        if (activeTab === 'locations') loadLocations();
        if (activeTab === 'transfers') { loadTransfers(); loadLocations(); }
        if (activeTab === 'jobs') loadJobs();
        if (activeTab === 'assets') loadAssets();
        if (activeTab === 'purchase-orders') { loadPurchaseOrders(); loadLocations(); loadItems(); }
        if (activeTab === 'reports') loadValuation();
    }, [activeTab, loadItems, loadLocations, loadTransfers, loadJobs, loadAssets, loadPurchaseOrders, loadValuation]);

    // Load low stock on mount
    useEffect(() => { loadLowStock(); }, [loadLowStock]);

    // Load stock when a location is selected
    useEffect(() => {
        if (!selectedLocationId) { setLocationStock([]); return; }
        setLoadingStock(true);
        locationsAPI.getStock(selectedLocationId).then(setLocationStock).catch(() => {}).finally(() => setLoadingStock(false));
    }, [selectedLocationId]);

    // ── Item CRUD handlers ──
    const openNewItem = () => {
        setEditingItem(null);
        setItemForm({ sku: '', name: '', description: '', itemType: 'Consumable', category: '', uom: 'Units', unitCost: '0', sellingPrice: '0', reorderLevel: '0', assetTag: '', brand: '', barcode: '', supplierName: '', supplierCode: '', supplierLeadTime: '', minStockLevel: '0', maxStockLevel: '0', trackBatch: false, trackExpiry: false });
        setShowItemDialog(true);
    };
    const openEditItem = (item: MasterItem) => {
        setEditingItem(item);
        setItemForm({
            sku: item.sku, name: item.name, description: item.description || '',
            itemType: item.itemType, category: item.category || '', uom: item.uom,
            unitCost: String(item.unitCost), sellingPrice: String(item.sellingPrice),
            reorderLevel: String(item.reorderLevel), assetTag: item.assetTag || '', brand: item.brand || '',
            barcode: item.barcode || '', supplierName: item.supplier?.name || '', supplierCode: item.supplier?.code || '',
            supplierLeadTime: String(item.supplier?.leadTimeDays || ''), minStockLevel: String(item.minStockLevel || 0),
            maxStockLevel: String(item.maxStockLevel || 0), trackBatch: item.trackBatch || false, trackExpiry: item.trackExpiry || false
        });
        setShowItemDialog(true);
    };
    const handleSaveItem = async () => {
        try {
            const { supplierName, supplierCode, supplierLeadTime, minStockLevel, maxStockLevel, ...rest } = itemForm;
            const payload = { ...rest, unitCost: parseFloat(itemForm.unitCost) || 0, sellingPrice: parseFloat(itemForm.sellingPrice) || 0, reorderLevel: parseFloat(itemForm.reorderLevel) || 0, minStockLevel: parseFloat(minStockLevel) || 0, maxStockLevel: parseFloat(maxStockLevel) || 0, supplier: { name: supplierName, code: supplierCode, leadTimeDays: parseInt(supplierLeadTime) || 0 } };
            if (editingItem) { await itemsAPI.update(editingItem._id, payload); toast({ title: 'Item updated' }); }
            else { await itemsAPI.create(payload); toast({ title: 'Item created' }); }
            setShowItemDialog(false); loadItems();
        } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };
    const handleDeleteItem = async (id: string) => {
        try { await itemsAPI.remove(id); toast({ title: 'Item deactivated' }); loadItems(); }
        catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };

    // ── Location CRUD handlers ──
    const handleSaveLocation = async () => {
        try {
            await locationsAPI.create(locationForm); toast({ title: 'Location created' });
            setShowLocationDialog(false); loadLocations();
        } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };

    // ── Transfer handlers ──
    const handleCreateTransfer = async () => {
        try {
            const payload = {
                fromLocationId: transferForm.fromLocationId,
                toLocationId: transferForm.toLocationId,
                notes: transferForm.notes,
                items: transferForm.items.filter(i => i.itemId && i.quantity).map(i => ({ itemId: i.itemId, quantity: parseFloat(i.quantity) }))
            };
            await inventoryAPI.createTransfer(payload);
            toast({ title: 'Transfer created' }); setShowTransferDialog(false); loadTransfers();
        } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };
    const handleDispatch = async (id: string) => {
        try { await inventoryAPI.dispatchTransfer(id); toast({ title: 'Transfer dispatched' }); loadTransfers(); }
        catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };
    const handleReceive = async (id: string) => {
        try { await inventoryAPI.receiveTransfer(id); toast({ title: 'Transfer received' }); loadTransfers(); }
        catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };

    // ── Job ticket handlers ──
    const handleCreateJob = async () => {
        try {
            const payload = {
                jobType: jobForm.jobType,
                customer: { name: jobForm.customerName, phone: jobForm.customerPhone, email: jobForm.customerEmail },
                siteAddress: { street: jobForm.street, postalCode: jobForm.postalCode, unit: jobForm.unit },
                scheduledDate: jobForm.scheduledDate, scheduledTimeSlot: jobForm.scheduledTimeSlot,
                quotedPrice: parseFloat(jobForm.quotedPrice) || 0, priority: jobForm.priority,
                internalNotes: jobForm.internalNotes
            };
            await jobTicketsAPI.create(payload); toast({ title: 'Job ticket created' });
            setShowJobDialog(false); loadJobs();
        } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };

    // ── Asset handlers ──
    const handleCheckout = async (id: string) => {
        try { await assetsAPI.checkout(id, {}); toast({ title: 'Asset checked out' }); loadAssets(); }
        catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };
    const handleCheckin = async (id: string) => {
        try { await assetsAPI.checkin(id, { condition: 'good' }); toast({ title: 'Asset checked in' }); loadAssets(); }
        catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };

    // ── PO handlers ──
    const handleCreatePO = async () => {
        try {
            const payload = {
                supplier: { name: poForm.supplierName, code: poForm.supplierCode },
                deliverTo: poForm.deliverTo,
                expectedDeliveryDate: poForm.expectedDeliveryDate || undefined,
                notes: poForm.notes,
                lines: poForm.lines.filter(l => l.itemId && l.quantity).map(l => ({
                    itemId: l.itemId, quantity: parseFloat(l.quantity), unitCost: parseFloat(l.unitCost) || 0
                }))
            };
            await purchaseOrdersAPI.create(payload);
            toast({ title: 'Purchase order created' }); setShowPODialog(false); loadPurchaseOrders();
        } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };
    const handleApprovePO = async (id: string) => {
        try { await purchaseOrdersAPI.approve(id); toast({ title: 'PO approved' }); loadPurchaseOrders(); }
        catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };
    const handleReceivePO = async (po: PurchaseOrder) => {
        try {
            const receivedLines = po.lines
                .filter(l => l.receivedQuantity < l.quantity)
                .map(l => ({ lineId: l._id, quantity: l.quantity - l.receivedQuantity }));
            await purchaseOrdersAPI.receive(po._id, receivedLines);
            toast({ title: 'PO goods received into inventory' }); loadPurchaseOrders();
        } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };
    const handleCancelPO = async (id: string) => {
        try { await purchaseOrdersAPI.cancel(id); toast({ title: 'PO cancelled' }); loadPurchaseOrders(); }
        catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };

    // ── Excel import/export handlers ──
    const handleDownloadTemplate = async () => {
        try {
            const blob = await itemsAPI.downloadTemplate();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'promach-items-template.xlsx'; a.click();
            URL.revokeObjectURL(url);
            toast({ title: 'Template downloaded' });
        } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    };
    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        try {
            const result = await itemsAPI.importExcel(file);
            toast({ title: 'Import Complete', description: `${result.created} items created, ${result.skipped} skipped` });
            if (result.errors?.length > 0) {
                console.warn('Import errors:', result.errors);
            }
            loadItems();
        } catch (err: any) { toast({ title: 'Import Error', description: err.message, variant: 'destructive' }); }
        finally { setImporting(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    // ── Quick Item create (from PO form) ──
    const handleQuickItemCreate = async () => {
        setCreatingQuickItem(true);
        try {
            const payload = { ...quickItemForm, unitCost: parseFloat(quickItemForm.unitCost) || 0 };
            const created = await itemsAPI.create(payload);
            toast({ title: `Item "${created.name}" created` });
            setShowQuickItemDialog(false);
            await loadItems(); // Refresh items list so it appears in dropdowns
        } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
        finally { setCreatingQuickItem(false); }
    };

    const locationIcon = (type: string) => {
        if (type === 'Warehouse') return <Warehouse size={16} className="text-blue-600" />;
        if (type === 'Van') return <Truck size={16} className="text-amber-600" />;
        return <Building2 size={16} className="text-violet-600" />;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
                        <p className="text-slate-500 mt-1">Manage products, stock, transfers, jobs &amp; assets</p>
                    </div>

                    {/* Low stock alert */}
                    {lowStock.length > 0 && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                            <AlertTriangle size={18} className="text-amber-600" />
                            <span className="text-sm font-medium text-amber-800">{lowStock.length} item(s) below reorder level</span>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Master Items', value: itemsTotal, icon: Package, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Locations', value: locations.length, icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Open Transfers', value: transfers.filter(t => t.status !== 'Received' && t.status !== 'Cancelled').length, icon: ArrowLeftRight, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Active Jobs', value: jobs.filter(j => !['Completed', 'Invoiced', 'Cancelled'].includes(j.status)).length, icon: Briefcase, color: 'text-violet-600 bg-violet-50' },
                        { label: 'Low Stock', value: lowStock.length, icon: TrendingDown, color: lowStock.length > 0 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50' },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <Card key={s.label} className="border-0 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                                        <p className="text-xs text-slate-500">{s.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-slate-100 p-1 rounded-xl flex-wrap">
                        <TabsTrigger value="items" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm"><Package size={16} /> Items</TabsTrigger>
                        <TabsTrigger value="locations" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm"><MapPin size={16} /> Locations</TabsTrigger>
                        <TabsTrigger value="transfers" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm"><ArrowLeftRight size={16} /> Transfers</TabsTrigger>
                        <TabsTrigger value="purchase-orders" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm"><ShoppingCart size={16} /> Purchase Orders</TabsTrigger>
                        <TabsTrigger value="jobs" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm"><Briefcase size={16} /> Jobs</TabsTrigger>
                        <TabsTrigger value="assets" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm"><Wrench size={16} /> Assets</TabsTrigger>
                        <TabsTrigger value="reports" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm"><BarChart3 size={16} /> Reports</TabsTrigger>
                    </TabsList>

                    {/* ═══════════════════ ITEMS TAB ═══════════════════ */}
                    <TabsContent value="items" className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input placeholder="Search by name or SKU…" value={itemSearch} onChange={e => setItemSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadItems()} className="pl-9" />
                            </div>
                            <Select value={itemTypeFilter} onValueChange={v => { setItemTypeFilter(v === 'all' ? '' : v); }}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Types" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Consumable">Consumable</SelectItem>
                                    <SelectItem value="Asset">Asset / Tool</SelectItem>
                                    <SelectItem value="Kit">Kit / Bundle</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={loadItems} variant="outline" size="icon"><RefreshCw size={16} /></Button>
                            <Button onClick={openNewItem} className="gap-1.5"><Plus size={16} /> Add Item</Button>
                        </div>

                        {/* Excel Import/Export Bar */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-3 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <FileSpreadsheet size={16} className="text-green-600" />
                                    <span className="font-medium">Bulk Operations:</span>
                                </div>
                                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleDownloadTemplate}>
                                    <Download size={14} /> Download Template
                                </Button>
                                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
                                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                                    {importing ? <><Loader2 size={14} className="animate-spin" /> Importing…</> : <><Upload size={14} /> Import Excel</>}
                                </Button>
                                <span className="text-[11px] text-slate-400 ml-auto">Max 500 rows · .xlsx format</span>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm overflow-hidden">
                            {isLoading ? <div className="p-8"><PromachLoader variant="inline" /></div> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">SKU</TableHead>
                                            <TableHead className="font-semibold">Name</TableHead>
                                            <TableHead className="font-semibold">Type</TableHead>
                                            <TableHead className="font-semibold">Category</TableHead>
                                            <TableHead className="font-semibold">UoM</TableHead>
                                            <TableHead className="font-semibold text-right">Cost (SGD)</TableHead>
                                            <TableHead className="font-semibold text-right">Sell (SGD)</TableHead>
                                            <TableHead className="font-semibold text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.length === 0 ? (
                                            <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-10">No items found. Click &quot;Add Item&quot; to create one.</TableCell></TableRow>
                                        ) : items.map(item => (
                                            <TableRow key={item._id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedItem(item)}>
                                                <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{statusBadge(item.itemType)}</TableCell>
                                                <TableCell className="text-slate-500 text-sm">{item.category || '—'}</TableCell>
                                                <TableCell className="text-slate-600">{item.uom}</TableCell>
                                                <TableCell className="text-right font-mono">{item.unitCost.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-mono">{item.sellingPrice.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-1" onClick={e => e.stopPropagation()}>
                                                        <Button size="sm" variant="ghost" onClick={() => setSelectedItem(item)}><Eye size={14} /></Button>
                                                        <Button size="sm" variant="ghost" onClick={() => openEditItem(item)}><Edit size={14} /></Button>
                                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteItem(item._id)}><Trash2 size={14} /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </Card>
                    </TabsContent>

                    {/* ═══════════════════ LOCATIONS TAB ═══════════════════ */}
                    <TabsContent value="locations" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-slate-500">{locations.length} location(s)</p>
                            <Button onClick={() => { setLocationForm({ name: '', locationType: 'Warehouse', address: '', vehicleNumber: '' }); setShowLocationDialog(true); }} className="gap-1.5"><Plus size={16} /> Add Location</Button>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Location List */}
                            <div className="lg:col-span-1 space-y-2">
                                {locations.length === 0 ? (
                                    <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center text-slate-400">No locations yet</CardContent></Card>
                                ) : locations.map(loc => (
                                    <button
                                        key={loc._id}
                                        onClick={() => setSelectedLocationId(loc._id === selectedLocationId ? null : loc._id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedLocationId === loc._id ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {locationIcon(loc.locationType)}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 truncate">{loc.name}</p>
                                                <p className="text-xs text-slate-500">{loc.locationType}{loc.vehicleNumber ? ` · ${loc.vehicleNumber}` : ''}</p>
                                            </div>
                                            <ChevronRight size={16} className={`text-slate-400 transition-transform ${selectedLocationId === loc._id ? 'rotate-90' : ''}`} />
                                        </div>
                                        {loc.assignedTechnicians && loc.assignedTechnicians.length > 0 && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                                <Users size={12} />
                                                {loc.assignedTechnicians.map(t => t.name).join(', ')}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Stock at selected location */}
                            <div className="lg:col-span-2">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">
                                            {selectedLocationId ? `Stock at ${locations.find(l => l._id === selectedLocationId)?.name || '…'}` : 'Select a location to view stock'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {!selectedLocationId ? (
                                            <p className="text-slate-400 text-sm py-4 text-center">Click a location on the left to view its inventory</p>
                                        ) : loadingStock ? (
                                            <PromachLoader variant="inline" />
                                        ) : locationStock.length === 0 ? (
                                            <p className="text-slate-400 text-sm py-4 text-center">No stock at this location</p>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50">
                                                        <TableHead className="font-semibold">Item</TableHead>
                                                        <TableHead className="font-semibold">SKU</TableHead>
                                                        <TableHead className="font-semibold text-right">Qty</TableHead>
                                                        <TableHead className="font-semibold">UoM</TableHead>
                                                        <TableHead className="font-semibold text-center">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {locationStock.map(row => {
                                                        const belowReorder = row.item.reorderLevel > 0 && row.quantityOnHand <= row.item.reorderLevel;
                                                        return (
                                                            <TableRow key={row._id} className={belowReorder ? 'bg-red-50' : ''}>
                                                                <TableCell className="font-medium">{row.item.name}</TableCell>
                                                                <TableCell className="font-mono text-xs">{row.item.sku}</TableCell>
                                                                <TableCell className="text-right font-mono font-bold">{row.quantityOnHand}</TableCell>
                                                                <TableCell className="text-slate-600">{row.item.uom}</TableCell>
                                                                <TableCell className="text-center">
                                                                    {belowReorder ? <Badge className="bg-red-100 text-red-800 border-0">Low</Badge> : <Badge className="bg-green-100 text-green-800 border-0">OK</Badge>}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ═══════════════════ TRANSFERS TAB ═══════════════════ */}
                    <TabsContent value="transfers" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-slate-500">{transfers.length} transfer(s)</p>
                            <Button onClick={() => { setTransferForm({ fromLocationId: '', toLocationId: '', notes: '', items: [{ itemId: '', quantity: '' }] }); setShowTransferDialog(true); }} className="gap-1.5"><Plus size={16} /> New Transfer</Button>
                        </div>

                        <Card className="border-0 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Transfer #</TableHead>
                                        <TableHead className="font-semibold">From</TableHead>
                                        <TableHead className="font-semibold">To</TableHead>
                                        <TableHead className="font-semibold">Items</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfers.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-10">No transfers yet</TableCell></TableRow>
                                    ) : transfers.map(t => (
                                        <TableRow key={t._id} className="hover:bg-slate-50">
                                            <TableCell className="font-mono text-sm font-medium">{t.transferNumber}</TableCell>
                                            <TableCell><div className="flex items-center gap-1.5">{locationIcon(t.fromLocation.locationType)}<span className="text-sm">{t.fromLocation.name}</span></div></TableCell>
                                            <TableCell><div className="flex items-center gap-1.5">{locationIcon(t.toLocation.locationType)}<span className="text-sm">{t.toLocation.name}</span></div></TableCell>
                                            <TableCell className="text-sm">{t.items.length} item(s)</TableCell>
                                            <TableCell>{statusBadge(t.status)}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-1.5">
                                                    {t.status === 'Pending' && (
                                                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleDispatch(t._id)}><Send size={12} /> Dispatch</Button>
                                                    )}
                                                    {t.status === 'In_Transit' && (
                                                        <Button size="sm" className="gap-1 text-xs" onClick={() => handleReceive(t._id)}><Download size={12} /> Receive</Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* ═══════════════════ JOBS TAB ═══════════════════ */}
                    <TabsContent value="jobs" className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                            <Select value={jobStatusFilter} onValueChange={v => setJobStatusFilter(v === 'all' ? '' : v)}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {['Draft', 'Scheduled', 'In_Progress', 'On_Hold', 'Completed', 'Invoiced', 'Cancelled'].map(s => (
                                        <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={loadJobs} size="icon"><RefreshCw size={16} /></Button>
                                <Button onClick={() => { setJobForm({ jobType: 'Aircon_Service', customerName: '', customerPhone: '', customerEmail: '', street: '', postalCode: '', unit: '', scheduledDate: '', scheduledTimeSlot: '', quotedPrice: '0', priority: 'Normal', internalNotes: '' }); setShowJobDialog(true); }} className="gap-1.5"><Plus size={16} /> New Job</Button>
                            </div>
                        </div>

                        <Card className="border-0 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Ticket</TableHead>
                                        <TableHead className="font-semibold">Customer</TableHead>
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="font-semibold">Scheduled</TableHead>
                                        <TableHead className="font-semibold">Priority</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold text-right">Quoted</TableHead>
                                        <TableHead className="font-semibold text-right">Cost</TableHead>
                                        <TableHead className="font-semibold text-right">Profit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jobs.length === 0 ? (
                                        <TableRow><TableCell colSpan={9} className="text-center text-slate-400 py-10">No job tickets</TableCell></TableRow>
                                    ) : jobs.map(job => (
                                        <TableRow key={job._id} className="hover:bg-slate-50">
                                            <TableCell className="font-mono text-sm font-medium">{job.ticketNumber}</TableCell>
                                            <TableCell>
                                                <p className="font-medium text-sm">{job.customer.name}</p>
                                                {job.customer.phone && <p className="text-xs text-slate-500">{job.customer.phone}</p>}
                                            </TableCell>
                                            <TableCell className="text-sm">{job.jobType.replace(/_/g, ' ')}</TableCell>
                                            <TableCell className="text-sm">{new Date(job.scheduledDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{statusBadge(job.priority)}</TableCell>
                                            <TableCell>{statusBadge(job.status)}</TableCell>
                                            <TableCell className="text-right font-mono">${job.quotedPrice.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono">${job.totalMaterialCost.toFixed(2)}</TableCell>
                                            <TableCell className={`text-right font-mono font-bold ${job.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${job.grossProfit.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* ═══════════════════ ASSETS TAB ═══════════════════ */}
                    <TabsContent value="assets" className="space-y-4">
                        <div className="flex gap-3 justify-between items-center">
                            <Select value={assetStatusFilter} onValueChange={v => setAssetStatusFilter(v === 'all' ? '' : v)}>
                                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="in_use">In Use</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="retired">Retired</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={loadAssets} size="icon"><RefreshCw size={16} /></Button>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assets.length === 0 ? (
                                <div className="col-span-full text-center text-slate-400 py-10">No assets found. Add items with type &quot;Asset&quot; in the Items tab.</div>
                            ) : assets.map(a => (
                                <Card key={a._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-bold text-slate-900">{a.name}</p>
                                                {a.assetTag && <p className="text-xs font-mono text-slate-500">Tag: {a.assetTag}</p>}
                                            </div>
                                            {statusBadge(a.assetStatus || 'available')}
                                        </div>
                                        <div className="space-y-1 text-sm text-slate-600 mb-4">
                                            <p>SKU: <span className="font-mono">{a.sku}</span></p>
                                            {a.currentHolder && <p>Holder: <span className="font-medium">{a.currentHolder.name}</span></p>}
                                            {a.currentLocation && <p>Location: {a.currentLocation.name}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            {a.assetStatus === 'available' && (
                                                <Button size="sm" className="flex-1 gap-1" onClick={() => handleCheckout(a._id)}>
                                                    <Wrench size={14} /> Check Out
                                                </Button>
                                            )}
                                            {a.assetStatus === 'in_use' && (
                                                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleCheckin(a._id)}>
                                                    <CheckCircle2 size={14} /> Check In
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* ═══════════════════ PURCHASE ORDERS TAB ═══════════════════ */}
                    <TabsContent value="purchase-orders" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-slate-500">{purchaseOrders.length} purchase order(s)</p>
                            <Button onClick={() => { setPOForm({ supplierName: '', supplierCode: '', deliverTo: '', expectedDeliveryDate: '', notes: '', lines: [{ itemId: '', quantity: '', unitCost: '' }] }); setShowPODialog(true); }} className="gap-1.5"><Plus size={16} /> New PO</Button>
                        </div>

                        <Card className="border-0 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">PO #</TableHead>
                                        <TableHead className="font-semibold">Supplier</TableHead>
                                        <TableHead className="font-semibold">Deliver To</TableHead>
                                        <TableHead className="font-semibold">Lines</TableHead>
                                        <TableHead className="font-semibold text-right">Amount</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchaseOrders.length === 0 ? (
                                        <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-10">No purchase orders yet</TableCell></TableRow>
                                    ) : purchaseOrders.map(po => (
                                        <TableRow key={po._id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedPO(po)}>
                                            <TableCell className="font-mono text-sm font-medium">{po.poNumber}</TableCell>
                                            <TableCell>
                                                <p className="font-medium text-sm">{po.supplier.name}</p>
                                                {po.supplier.code && <p className="text-xs text-slate-500">{po.supplier.code}</p>}
                                            </TableCell>
                                            <TableCell><div className="flex items-center gap-1.5">{locationIcon(po.deliverTo?.locationType || 'Warehouse')}<span className="text-sm">{po.deliverTo?.name}</span></div></TableCell>
                                            <TableCell className="text-sm">{po.lines.length} item(s)</TableCell>
                                            <TableCell className="text-right font-mono font-bold">${po.totalAmount.toFixed(2)}</TableCell>
                                            <TableCell>{statusBadge(po.status)}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                                                <div className="flex justify-center gap-1.5 flex-wrap">
                                                    <Button size="sm" variant="ghost" onClick={() => setSelectedPO(po)}><Eye size={14} /></Button>
                                                    {po.status === 'Submitted' && (
                                                        <Button size="sm" className="gap-1 text-xs" onClick={() => handleApprovePO(po._id)}><CheckCircle2 size={12} /> Approve</Button>
                                                    )}
                                                    {['Approved', 'Partially_Received'].includes(po.status) && (
                                                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleReceivePO(po)}><Download size={12} /> Receive All</Button>
                                                    )}
                                                    {!['Received', 'Cancelled'].includes(po.status) && (
                                                        <Button size="sm" variant="ghost" className="gap-1 text-xs text-red-500 hover:text-red-700" onClick={() => handleCancelPO(po._id)}><Trash2 size={12} /> Cancel</Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* ═══════════════════ REPORTS TAB ═══════════════════ */}
                    <TabsContent value="reports" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Inventory Reports</h3>
                                <p className="text-sm text-slate-500">Valuation, low stock alerts, and inventory insights</p>
                            </div>
                            <Button variant="outline" onClick={loadValuation} className="gap-1.5"><RefreshCw size={14} /> Refresh</Button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><DollarSign size={20} className="text-green-600" /></div>
                                    <div>
                                        <p className="text-xl font-bold text-slate-900">${valuationTotal.toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">Total Value (SGD)</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Package size={20} className="text-blue-600" /></div>
                                    <div>
                                        <p className="text-xl font-bold text-slate-900">{valuation.length}</p>
                                        <p className="text-xs text-slate-500">Stock Lines</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={`w-10 h-10 ${lowStock.length > 0 ? 'bg-red-50' : 'bg-slate-50'} rounded-xl flex items-center justify-center`}>
                                        <AlertTriangle size={20} className={lowStock.length > 0 ? 'text-red-600' : 'text-slate-400'} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-slate-900">{lowStock.length}</p>
                                        <p className="text-xs text-slate-500">Low Stock Items</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Activity size={20} className="text-purple-600" /></div>
                                    <div>
                                        <p className="text-xl font-bold text-slate-900">{new Set(valuation.map(v => v.location)).size}</p>
                                        <p className="text-xs text-slate-500">Active Locations</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Low Stock Alert Section */}
                        {lowStock.length > 0 && (
                            <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2 text-red-700">
                                        <AlertTriangle size={18} /> Low Stock Alert — {lowStock.length} item(s) below reorder level
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-red-50/50">
                                                <TableHead className="font-semibold text-xs">Item</TableHead>
                                                <TableHead className="font-semibold text-xs">SKU</TableHead>
                                                <TableHead className="font-semibold text-xs">Location</TableHead>
                                                <TableHead className="font-semibold text-xs text-right">On Hand</TableHead>
                                                <TableHead className="font-semibold text-xs text-right">Reorder Lvl</TableHead>
                                                <TableHead className="font-semibold text-xs text-right">Shortfall</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lowStock.map((ls, i) => (
                                                <TableRow key={i} className="bg-red-50/30">
                                                    <TableCell className="font-medium text-sm">{ls.item}</TableCell>
                                                    <TableCell className="font-mono text-xs">{ls.sku}</TableCell>
                                                    <TableCell className="text-sm">{ls.location}</TableCell>
                                                    <TableCell className="text-right font-mono font-bold text-red-600">{ls.quantityOnHand}</TableCell>
                                                    <TableCell className="text-right font-mono">{ls.reorderLevel}</TableCell>
                                                    <TableCell className="text-right font-mono font-bold text-red-700">{ls.reorderLevel - ls.quantityOnHand}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {/* Valuation Table */}
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Stock Valuation</CardTitle>
                            </CardHeader>
                            {loadingReport ? <div className="p-8"><PromachLoader variant="inline" /></div> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Item</TableHead>
                                            <TableHead className="font-semibold">SKU</TableHead>
                                            <TableHead className="font-semibold">Location</TableHead>
                                            <TableHead className="font-semibold text-right">Qty</TableHead>
                                            <TableHead className="font-semibold">UoM</TableHead>
                                            <TableHead className="font-semibold text-right">Unit Cost</TableHead>
                                            <TableHead className="font-semibold text-right">Total Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {valuation.length === 0 ? (
                                            <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-10">No inventory data</TableCell></TableRow>
                                        ) : valuation.map((row, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50">
                                                <TableCell className="font-medium">{row.item}</TableCell>
                                                <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                                                <TableCell><div className="flex items-center gap-1.5">{locationIcon(row.locationType)}<span className="text-sm">{row.location}</span></div></TableCell>
                                                <TableCell className="text-right font-mono">{row.quantityOnHand}</TableCell>
                                                <TableCell className="text-slate-600">{row.uom}</TableCell>
                                                <TableCell className="text-right font-mono">${row.unitCost.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-mono font-bold">${row.totalValue.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {valuation.length > 0 && (
                                            <TableRow className="bg-slate-100 font-bold">
                                                <TableCell colSpan={6} className="text-right">Grand Total</TableCell>
                                                <TableCell className="text-right font-mono text-lg">${valuationTotal.toFixed(2)}</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ══════════════ DIALOGS ══════════════ */}

            {/* Item Dialog */}
            <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>SKU</Label>
                                <Input value={itemForm.sku} onChange={e => setItemForm(p => ({ ...p, sku: e.target.value }))} placeholder="e.g. GAS-R32-L" />
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select value={itemForm.itemType} onValueChange={v => setItemForm(p => ({ ...p, itemType: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Consumable">Consumable</SelectItem>
                                        <SelectItem value="Asset">Asset / Tool</SelectItem>
                                        <SelectItem value="Kit">Kit / Bundle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Name</Label>
                            <Input value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Refrigerant Gas R32" />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} rows={2} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label>UoM</Label>
                                <Input value={itemForm.uom} onChange={e => setItemForm(p => ({ ...p, uom: e.target.value }))} placeholder="Units" />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Input value={itemForm.category} onChange={e => setItemForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Gas" />
                            </div>
                            <div>
                                <Label>Brand</Label>
                                <Input value={itemForm.brand} onChange={e => setItemForm(p => ({ ...p, brand: e.target.value }))} placeholder="e.g. Daikin" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label>Unit Cost (SGD)</Label>
                                <Input type="number" step="0.01" value={itemForm.unitCost} onChange={e => setItemForm(p => ({ ...p, unitCost: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Selling Price</Label>
                                <Input type="number" step="0.01" value={itemForm.sellingPrice} onChange={e => setItemForm(p => ({ ...p, sellingPrice: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Reorder Level</Label>
                                <Input type="number" step="0.01" value={itemForm.reorderLevel} onChange={e => setItemForm(p => ({ ...p, reorderLevel: e.target.value }))} />
                            </div>
                        </div>
                        {itemForm.itemType === 'Asset' && (
                            <div>
                                <Label>Asset Tag</Label>
                                <Input value={itemForm.assetTag} onChange={e => setItemForm(p => ({ ...p, assetTag: e.target.value }))} placeholder="e.g. TOOL-VP-001" />
                            </div>
                        )}
                        <div>
                            <Label>Barcode</Label>
                            <Input value={itemForm.barcode} onChange={e => setItemForm(p => ({ ...p, barcode: e.target.value }))} placeholder="Scan or enter barcode" />
                        </div>
                        <div className="border rounded-lg p-3 space-y-3">
                            <p className="text-sm font-semibold text-slate-700">Supplier Info</p>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs">Supplier Name</Label>
                                    <Input value={itemForm.supplierName} onChange={e => setItemForm(p => ({ ...p, supplierName: e.target.value }))} />
                                </div>
                                <div>
                                    <Label className="text-xs">Supplier Code</Label>
                                    <Input value={itemForm.supplierCode} onChange={e => setItemForm(p => ({ ...p, supplierCode: e.target.value }))} />
                                </div>
                                <div>
                                    <Label className="text-xs">Lead Time (days)</Label>
                                    <Input type="number" value={itemForm.supplierLeadTime} onChange={e => setItemForm(p => ({ ...p, supplierLeadTime: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Min Stock Level</Label>
                                <Input type="number" step="0.01" value={itemForm.minStockLevel} onChange={e => setItemForm(p => ({ ...p, minStockLevel: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Max Stock Level</Label>
                                <Input type="number" step="0.01" value={itemForm.maxStockLevel} onChange={e => setItemForm(p => ({ ...p, maxStockLevel: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={itemForm.trackBatch} onChange={e => setItemForm(p => ({ ...p, trackBatch: e.target.checked }))} className="rounded" />
                                Track Batch #
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={itemForm.trackExpiry} onChange={e => setItemForm(p => ({ ...p, trackExpiry: e.target.checked }))} className="rounded" />
                                Track Expiry Date
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowItemDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveItem}>{editingItem ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Location Dialog */}
            <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Location</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div>
                            <Label>Name</Label>
                            <Input value={locationForm.name} onChange={e => setLocationForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Main Warehouse" />
                        </div>
                        <div>
                            <Label>Type</Label>
                            <Select value={locationForm.locationType} onValueChange={v => setLocationForm(p => ({ ...p, locationType: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                                    <SelectItem value="Van">Van / Vehicle</SelectItem>
                                    <SelectItem value="Site">Project Site</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Input value={locationForm.address} onChange={e => setLocationForm(p => ({ ...p, address: e.target.value }))} placeholder="Optional" />
                        </div>
                        {locationForm.locationType === 'Van' && (
                            <div>
                                <Label>Vehicle Number</Label>
                                <Input value={locationForm.vehicleNumber} onChange={e => setLocationForm(p => ({ ...p, vehicleNumber: e.target.value }))} placeholder="e.g. SGX1234A" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLocationDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveLocation}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transfer Dialog */}
            <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Stock Transfer</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>From Location</Label>
                                <Select value={transferForm.fromLocationId} onValueChange={v => setTransferForm(p => ({ ...p, fromLocationId: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>
                                        {locations.map(l => <SelectItem key={l._id} value={l._id}>{l.name} ({l.locationType})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>To Location</Label>
                                <Select value={transferForm.toLocationId} onValueChange={v => setTransferForm(p => ({ ...p, toLocationId: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>
                                        {locations.filter(l => l._id !== transferForm.fromLocationId).map(l => <SelectItem key={l._id} value={l._id}>{l.name} ({l.locationType})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Items</Label>
                            <div className="space-y-2 mt-1">
                                {transferForm.items.map((line, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Select value={line.itemId} onValueChange={v => { const arr = [...transferForm.items]; arr[idx].itemId = v; setTransferForm(p => ({ ...p, items: arr })); }}>
                                            <SelectTrigger className="flex-1"><SelectValue placeholder="Select item…" /></SelectTrigger>
                                            <SelectContent>
                                                {items.map(i => <SelectItem key={i._id} value={i._id}>{i.name} ({i.sku})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" step="0.01" className="w-24" placeholder="Qty" value={line.quantity} onChange={e => { const arr = [...transferForm.items]; arr[idx].quantity = e.target.value; setTransferForm(p => ({ ...p, items: arr })); }} />
                                        {transferForm.items.length > 1 && (
                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { const arr = transferForm.items.filter((_, i) => i !== idx); setTransferForm(p => ({ ...p, items: arr })); }}><Trash2 size={14} /></Button>
                                        )}
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" className="gap-1" onClick={() => setTransferForm(p => ({ ...p, items: [...p.items, { itemId: '', quantity: '' }] }))}><Plus size={14} /> Add Line</Button>
                            </div>
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <Textarea value={transferForm.notes} onChange={e => setTransferForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateTransfer}>Create Transfer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Job Ticket Dialog */}
            <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Job Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Job Type</Label>
                                <Select value={jobForm.jobType} onValueChange={v => setJobForm(p => ({ ...p, jobType: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['Aircon_Service', 'Aircon_Install', 'Aircon_Repair', 'Renovation', 'Maintenance_Contract', 'Other'].map(t => (
                                            <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select value={jobForm.priority} onValueChange={v => setJobForm(p => ({ ...p, priority: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['Low', 'Normal', 'High', 'Urgent'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Customer Name</Label>
                            <Input value={jobForm.customerName} onChange={e => setJobForm(p => ({ ...p, customerName: e.target.value }))} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Phone</Label>
                                <Input value={jobForm.customerPhone} onChange={e => setJobForm(p => ({ ...p, customerPhone: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input type="email" value={jobForm.customerEmail} onChange={e => setJobForm(p => ({ ...p, customerEmail: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label>Street</Label>
                                <Input value={jobForm.street} onChange={e => setJobForm(p => ({ ...p, street: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Unit</Label>
                                <Input value={jobForm.unit} onChange={e => setJobForm(p => ({ ...p, unit: e.target.value }))} placeholder="#01-01" />
                            </div>
                            <div>
                                <Label>Postal Code</Label>
                                <Input value={jobForm.postalCode} onChange={e => setJobForm(p => ({ ...p, postalCode: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Scheduled Date</Label>
                                <Input type="date" value={jobForm.scheduledDate} onChange={e => setJobForm(p => ({ ...p, scheduledDate: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Time Slot</Label>
                                <Input value={jobForm.scheduledTimeSlot} onChange={e => setJobForm(p => ({ ...p, scheduledTimeSlot: e.target.value }))} placeholder="09:00-12:00" />
                            </div>
                        </div>
                        <div>
                            <Label>Quoted Price (SGD)</Label>
                            <Input type="number" step="0.01" value={jobForm.quotedPrice} onChange={e => setJobForm(p => ({ ...p, quotedPrice: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Internal Notes</Label>
                            <Textarea value={jobForm.internalNotes} onChange={e => setJobForm(p => ({ ...p, internalNotes: e.target.value }))} rows={2} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowJobDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateJob}>Create Job</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* ═══════════════════ PO DIALOG ═══════════════════ */}
            <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Supplier Name *</Label>
                                <Input value={poForm.supplierName} onChange={e => setPOForm(p => ({ ...p, supplierName: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Supplier Code</Label>
                                <Input value={poForm.supplierCode} onChange={e => setPOForm(p => ({ ...p, supplierCode: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Deliver To *</Label>
                                <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={poForm.deliverTo} onChange={e => setPOForm(p => ({ ...p, deliverTo: e.target.value }))}>
                                    <option value="">Select location…</option>
                                    {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Expected Delivery</Label>
                                <Input type="date" value={poForm.expectedDeliveryDate} onChange={e => setPOForm(p => ({ ...p, expectedDeliveryDate: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Textarea value={poForm.notes} onChange={e => setPOForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <Label className="text-sm font-semibold">Line Items</Label>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="text-xs gap-1 text-green-600 hover:text-green-700" onClick={() => { setQuickItemForm({ sku: '', name: '', itemType: 'Consumable', uom: 'Units', unitCost: '0', category: '' }); setShowQuickItemDialog(true); }}>
                                        <Plus size={12} /> Quick Add Item
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setPOForm(p => ({ ...p, lines: [...p.lines, { itemId: '', quantity: '', unitCost: '' }] }))}><Plus size={14} className="mr-1" /> Add Line</Button>
                                </div>
                            </div>
                            {poForm.lines.map((line: any, idx: number) => (
                                <div key={idx} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-end mb-2">
                                    <div>
                                        {idx === 0 && <Label className="text-xs text-slate-500">Item</Label>}
                                        <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={line.itemId} onChange={e => { const lines = [...poForm.lines]; lines[idx] = { ...lines[idx], itemId: e.target.value }; setPOForm(p => ({ ...p, lines })); }}>
                                            <option value="">Select…</option>
                                            {items.map(it => <option key={it._id} value={it._id}>{it.name} ({it.sku})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        {idx === 0 && <Label className="text-xs text-slate-500">Qty</Label>}
                                        <Input type="number" min="1" value={line.quantity} onChange={e => { const lines = [...poForm.lines]; lines[idx] = { ...lines[idx], quantity: e.target.value }; setPOForm(p => ({ ...p, lines })); }} />
                                    </div>
                                    <div>
                                        {idx === 0 && <Label className="text-xs text-slate-500">Unit Cost</Label>}
                                        <Input type="number" step="0.01" min="0" value={line.unitCost} onChange={e => { const lines = [...poForm.lines]; lines[idx] = { ...lines[idx], unitCost: e.target.value }; setPOForm(p => ({ ...p, lines })); }} />
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-red-500 h-9 w-9 p-0" onClick={() => { if (poForm.lines.length <= 1) return; const lines = poForm.lines.filter((_: any, i: number) => i !== idx); setPOForm(p => ({ ...p, lines })); }}><Trash2 size={14} /></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPODialog(false)}>Cancel</Button>
                        <Button onClick={handleCreatePO}>Create PO</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══════════════════ PO DETAIL DIALOG ═══════════════════ */}
            <Dialog open={!!selectedPO} onOpenChange={() => setSelectedPO(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedPO && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    <span>Purchase Order {selectedPO.poNumber}</span>
                                    {statusBadge(selectedPO.status)}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {/* PO Header Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="border shadow-none">
                                        <CardContent className="p-3 space-y-1">
                                            <p className="text-xs font-medium text-slate-500 uppercase">Supplier</p>
                                            <p className="font-semibold text-slate-900">{selectedPO.supplier.name}</p>
                                            {selectedPO.supplier.code && <p className="text-xs text-slate-500">Code: {selectedPO.supplier.code}</p>}
                                            {selectedPO.supplier.contactPerson && <p className="text-xs text-slate-500">Contact: {selectedPO.supplier.contactPerson}</p>}
                                            {selectedPO.supplier.phone && <p className="text-xs text-slate-500">📞 {selectedPO.supplier.phone}</p>}
                                            {selectedPO.supplier.email && <p className="text-xs text-slate-500">✉ {selectedPO.supplier.email}</p>}
                                        </CardContent>
                                    </Card>
                                    <Card className="border shadow-none">
                                        <CardContent className="p-3 space-y-1">
                                            <p className="text-xs font-medium text-slate-500 uppercase">Delivery</p>
                                            {selectedPO.deliverTo && (
                                                <div className="flex items-center gap-1.5">
                                                    {locationIcon(selectedPO.deliverTo.locationType)}
                                                    <span className="font-semibold text-slate-900">{selectedPO.deliverTo.name}</span>
                                                </div>
                                            )}
                                            {selectedPO.expectedDeliveryDate && (
                                                <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> Expected: {new Date(selectedPO.expectedDeliveryDate).toLocaleDateString()}</p>
                                            )}
                                            <p className="text-xs text-slate-500">Created: {new Date(selectedPO.createdAt).toLocaleDateString()}</p>
                                            {selectedPO.createdBy && <p className="text-xs text-slate-500">By: {selectedPO.createdBy.name}</p>}
                                            {selectedPO.approvedBy && <p className="text-xs text-slate-500">Approved by: {selectedPO.approvedBy.name}</p>}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Line Items Detail */}
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 mb-2">Line Items ({selectedPO.lines.length})</p>
                                    <Card className="border shadow-none overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead className="font-semibold text-xs">Item</TableHead>
                                                    <TableHead className="font-semibold text-xs">SKU</TableHead>
                                                    <TableHead className="font-semibold text-xs text-right">Qty</TableHead>
                                                    <TableHead className="font-semibold text-xs">UoM</TableHead>
                                                    <TableHead className="font-semibold text-xs text-right">Unit Cost</TableHead>
                                                    <TableHead className="font-semibold text-xs text-right">Line Total</TableHead>
                                                    <TableHead className="font-semibold text-xs text-right">Received</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedPO.lines.map((line, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-medium text-sm">{line.item?.name || 'Unknown'}</TableCell>
                                                        <TableCell className="font-mono text-xs">{line.item?.sku || '—'}</TableCell>
                                                        <TableCell className="text-right font-mono">{line.quantity}</TableCell>
                                                        <TableCell className="text-xs text-slate-500">{line.item?.uom || '—'}</TableCell>
                                                        <TableCell className="text-right font-mono">${line.unitCost.toFixed(2)}</TableCell>
                                                        <TableCell className="text-right font-mono font-bold">${(line.quantity * line.unitCost).toFixed(2)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={`font-mono ${line.receivedQuantity >= line.quantity ? 'text-green-600' : line.receivedQuantity > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                                                {line.receivedQuantity}/{line.quantity}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </div>

                                {/* Total + Notes */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm font-medium text-slate-600">Total Amount</span>
                                    <span className="text-xl font-bold text-slate-900">${selectedPO.totalAmount.toFixed(2)}</span>
                                </div>
                                {selectedPO.notes && (
                                    <div className="p-3 bg-amber-50 rounded-lg">
                                        <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
                                        <p className="text-sm text-amber-900">{selectedPO.notes}</p>
                                    </div>
                                )}
                                {selectedPO.relatedJobTicket && (
                                    <p className="text-xs text-slate-500">Related Job: <span className="font-mono">{selectedPO.relatedJobTicket.ticketNumber}</span></p>
                                )}
                            </div>
                            <DialogFooter className="flex-wrap gap-2">
                                {selectedPO.status === 'Submitted' && (
                                    <Button className="gap-1" onClick={() => { handleApprovePO(selectedPO._id); setSelectedPO(null); }}><CheckCircle2 size={14} /> Approve</Button>
                                )}
                                {['Approved', 'Partially_Received'].includes(selectedPO.status) && (
                                    <Button variant="outline" className="gap-1" onClick={() => { handleReceivePO(selectedPO); setSelectedPO(null); }}><Download size={14} /> Receive All</Button>
                                )}
                                {!['Received', 'Cancelled'].includes(selectedPO.status) && (
                                    <Button variant="ghost" className="gap-1 text-red-500 hover:text-red-700" onClick={() => { handleCancelPO(selectedPO._id); setSelectedPO(null); }}><Trash2 size={14} /> Cancel PO</Button>
                                )}
                                <Button variant="outline" onClick={() => setSelectedPO(null)}>Close</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═══════════════════ QUICK ITEM CREATE DIALOG ═══════════════════ */}
            <Dialog open={showQuickItemDialog} onOpenChange={setShowQuickItemDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Plus size={18} /> Quick Add Item</DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-slate-500 -mt-2">Create a new item that will be immediately available in dropdowns</p>
                    <div className="grid gap-3 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">SKU *</Label>
                                <Input value={quickItemForm.sku} onChange={e => setQuickItemForm(p => ({ ...p, sku: e.target.value }))} placeholder="e.g. PART-001" />
                            </div>
                            <div>
                                <Label className="text-xs">Type</Label>
                                <Select value={quickItemForm.itemType} onValueChange={v => setQuickItemForm(p => ({ ...p, itemType: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Consumable">Consumable</SelectItem>
                                        <SelectItem value="Asset">Asset</SelectItem>
                                        <SelectItem value="Kit">Kit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs">Name *</Label>
                            <Input value={quickItemForm.name} onChange={e => setQuickItemForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Copper Pipe 1/4 inch" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label className="text-xs">UoM</Label>
                                <Input value={quickItemForm.uom} onChange={e => setQuickItemForm(p => ({ ...p, uom: e.target.value }))} />
                            </div>
                            <div>
                                <Label className="text-xs">Unit Cost</Label>
                                <Input type="number" step="0.01" value={quickItemForm.unitCost} onChange={e => setQuickItemForm(p => ({ ...p, unitCost: e.target.value }))} />
                            </div>
                            <div>
                                <Label className="text-xs">Category</Label>
                                <Input value={quickItemForm.category} onChange={e => setQuickItemForm(p => ({ ...p, category: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowQuickItemDialog(false)}>Cancel</Button>
                        <Button onClick={handleQuickItemCreate} disabled={creatingQuickItem || !quickItemForm.sku || !quickItemForm.name}>
                            {creatingQuickItem ? <><Loader2 size={14} className="animate-spin mr-1" /> Creating…</> : 'Create Item'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══════════════════ ITEM DETAIL DIALOG ═══════════════════ */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    {selectedItem && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    <span>{selectedItem.name}</span>
                                    {statusBadge(selectedItem.itemType)}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500">SKU</p>
                                        <p className="font-mono font-bold text-slate-900">{selectedItem.sku}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500">Status</p>
                                        <p className="font-medium text-slate-900">{selectedItem.isActive ? '✅ Active' : '❌ Inactive'}</p>
                                    </div>
                                </div>
                                {selectedItem.description && (
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Description</p>
                                        <p className="text-sm text-slate-700">{selectedItem.description}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                                        <p className="text-xs text-blue-600">Unit Cost</p>
                                        <p className="font-bold text-blue-900">${selectedItem.unitCost.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg text-center">
                                        <p className="text-xs text-green-600">Sell Price</p>
                                        <p className="font-bold text-green-900">${selectedItem.sellingPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-lg text-center">
                                        <p className="text-xs text-amber-600">Reorder Lvl</p>
                                        <p className="font-bold text-amber-900">{selectedItem.reorderLevel}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-slate-500">Category:</span> <span className="font-medium">{selectedItem.category || '—'}</span></div>
                                    <div><span className="text-slate-500">UoM:</span> <span className="font-medium">{selectedItem.uom}</span></div>
                                    <div><span className="text-slate-500">Brand:</span> <span className="font-medium">{selectedItem.brand || '—'}</span></div>
                                    <div><span className="text-slate-500">Barcode:</span> <span className="font-mono text-xs">{selectedItem.barcode || '—'}</span></div>
                                    {selectedItem.minStockLevel !== undefined && <div><span className="text-slate-500">Min Stock:</span> <span className="font-medium">{selectedItem.minStockLevel}</span></div>}
                                    {selectedItem.maxStockLevel !== undefined && <div><span className="text-slate-500">Max Stock:</span> <span className="font-medium">{selectedItem.maxStockLevel}</span></div>}
                                    {selectedItem.trackBatch && <div><Badge className="bg-purple-100 text-purple-700 border-0">Batch Tracking</Badge></div>}
                                    {selectedItem.trackExpiry && <div><Badge className="bg-orange-100 text-orange-700 border-0">Expiry Tracking</Badge></div>}
                                </div>
                                {selectedItem.supplier?.name && (
                                    <Card className="border shadow-none">
                                        <CardContent className="p-3">
                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Supplier</p>
                                            <p className="font-medium text-sm">{selectedItem.supplier.name}</p>
                                            {selectedItem.supplier.code && <p className="text-xs text-slate-500">Code: {selectedItem.supplier.code}</p>}
                                            {selectedItem.supplier.leadTimeDays ? <p className="text-xs text-slate-500">Lead Time: {selectedItem.supplier.leadTimeDays} days</p> : null}
                                        </CardContent>
                                    </Card>
                                )}
                                {selectedItem.itemType === 'Asset' && (
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-slate-500">Asset Tag:</span> <span className="font-mono">{selectedItem.assetTag || '—'}</span></div>
                                        <div><span className="text-slate-500">Asset Status:</span> {selectedItem.assetStatus ? statusBadge(selectedItem.assetStatus) : '—'}</div>
                                        {selectedItem.currentHolder && <div><span className="text-slate-500">Holder:</span> <span className="font-medium">{selectedItem.currentHolder.name}</span></div>}
                                        {selectedItem.currentLocation && <div><span className="text-slate-500">Location:</span> <span className="font-medium">{selectedItem.currentLocation.name}</span></div>}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { openEditItem(selectedItem); setSelectedItem(null); }} className="gap-1">
                                    <Edit size={14} /> Edit
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
