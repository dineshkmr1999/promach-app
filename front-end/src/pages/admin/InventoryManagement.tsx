import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function InventoryManagement() {
    return (
        <AdminLayout>
            <div className="max-w-5xl">
                <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
                <p className="text-gray-600 mb-8">Manage your products, parts, and stock levels</p>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            Coming Soon
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">
                            The Inventory Management module is being set up. You'll be able to manage products, track stock levels, and organize your inventory here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
