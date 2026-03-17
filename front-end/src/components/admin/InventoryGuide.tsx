import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Package, MapPin, ArrowLeftRight, ShoppingCart, Briefcase, Wrench,
  BarChart3, Upload, Download, Plus, ChevronRight, ChevronLeft, CheckCircle2,
  Send, Edit, Trash2, Eye, AlertTriangle, DollarSign, FileSpreadsheet,
  Search, RefreshCw, Truck, Warehouse, Building2
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  content: React.ReactNode;
}

export default function InventoryGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState(0);

  const sections: GuideSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <BookOpen size={18} />, 
      color: 'bg-primary/10 text-primary',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to the <strong>Promach Inventory Management System</strong> — your central hub for managing 
            all inventory, assets, stock transfers, purchase orders, job tickets, and reporting.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-sm text-slate-800">System Capabilities:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                { icon: <Package size={14} />, text: 'Master Item management (Consumables, Assets, Kits)' },
                { icon: <MapPin size={14} />, text: 'Location tracking (Warehouses, Vans, Sites)' },
                { icon: <ArrowLeftRight size={14} />, text: 'Stock transfers between locations' },
                { icon: <ShoppingCart size={14} />, text: 'Purchase order lifecycle management' },
                { icon: <Briefcase size={14} />, text: 'Job ticket creation & tracking' },
                { icon: <Wrench size={14} />, text: 'Asset checkout / check-in' },
                { icon: <BarChart3 size={14} />, text: 'Stock valuation & low-stock reports' },
                { icon: <FileSpreadsheet size={14} />, text: 'Bulk Excel import & template download' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-600">
                  <span className="text-primary">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Use the tabs at the top of the page to navigate between sections.
              The summary cards show real-time counts of items, locations, transfers, jobs, and low-stock alerts.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'items',
      title: 'Items Tab',
      icon: <Package size={18} />,
      color: 'bg-blue-50 text-blue-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            The <strong>Items</strong> tab is your master product catalogue. Every consumable (gas, pipes), 
            asset (tools, equipment), and kit (bundle) lives here.
          </p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm flex items-center gap-2"><Plus size={14} className="text-primary" /> Adding Items</p>
              <p className="text-sm text-slate-600">Click <strong>"Add Item"</strong> to create a new item. Fill in SKU (unique code), Name, Type, UoM (Unit of Measure), costs, and optionally supplier info, barcode, stock levels.</p>
              <div className="text-xs text-slate-500 bg-slate-50 rounded p-2">
                <strong>Item Types:</strong><br />
                • <strong>Consumable</strong> — Items that are used up (gas, copper pipes, filters)<br />
                • <strong>Asset / Tool</strong> — Reusable equipment that gets checked out/in (vacuum pumps, gauges)<br />
                • <strong>Kit / Bundle</strong> — A collection of items grouped together
              </div>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm flex items-center gap-2"><FileSpreadsheet size={14} className="text-green-600" /> Excel Import</p>
              <p className="text-sm text-slate-600">For bulk adding items:</p>
              <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                <li>Click <strong>"Download Template"</strong> to get a sample .xlsx file</li>
                <li>Fill it in with your items (up to 500 rows)</li>
                <li>Click <strong>"Import Excel"</strong> and select your file</li>
                <li>The system validates each row and creates items, showing a success/error summary</li>
              </ol>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm flex items-center gap-2"><Search size={14} /> Search & Filter</p>
              <p className="text-sm text-slate-600">Use the search bar to find by name or SKU. Use the dropdown to filter by type (Consumable, Asset, Kit). Click any item row to view its full details.</p>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm flex items-center gap-2"><Edit size={14} /> Edit / Delete</p>
              <p className="text-sm text-slate-600">Click <Eye size={12} className="inline" /> to view details, <Edit size={12} className="inline" /> to edit, or <Trash2 size={12} className="inline text-red-500" /> to deactivate an item. Deactivating is a soft-delete — the item is hidden but data is preserved.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'locations',
      title: 'Locations Tab',
      icon: <MapPin size={18} />,
      color: 'bg-emerald-50 text-emerald-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Locations</strong> represent where your inventory is physically stored.
          </p>
          <div className="space-y-3">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="font-semibold text-sm mb-2">Location Types:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Warehouse size={16} className="text-blue-600" /> <strong>Warehouse</strong> — Main storage facility (e.g., Jurong Central Warehouse)</div>
                <div className="flex items-center gap-2"><Truck size={16} className="text-amber-600" /> <strong>Van / Vehicle</strong> — Mobile inventory on service vehicles</div>
                <div className="flex items-center gap-2"><Building2 size={16} className="text-violet-600" /> <strong>Project Site</strong> — Temporary location for a specific project</div>
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">Viewing Stock</p>
              <p className="text-sm text-slate-600">Click any location in the left panel to see its current stock levels on the right. Items below their reorder level are highlighted in red.</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-sm text-blue-800"><strong>Tip:</strong> Before dispatching a transfer, make sure the source location has stock. Use "Locations" tab to verify stock levels.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'transfers',
      title: 'Transfers Tab',
      icon: <ArrowLeftRight size={18} />,
      color: 'bg-amber-50 text-amber-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Stock Transfers</strong> move inventory between locations (e.g., warehouse → van, van → project site).
          </p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">Transfer Workflow:</p>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge className="bg-yellow-100 text-yellow-800 border-0">1. Pending</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-blue-100 text-blue-800 border-0">2. In Transit</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-green-100 text-green-800 border-0">3. Received</Badge>
              </div>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">How to Create a Transfer:</p>
              <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                <li>Click <strong>"New Transfer"</strong></li>
                <li>Select source (From) and destination (To) locations</li>
                <li>Add one or more items with quantities</li>
                <li>Click <strong>"Create Transfer"</strong> — status becomes <strong>Pending</strong></li>
                <li>Click <strong>"Dispatch"</strong> — stock is deducted from source, status becomes <strong>In Transit</strong></li>
                <li>Click <strong>"Receive"</strong> — stock is added to destination, status becomes <strong>Received</strong></li>
              </ol>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-sm text-amber-800"><strong>Important:</strong> You must first <strong>receive stock</strong> into the source location (using the Receive Goods function or a PO) before you can dispatch a transfer. The system checks stock levels and will block the dispatch if stock is insufficient.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'purchase-orders',
      title: 'Purchase Orders',
      icon: <ShoppingCart size={18} />,
      color: 'bg-violet-50 text-violet-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Purchase Orders (POs)</strong> track orders placed with suppliers to replenish your inventory.
          </p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">PO Lifecycle:</p>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge className="bg-slate-100 text-slate-600 border-0">Draft</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-blue-100 text-blue-700 border-0">Submitted</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-emerald-100 text-emerald-700 border-0">Approved</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-amber-100 text-amber-700 border-0">Partially Received</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-green-100 text-green-700 border-0">Received</Badge>
              </div>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">Creating a PO:</p>
              <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                <li>Click <strong>"New PO"</strong></li>
                <li>Enter supplier name, delivery location, expected date</li>
                <li>Add line items — select item, quantity, and unit cost</li>
                <li>If an item doesn't exist, click <strong>"Quick Add Item"</strong> to create it on the fly</li>
                <li>Click <strong>"Create PO"</strong></li>
              </ol>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">PO Actions:</p>
              <div className="text-sm text-slate-600 space-y-1">
                <p>• <strong>Approve</strong> — Admins / Ops Managers approve submitted POs</p>
                <p>• <strong>Receive All</strong> — Marks all remaining items as received, adds stock to the delivery location</p>
                <p>• <strong>Cancel</strong> — Cancels the PO (available at any stage)</p>
                <p>• Click a PO row or the <Eye size={12} className="inline" /> button to view full details</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'jobs',
      title: 'Jobs Tab',
      icon: <Briefcase size={18} />,
      color: 'bg-indigo-50 text-indigo-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Job Tickets</strong> represent work assignments — aircon servicing, installations, repairs, etc.
          </p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">Job Types:</p>
              <p className="text-sm text-slate-600">Aircon Service, Aircon Install, Aircon Repair, Renovation, Maintenance Contract, Other</p>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">Job Workflow:</p>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge className="bg-slate-100 text-slate-600 border-0">Draft</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-blue-100 text-blue-700 border-0">Scheduled</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-amber-100 text-amber-700 border-0">In Progress</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-green-100 text-green-700 border-0">Completed</Badge>
                <ChevronRight size={14} className="text-slate-400" />
                <Badge className="bg-purple-100 text-purple-700 border-0">Invoiced</Badge>
              </div>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">Creating a Job:</p>
              <p className="text-sm text-slate-600">Click "New Job", fill in: job type, customer details, site address, scheduled date & time, quoted price, and priority. Technicians assigned via User Management will see the job in their Staff Dashboard.</p>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">Financial Tracking:</p>
              <p className="text-sm text-slate-600">Each job tracks <strong>Quoted Price</strong>, <strong>Material Cost</strong>, and <strong>Gross Profit</strong>. Material cost is automatically calculated when technicians consume inventory on the job.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'assets',
      title: 'Assets Tab',
      icon: <Wrench size={18} />,
      color: 'bg-orange-50 text-orange-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            The <strong>Assets</strong> tab shows all items of type "Asset" — tools and equipment that can be checked out and returned.
          </p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">Asset Statuses:</p>
              <div className="text-sm space-y-1">
                <p><Badge className="bg-green-100 text-green-800 border-0">Available</Badge> — Ready to check out</p>
                <p><Badge className="bg-blue-100 text-blue-800 border-0">In Use</Badge> — Currently checked out to someone</p>
                <p><Badge className="bg-orange-100 text-orange-800 border-0">Maintenance</Badge> — Under repair/service</p>
                <p><Badge className="bg-slate-100 text-slate-600 border-0">Retired</Badge> — No longer in service</p>
              </div>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">Check Out / Check In:</p>
              <p className="text-sm text-slate-600">
                • <strong>Check Out</strong> — Assigns the asset to you (the logged-in user). Use this when taking a tool for a job.<br />
                • <strong>Check In</strong> — Returns the asset. It becomes "Available" again.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-sm text-blue-800"><strong>Note:</strong> To add assets, go to the <strong>Items</strong> tab and create an item with type "Asset". Set an Asset Tag for easy identification (e.g., TOOL-VP-001).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Reports Tab',
      icon: <BarChart3 size={18} />,
      color: 'bg-teal-50 text-teal-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            The <strong>Reports</strong> tab provides inventory valuation and low-stock alerts across all locations.
          </p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm flex items-center gap-2"><DollarSign size={14} className="text-green-600" /> Stock Valuation</p>
              <p className="text-sm text-slate-600">Shows every item at every location, with quantities, unit cost, and total stock value in SGD. The grand total is displayed at the top and as a footer row.</p>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm flex items-center gap-2"><AlertTriangle size={14} className="text-red-600" /> Low Stock Alerts</p>
              <p className="text-sm text-slate-600">Items below their reorder level are flagged. The alert shows the current quantity, reorder level, and shortfall amount — so you know exactly how much to reorder.</p>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">Summary Cards</p>
              <p className="text-sm text-slate-600">Quick metrics at a glance: Total Inventory Value, Stock Lines count, Low Stock items, and Active Locations. Use "Refresh" to update the data.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'workflow',
      title: 'Common Workflows',
      icon: <CheckCircle2 size={18} />,
      color: 'bg-green-50 text-green-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Below are step-by-step flows for common tasks:
          </p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">🔄 Restocking Workflow</p>
              <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                <li>Check <strong>Reports → Low Stock Alert</strong> to see what needs reordering</li>
                <li>Go to <strong>Purchase Orders → New PO</strong></li>
                <li>Add items that need restocking, enter supplier info</li>
                <li>Submit & Approve the PO</li>
                <li>When goods arrive, click <strong>"Receive All"</strong> — stock auto-adds to the delivery location</li>
              </ol>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">🚛 Van Replenishment</p>
              <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                <li>Ensure the warehouse has stock (receive goods or check stock)</li>
                <li>Go to <strong>Transfers → New Transfer</strong></li>
                <li>Set <strong>From:</strong> Warehouse, <strong>To:</strong> Van</li>
                <li>Add items and quantities</li>
                <li>Create → Dispatch (deducts from warehouse) → Receive (adds to van)</li>
              </ol>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">🔧 Tool Management</p>
              <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                <li>Create item with type "Asset" in the Items tab</li>
                <li>Go to <strong>Assets</strong> tab to see all tools</li>
                <li><strong>Check Out</strong> a tool before going to a job site</li>
                <li><strong>Check In</strong> the tool when done</li>
              </ol>
            </div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-semibold text-sm">📋 Bulk Item Setup</p>
              <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                <li>Go to <strong>Items</strong> tab</li>
                <li>Click <strong>"Download Template"</strong> to get the Excel file</li>
                <li>Fill in your items in the spreadsheet</li>
                <li>Click <strong>"Import Excel"</strong> to upload</li>
                <li>Review the import summary (created / skipped counts)</li>
              </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'roles',
      title: 'Roles & Permissions',
      icon: <CheckCircle2 size={18} />,
      color: 'bg-rose-50 text-rose-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Different users have different access levels:
          </p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3">
              <p className="font-semibold text-sm text-red-700">Admin</p>
              <p className="text-sm text-slate-600">Full access to everything — item creation/deletion, PO approval, stock management, user management, all reports.</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-semibold text-sm text-amber-700">Operations Manager</p>
              <p className="text-sm text-slate-600">Can create/edit items, manage transfers, approve POs, receive goods. Cannot delete items or manage users.</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-semibold text-sm text-blue-700">Field Technician</p>
              <p className="text-sm text-slate-600">Uses the <strong>Staff Dashboard</strong> (mobile-first). Can view assigned jobs, check in/out of job sites, consume materials, create draft POs, and manage tools.</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-semibold text-sm text-green-700">User (Customer)</p>
              <p className="text-sm text-slate-600">Uses the <strong>Customer Portal</strong>. Can book services, track job status, and view booking history.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-full max-h-[85vh]">
          {/* Sidebar navigation */}
          <div className="w-56 bg-slate-50 border-r border-slate-200 flex-shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">User Guide</p>
                  <p className="text-[10px] text-slate-500">Inventory System</p>
                </div>
              </div>
            </div>
            <nav className="p-2 space-y-0.5">
              {sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    activeSection === idx
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${activeSection === idx ? 'bg-primary/20' : section.color}`}>
                    {section.icon}
                  </span>
                  <span className="truncate">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col min-w-0">
            <DialogHeader className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
              <DialogTitle className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${sections[activeSection].color}`}>
                  {sections[activeSection].icon}
                </span>
                {sections[activeSection].title}
                <Badge className="bg-slate-100 text-slate-500 border-0 text-[10px]">{activeSection + 1} / {sections.length}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {sections[activeSection].content}
            </div>
            <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
              <Button
                variant="outline"
                size="sm"
                disabled={activeSection === 0}
                onClick={() => setActiveSection(p => Math.max(0, p - 1))}
                className="gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <div className="flex gap-1">
                {sections.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSection(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${activeSection === idx ? 'bg-primary' : 'bg-slate-200'}`}
                  />
                ))}
              </div>
              {activeSection < sections.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setActiveSection(p => Math.min(sections.length - 1, p + 1))}
                  className="gap-1"
                >
                  Next <ChevronRight size={14} />
                </Button>
              ) : (
                <Button size="sm" onClick={onClose} className="gap-1">
                  <CheckCircle2 size={14} /> Got it!
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
