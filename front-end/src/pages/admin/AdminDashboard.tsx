import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Image, BarChart, TrendingUp, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { analyticsAPI, submissionsAPI, portfolioAPI } from '@/services/api';
import { Button } from '@/components/ui/button';

interface DashboardStats {
    totalSubmissions: number;
    portfolioItems: number;
    pageViews: number;
    uniqueVisitors: number;
    recentSubmissions: any[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalSubmissions: 0,
        portfolioItems: 0,
        pageViews: 0,
        uniqueVisitors: 0,
        recentSubmissions: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [analyticsData, submissionsData, portfolioData] = await Promise.all([
                analyticsAPI.getOverview().catch(() => ({ totalViews: 0, uniqueVisitors: 0 })),
                submissionsAPI.getAll().catch(() => []),
                portfolioAPI.getAll().catch(() => ({ items: [] }))
            ]);

            setStats({
                totalSubmissions: Array.isArray(submissionsData) ? submissionsData.length : 0,
                portfolioItems: portfolioData?.items?.length || portfolioData?.length || 0,
                pageViews: analyticsData?.totalViews || 0,
                uniqueVisitors: analyticsData?.uniqueVisitors || 0,
                recentSubmissions: Array.isArray(submissionsData) ? submissionsData.slice(0, 5) : []
            });
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Dashboard fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const statCards = [
        {
            title: 'Total Submissions',
            value: stats.totalSubmissions,
            icon: FileText,
            gradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Portfolio Items',
            value: stats.portfolioItems,
            icon: Image,
            gradient: 'from-emerald-500 to-emerald-600',
            bgLight: 'bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            title: 'Page Views',
            value: stats.pageViews,
            icon: BarChart,
            gradient: 'from-slate-500 to-slate-600',
            bgLight: 'bg-slate-50',
            iconColor: 'text-slate-600'
        },
        {
            title: 'Unique Visitors',
            value: stats.uniqueVisitors,
            icon: Users,
            gradient: 'from-amber-500 to-amber-600',
            bgLight: 'bg-amber-50',
            iconColor: 'text-amber-600'
        },
    ];

    const quickActions = [
        {
            title: 'Manage Portfolio',
            description: 'Add or edit portfolio items',
            href: '/admin/portfolio',
            icon: Image,
            color: 'bg-gradient-to-br from-emerald-500 to-teal-600'
        },
        {
            title: 'Update Pricing',
            description: 'Manage service pricing tables',
            href: '/admin/pricing',
            icon: TrendingUp,
            color: 'bg-gradient-to-br from-blue-500 to-indigo-600'
        },
        {
            title: 'View Submissions',
            description: 'Check form submissions',
            href: '/admin/submissions',
            icon: FileText,
            color: 'bg-gradient-to-br from-slate-500 to-slate-700'
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Welcome to Promach Admin Panel</p>
                    </div>
                    <Button
                        onClick={fetchDashboardData}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                        <Button
                            onClick={fetchDashboardData}
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card
                                key={stat.title}
                                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.03]`} />
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.bgLight}`}>
                                        <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="h-9 w-20 bg-slate-200 rounded animate-pulse" />
                                    ) : (
                                        <div className="text-3xl font-bold text-slate-900">
                                            {stat.value.toLocaleString()}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <a
                                        key={action.title}
                                        href={action.href}
                                        className="group relative p-6 bg-card border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                                        <p className="text-sm text-slate-500">{action.description}</p>
                                    </a>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Submissions */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-900">Recent Submissions</CardTitle>
                        <a href="/admin/submissions" className="text-sm text-primary hover:underline">
                            View All →
                        </a>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : stats.recentSubmissions.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentSubmissions.map((submission, index) => (
                                    <div
                                        key={submission._id || index}
                                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${submission.status === 'completed' ? 'bg-emerald-100' :
                                            submission.status === 'pending' ? 'bg-amber-100' : 'bg-blue-100'
                                            }`}>
                                            {submission.status === 'completed' ? (
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            ) : (
                                                <Clock className="h-5 w-5 text-amber-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">
                                                {submission.name || submission.email || 'Anonymous'}
                                            </p>
                                            <p className="text-sm text-slate-500 truncate">
                                                {submission.service || submission.type || 'General Inquiry'}
                                            </p>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>No submissions yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Backend Status */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                        <h3 className="font-semibold text-emerald-800">Backend Connected</h3>
                        <p className="text-sm text-emerald-700">
                            All changes are automatically synced to the database.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
