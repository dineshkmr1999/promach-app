import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsAPI } from '@/services/api';
import { TrendingUp, Users, Eye, ExternalLink } from 'lucide-react';

export default function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            const data = await analyticsAPI.getOverview();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading analytics...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div>
                <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600 mb-8">Website traffic and visitor insights (Last 30 days)</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Visits
                            </CardTitle>
                            <Eye className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{analytics?.totalVisits || 0}</div>
                            <p className="text-xs text-gray-500 mt-1">Page views</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Unique Visitors
                            </CardTitle>
                            <Users className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{analytics?.uniqueVisitors || 0}</div>
                            <p className="text-xs text-gray-500 mt-1">Different IP addresses</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Avg. Pages/Visit
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {analytics?.uniqueVisitors
                                    ? (analytics.totalVisits / analytics.uniqueVisitors).toFixed(1)
                                    : '0'
                                }
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Pages per visitor</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Pages */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Top Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics?.topPages && analytics.topPages.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.topPages.map((page: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <span className="font-medium">{page._id || '/'}</span>
                                        <span className="text-gray-600">{page.count} views</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No page data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Referrers */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Referrers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics?.topReferrers && analytics.topReferrers.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.topReferrers.map((referrer: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div className="flex items-center gap-2">
                                            <ExternalLink size={16} className="text-gray-400" />
                                            <span className="font-medium truncate max-w-md">{referrer._id}</span>
                                        </div>
                                        <span className="text-gray-600">{referrer.count} visits</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No referrer data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
