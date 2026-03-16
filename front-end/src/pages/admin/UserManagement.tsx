import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PromachLoader from '@/components/PromachLoader';
import {
    Users, Plus, RefreshCw, Shield, Truck, Wrench, Edit,
    UserCheck, UserX, Mail, Phone, Clock, Search
} from 'lucide-react';
import { erpAuthAPI, locationsAPI } from '@/services/erpApi';
import { useToast } from '@/hooks/use-toast';

interface ERPUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'Admin' | 'Operations_Manager' | 'Field_Technician';
    isActive: boolean;
    lastLogin?: string;
    assignedVan?: { _id: string; name: string; locationType: string; vehicleNumber?: string };
    createdAt: string;
}

interface Location {
    _id: string;
    name: string;
    locationType: string;
    vehicleNumber?: string;
}

const roleConfig: Record<string, { label: string; icon: any; color: string }> = {
    Admin: { label: 'Admin', icon: Shield, color: 'bg-red-100 text-red-700' },
    Operations_Manager: { label: 'Ops Manager', icon: UserCheck, color: 'bg-blue-100 text-blue-700' },
    Field_Technician: { label: 'Technician', icon: Wrench, color: 'bg-amber-100 text-amber-700' },
};

export default function UserManagement() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<ERPUser[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Dialog state
    const [showDialog, setShowDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<ERPUser | null>(null);
    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: '', role: 'Field_Technician', assignedVan: ''
    });
    const [saving, setSaving] = useState(false);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string> = {};
            if (roleFilter) params.role = roleFilter;
            if (statusFilter) params.isActive = statusFilter;
            const data = await erpAuthAPI.listUsers(params);
            setUsers(data);
        } catch {
            toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [roleFilter, statusFilter, toast]);

    const loadLocations = useCallback(async () => {
        try {
            const data = await locationsAPI.list();
            setLocations(data.filter ? data.filter((l: Location) => l.locationType === 'Van') : []);
        } catch { /* non-critical */ }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { loadLocations(); }, [loadLocations]);

    const filteredUsers = users.filter(u => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q));
    });

    const openNewUser = () => {
        setEditingUser(null);
        setForm({ name: '', email: '', password: '', phone: '', role: 'Field_Technician', assignedVan: '' });
        setShowDialog(true);
    };

    const openEditUser = (user: ERPUser) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: '',
            phone: user.phone || '',
            role: user.role,
            assignedVan: user.assignedVan?._id || ''
        });
        setShowDialog(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingUser) {
                const updates: Record<string, any> = {
                    name: form.name,
                    phone: form.phone || undefined,
                    role: form.role,
                    assignedVan: form.assignedVan || null,
                };
                await erpAuthAPI.updateUser(editingUser._id, updates);
                toast({ title: 'User updated' });
            } else {
                if (!form.password || form.password.length < 8) {
                    toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
                    setSaving(false);
                    return;
                }
                await erpAuthAPI.createUser({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    phone: form.phone || undefined,
                    role: form.role,
                    assignedVan: form.assignedVan || undefined,
                });
                toast({ title: 'User created' });
            }
            setShowDialog(false);
            loadUsers();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (user: ERPUser) => {
        try {
            await erpAuthAPI.updateUser(user._id, { isActive: !user.isActive });
            toast({ title: user.isActive ? 'User deactivated' : 'User activated' });
            loadUsers();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        admins: users.filter(u => u.role === 'Admin').length,
        technicians: users.filter(u => u.role === 'Field_Technician').length,
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                        <p className="text-slate-500 mt-1">Manage staff accounts, roles &amp; permissions</p>
                    </div>
                    <Button onClick={openNewUser} className="gap-1.5"><Plus size={16} /> Add User</Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Users', value: stats.total, icon: Users, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-green-600 bg-green-50' },
                        { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-red-600 bg-red-50' },
                        { label: 'Technicians', value: stats.technicians, icon: Wrench, color: 'text-amber-600 bg-amber-50' },
                    ].map(s => {
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

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, or phone…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={v => setRoleFilter(v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-[170px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Operations_Manager">Ops Manager</SelectItem>
                            <SelectItem value="Field_Technician">Technician</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={loadUsers} size="icon"><RefreshCw size={16} /></Button>
                </div>

                {/* Users Table */}
                <Card className="border-0 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-8"><PromachLoader variant="inline" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="font-semibold">Name</TableHead>
                                    <TableHead className="font-semibold">Email</TableHead>
                                    <TableHead className="font-semibold">Phone</TableHead>
                                    <TableHead className="font-semibold">Role</TableHead>
                                    <TableHead className="font-semibold">Assigned Van</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Last Login</TableHead>
                                    <TableHead className="font-semibold text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-slate-400 py-10">
                                            {users.length === 0 ? 'No users found. Click "Add User" to create one.' : 'No users match your search.'}
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.map(user => {
                                    const rc = roleConfig[user.role] || roleConfig.Field_Technician;
                                    const RoleIcon = rc.icon;
                                    return (
                                        <TableRow key={user._id} className={`hover:bg-slate-50 ${!user.isActive ? 'opacity-60' : ''}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-slate-600 flex items-center justify-center text-white text-xs font-bold">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <Mail size={13} />
                                                    {user.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.phone ? (
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                        <Phone size={13} />
                                                        {user.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-sm">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${rc.color} border-0 font-medium gap-1`}>
                                                    <RoleIcon size={12} />
                                                    {rc.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.assignedVan ? (
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <Truck size={14} className="text-amber-600" />
                                                        <span>{user.assignedVan.name}</span>
                                                        {user.assignedVan.vehicleNumber && (
                                                            <span className="text-xs text-slate-400">({user.assignedVan.vehicleNumber})</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-sm">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`border-0 font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.lastLogin ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Clock size={12} />
                                                        {new Date(user.lastLogin).toLocaleDateString()}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">Never</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-1">
                                                    <Button size="sm" variant="ghost" title="Edit" onClick={() => openEditUser(user)}>
                                                        <Edit size={14} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title={user.isActive ? 'Deactivate' : 'Activate'}
                                                        className={user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}
                                                        onClick={() => toggleActive(user)}
                                                    >
                                                        {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div>
                            <Label>Full Name</Label>
                            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="john@promachpl.com"
                                disabled={!!editingUser}
                            />
                        </div>
                        {!editingUser && (
                            <div>
                                <Label>Password <span className="text-xs text-slate-400">(min 8 characters)</span></Label>
                                <Input
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••"
                                />
                            </div>
                        )}
                        <div>
                            <Label>Phone</Label>
                            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+65 9xxx xxxx" />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Operations_Manager">Operations Manager</SelectItem>
                                    <SelectItem value="Field_Technician">Field Technician</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {form.role === 'Field_Technician' && locations.length > 0 && (
                            <div>
                                <Label>Assigned Van</Label>
                                <Select value={form.assignedVan} onValueChange={v => setForm(p => ({ ...p, assignedVan: v === 'none' ? '' : v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select van…" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No van assigned</SelectItem>
                                        {locations.map(l => (
                                            <SelectItem key={l._id} value={l._id}>
                                                {l.name}{l.vehicleNumber ? ` (${l.vehicleNumber})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || !form.name || !form.email}>
                            {saving ? 'Saving…' : editingUser ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
