import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    DollarSign,
    Award,
    Image,
    MessageSquare,
    BarChart3,
    LogOut,
    Menu,
    X,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    Building2,
    FileText,
    Phone,
    Search,
    Palette,
    TrendingUp
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // CMS submenu items
    const cmsItems = [
        { path: '/admin/certificates', icon: Award, label: 'Certificates' },
        { path: '/admin/bca-registrations', icon: Building2, label: 'BCA Registrations' },
        { path: '/admin/pricing', icon: DollarSign, label: 'Pricing' },
        { path: '/admin/brands', icon: Palette, label: 'Brands' },
        { path: '/admin/company-info', icon: Building2, label: 'Company Info' },
        { path: '/admin/about-us', icon: FileText, label: 'About Us' },
        { path: '/admin/contact-us', icon: Phone, label: 'Contact Us' },
        { path: '/admin/seo', icon: Search, label: 'SEO Settings' },
        { path: '/admin/cro-settings', icon: TrendingUp, label: 'CRO Settings' },
    ];

    // Check if current page is a CMS page
    const isCMSActive = cmsItems.some(item => location.pathname === item.path);

    // CMS menu expanded state - synced with route
    const [isCMSExpanded, setIsCMSExpanded] = useState(isCMSActive);

    // Auto-collapse CMS menu when navigating to non-CMS pages
    useEffect(() => {
        if (!isCMSActive) {
            setIsCMSExpanded(false);
        }
    }, [location.pathname, isCMSActive]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    // Top-level nav items
    const topNavItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ];

    const bottomNavItems = [
        { path: '/admin/portfolio', icon: Image, label: 'Portfolio' },
        { path: '/admin/submissions', icon: MessageSquare, label: 'Submissions' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ];

    const isActive = (path: string, exact?: boolean) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const renderNavItem = (item: { path: string; icon: any; label: string; exact?: boolean }, isSubItem = false, closeCMSOnClick = false) => {
        const Icon = item.icon;
        const active = isActive(item.path, item.exact);

        return (
            <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (closeCMSOnClick) {
                        setIsCMSExpanded(false);
                    }
                }}
                className={`
                    flex items-center gap-3 ${isSubItem ? 'px-4 py-2.5 ml-4' : 'px-4 py-3'} rounded-xl transition-all duration-200
                    ${active
                        ? 'bg-gradient-to-r from-primary to-slate-600 text-white shadow-lg shadow-primary/25'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                `}
            >
                <Icon size={isSubItem ? 18 : 20} />
                <span className={`font-medium ${isSubItem ? 'text-sm' : ''}`}>{item.label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <nav className="bg-card border-b border-slate-200 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <div className="flex items-center gap-3 ml-2">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary to-slate-700 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">P</span>
                                </div>
                                <h1 className="text-xl font-bold text-slate-900">Promach Admin</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/"
                                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <ExternalLink size={14} />
                                View Site
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`
                        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                        lg:translate-x-0 
                        fixed lg:sticky top-16 left-0 z-40
                        w-64 bg-card border-r border-slate-200
                        transition-transform duration-300 ease-in-out
                        mt-16 lg:mt-0 h-[calc(100vh-4rem)]
                        overflow-y-auto
                    `}
                >
                    <nav className="p-4 space-y-1">
                        {/* Dashboard */}
                        {topNavItems.map((item) => renderNavItem(item, false, true))}

                        {/* CMS Accordion */}
                        <div className="pt-2">
                            <button
                                onClick={() => setIsCMSExpanded(!isCMSExpanded)}
                                className={`
                                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                                    ${isCMSActive && !isCMSExpanded
                                        ? 'bg-gradient-to-r from-primary to-slate-600 text-white shadow-lg shadow-primary/25'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={20} />
                                    <span className="font-medium">CMS</span>
                                </div>
                                {isCMSExpanded ? (
                                    <ChevronDown size={18} />
                                ) : (
                                    <ChevronRight size={18} />
                                )}
                            </button>

                            {/* CMS Submenu */}
                            {isCMSExpanded && (
                                <div className="mt-1 space-y-0.5 border-l-2 border-slate-200 ml-6">
                                    {cmsItems.map((item) => renderNavItem(item, true))}
                                </div>
                            )}
                        </div>

                        {/* Bottom nav items */}
                        <div className="pt-2 border-t border-slate-100 mt-2">
                            {bottomNavItems.map((item) => renderNavItem(item, false, true))}
                        </div>
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Logged in as</p>
                            <p className="text-sm font-medium text-slate-700 truncate">Administrator</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>

            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
